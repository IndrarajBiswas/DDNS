import { ethers } from 'hardhat';

async function main() {
  const defaultTtl = Number(process.env.DEFAULT_TTL ?? 300);
  const registrationPeriod = Number(process.env.REGISTRATION_PERIOD ?? 60 * 60 * 24 * 30);

  const factory = await ethers.getContractFactory('DomainRegistry');
  const contract = await factory.deploy(defaultTtl, registrationPeriod);
  await contract.waitForDeployment();

  console.log(`DomainRegistry deployed to: ${await contract.getAddress()}`);
  console.log(`Default TTL: ${defaultTtl} seconds`);
  console.log(`Registration Period: ${registrationPeriod} seconds`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
