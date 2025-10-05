# Blockchain-Anchored DNS (DDNS)

An Ethereum-powered decentralized DNS prototype designed to resist DDoS attacks, cache poisoning, and centralized outages. The system anchors domain ownership and record updates on-chain while resolvers and client gateways verify signed proofs before serving answers.

## Vision

> "Blockchain-anchored DNS for DDoS Prevention — immutable domain resolution resistant to cache poisoning, hijacking, and central failure."

The platform combines:

- **On-chain governance and record storage** (Hardhat + Solidity contracts).
- **Resolver microservices** that validate records directly against chain state.
- **Client-side gateways/plugins** that intercept DNS requests, enforce proof validation, and maintain safe caches.

## Repository Layout

```
contracts/            # Solidity sources (DomainRegistry MVP)
client/gateway/       # Local HTTP gateway that proxies DNS lookups through the resolver with caching
resolver/             # Fastify-based resolver that queries on-chain records and emits signed proofs
scripts/              # Hardhat deployment scripts
test/                 # Hardhat test suites
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)
- An Ethereum RPC endpoint (Hardhat local node or Sepolia testnet)

### Project Board & Tracking

- GitHub Project board: https://github.com/orgs/DDNS-Labs/projects/1
- Weekly updates: [`docs/updates`](docs/updates/)

### Install Dependencies

```bash
npm install
```

To work on resolver or gateway packages you may also install their local dependencies:

```bash
cd resolver && npm install
cd ../client/gateway && npm install
```

### Environment Variables

Copy the provided examples and update secrets as needed.

```bash
cp .env.example .env
cp resolver/.env.example resolver/.env
cp client/gateway/.env.example client/gateway/.env
```

### Compile & Test Contracts

```bash
npm run compile
npm test
```

> ✅ The setup steps were peer-tested by Indy on macOS (M1) using Node 18 and the Hardhat local network.

### Deploy to a Local Hardhat Node

```bash
npx hardhat node
npm run deploy
```

Record the deployed `DomainRegistry` address and update `resolver/.env` with the value.

### Start the Resolver

```bash
cd resolver
npm install
npm run start
```

The resolver exposes:

- `POST /resolve` – accepts `{ "domain": "example.eth", "recordType": "A" }` and returns the on-chain record payload.
- `GET /health` – health probe endpoint.

### Start the Gateway

```bash
cd client/gateway
npm install
npm run start
```

The gateway provides a local HTTP service with:

- `POST /resolve` – verifies responses via the resolver and caches them with TTL enforcement.
- `GET /health` – service health status.

These components form the basis for browser extensions or system-level DNS proxies.

## Smart Contract Overview

`DomainRegistry.sol` implements the MVP registry:

- **Registration & Renewal** – owner-authorized registration with configurable registration periods.
- **Ownership Transfers** – domain owners can transfer control to new addresses.
- **Record Management** – typed records (`A`, `AAAA`, `CNAME`, etc.) with TTL metadata and update timestamps.
- **Expiration Enforcement** – expired domains become inaccessible until renewed.

Events emitted by the contract can be indexed to build off-chain caches or consensus-based resolver layers.

## Resolver Service

- Connects to an Ethereum RPC provider.
- Loads the registry ABI from compiled Hardhat artifacts (configurable via `REGISTRY_ABI_PATH`).
- Resolves record hashes (`keccak256(recordType)`) and returns structured JSON responses with TTL & freshness metadata.
- Includes error handling for missing records, misconfiguration, or RPC failures.

Future enhancements include signing responses and federating multiple resolver nodes for voting/consensus.

## Client Gateway

- Acts as a local HTTP proxy for DNS lookups.
- Validates responses from the resolver and applies bounded caching to prevent stale record reuse.
- Designed to evolve into a browser extension or local DNS forwarder.

## Roadmap & Milestones

Aligned with the project plan:

- **W6** Literature review (BDNS, TI-DNS, Phicoin DDNS, DagGridLedger, Setonix).
- **W7** Architecture finalization & contract scaffolding ✅ (initial registry implemented here).
- **W8** Registration/update flows + contract tests ✅
- **W9** Resolver prototype ✅
- **W10** Client gateway skeleton ✅
- **W11** Caching & performance experiments (pending).
- **W12** Security & threat modelling (pending).
- **W13** Stretch goals: multi-resolver voting, IPFS integration (pending).
- **W14** Evaluation, benchmarking, and documentation (pending).

## Next Steps

- Implement signed resolver responses and verification logic in the gateway.
- Add governance/dispute resolution smart contracts.
- Integrate performance benchmarking scripts and threat-model test cases.
- Explore decentralized storage backends (IPFS) for large record payloads.
- Prototype browser extension or system DNS interceptors leveraging the gateway service.

## References

1. Giamouridis, G., Kang, B., Aniello, L. (2024). *Blockchain-based DNS: Current Solutions and Challenges*. CEUR Workshop Proceedings.
2. DagGridLedger research on sharded DAG DNS architectures.
3. Fu, Y., Wei, J., Li, Y., Peng, B., Li, X. (2023). *TI-DNS: A Trusted and Incentive DNS Resolution Architecture based on Blockchain*. arXiv preprint.
4. Yang, G. et al. (2025). *Blockchain-Based Decentralized Domain Name System*. arXiv preprint.
