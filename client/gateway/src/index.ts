import { config } from 'dotenv';
import Fastify from 'fastify';
import pino from 'pino';
import axios from 'axios';
import { z } from 'zod';

config();

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
const resolverUrl = process.env.RESOLVER_URL ?? 'http://127.0.0.1:8787';
const cacheTtlSeconds = Number(process.env.CACHE_TTL_SECONDS ?? 60);
const cache = new Map<string, { value: string; expiresAt: number; ttl: number }>();

const requestSchema = z.object({
  domain: z.string().min(1),
  recordType: z.string().default('A')
});

const server = Fastify({ logger });

server.get('/health', async () => ({ status: 'ok' }));

server.post('/resolve', async (request, reply) => {
  const parsed = requestSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.message });
  }

  const { domain, recordType } = parsed.data;
  const cacheKey = `${domain}:${recordType}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return { ...cached, source: 'cache' };
  }

  try {
    const response = await axios.post(
      `${resolverUrl}/resolve`,
      { domain, recordType },
      { timeout: Number(process.env.RESOLVER_TIMEOUT_MS ?? 2_000) }
    );
    const payload = response.data as { value: string; ttl: number; lastUpdated: number };
    const ttl = Math.min(payload.ttl, cacheTtlSeconds);
    cache.set(cacheKey, {
      value: payload.value,
      ttl,
      expiresAt: now + ttl * 1000
    });
    return {
      domain,
      recordType,
      value: payload.value,
      ttl,
      proof: {
        lastUpdated: payload.lastUpdated
      },
      source: 'resolver'
    };
  } catch (error) {
    request.log.error({ err: error }, 'resolver lookup failed');
    return reply.status(502).send({ error: 'Resolver lookup failed' });
  }
});

async function start() {
  const port = Number(process.env.PORT ?? 5354);
  try {
    await server.listen({ port, host: '0.0.0.0' });
    logger.info(`Gateway listening on ${port}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

start();
