import Fastify from 'fastify';
import pino from 'pino';
import { config } from 'dotenv';
import { ethers } from 'ethers';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

config();

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

const querySchema = z.object({
  domain: z.string().min(1),
  recordType: z.string().min(1)
});

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL ?? 'http://127.0.0.1:8545');

const registryAddress = process.env.REGISTRY_ADDRESS;
if (!registryAddress) {
  logger.warn('REGISTRY_ADDRESS not set. Resolver will operate in read-only mode.');
}

let registryContract: ethers.Contract | undefined;

if (registryAddress) {
  const artifactPath =
    process.env.REGISTRY_ABI_PATH ??
    path.resolve(process.cwd(), '../artifacts/contracts/DomainRegistry.sol/DomainRegistry.json');

  let abi: unknown;
  try {
    const artifact = JSON.parse(readFileSync(artifactPath, 'utf-8')) as { abi: unknown };
    abi = artifact.abi;
  } catch (error) {
    logger.error({ err: error, artifactPath }, 'failed to load registry ABI');
  }

  if (abi) {
    registryContract = new ethers.Contract(registryAddress, abi, provider);
  }
}

const server = Fastify({ logger });

server.get('/health', async () => ({ status: 'ok' }));

server.post('/resolve', async (request, reply) => {
  const body = querySchema.safeParse(request.body);
  if (!body.success) {
    return reply.status(400).send({ error: body.error.message });
  }
  if (!registryContract) {
    return reply.status(503).send({ error: 'Registry contract not configured' });
  }

  const { domain, recordType } = body.data;
  try {
    const recordKey = ethers.id(recordType);
    const record = await registryContract.getRecord(domain, recordKey);
    if (!record.value) {
      return reply.status(404).send({ error: 'Record not found' });
    }

    return {
      domain,
      recordType,
      value: record.value,
      ttl: Number(record.ttl),
      lastUpdated: Number(record.lastUpdated)
    };
  } catch (error) {
    request.log.error({ err: error }, 'failed to resolve domain');
    return reply.status(500).send({ error: 'Resolution failed' });
  }
});

async function start() {
  try {
    const port = Number(process.env.PORT ?? 8787);
    await server.listen({ port, host: '0.0.0.0' });
    logger.info(`Resolver listening on ${port}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

start();
