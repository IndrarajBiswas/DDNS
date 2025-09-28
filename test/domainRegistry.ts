import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('DomainRegistry', () => {
  const defaultTtl = 60;
  const registrationPeriod = 60 * 60 * 24 * 30; // 30 days

  async function deploy() {
    const [owner, registrant, newOwner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('DomainRegistry');
    const contract = await factory.deploy(defaultTtl, registrationPeriod);
    await contract.waitForDeployment();
    return { contract, owner, registrant, newOwner };
  }

  const label = 'example.eth';
  const aRecordType = ethers.id('A');

  it('registers, updates, and resolves records', async () => {
    const { contract, owner, registrant } = await deploy();
    await expect(contract.connect(owner).register(label, registrant.address)).to.emit(
      contract,
      'DomainRegistered'
    );

    await expect(
      contract
        .connect(registrant)
        .setRecord(label, aRecordType, '203.0.113.10', 120)
    )
      .to.emit(contract, 'RecordUpdated')
      .withArgs(label, aRecordType, '203.0.113.10', 120);

    const record = await contract.getRecord(label, aRecordType);
    expect(record.value).to.equal('203.0.113.10');
    expect(record.ttl).to.equal(120);
  });

  it('prevents non-owners from mutating records', async () => {
    const { contract, owner, registrant, newOwner } = await deploy();
    await contract.connect(owner).register(label, registrant.address);

    await expect(
      contract.connect(newOwner).setRecord(label, aRecordType, '203.0.113.11', 60)
    ).to.be.revertedWithCustomError(contract, 'Unauthorized');
  });

  it('expires domains and blocks access', async () => {
    const { contract, owner, registrant } = await deploy();
    await contract.connect(owner).register(label, registrant.address);

    await ethers.provider.send('evm_increaseTime', [registrationPeriod + 1]);
    await ethers.provider.send('evm_mine', []);

    await expect(contract.getDomainOwner(label)).to.be.revertedWithCustomError(
      contract,
      'DomainExpired'
    );
  });
});
