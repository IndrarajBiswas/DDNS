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

## Getting Started (Local Setup & Run)

These steps let you run the full system (contracts, resolver, gateway) locally for development / testing.


### Prerequisites

- Node.js 18+  
- npm (or pnpm / yarn)  
- Git  
- Optionally: Docker (if you containerize parts)  

### Clone & Install

```bash
git clone https://github.com/IndrarajBiswas/DDNS.git
cd DDNS
npm install
```

### Install Dependencies
To work on resolver or gateway packages you may also install their local dependencies:
```bash
cd resolver && npm install
cd ../client/gateway && npm install
```


### Setup Enviroment Variables
```bash
cp .env.example .env
cp resolver/.env.example resolver/.env
cp client/gateway/.env.example client/gateway/.env
``````
RPC_URL=""
CHAIN_ID=""
PRIVATE_KEY=""
TOKEN_NAME=Ethereum
TOKEN_SYMBOL=ETH
TOKEN_CAP=2000000
TOKEN_INITIAL=1000000
TOKEN_ADDRESS=""
```
Edit the ```.env``` file to include:
- Ethereum RPC (e.g. RPC_URL)
- Private key(s) for deployment
- Registry contract address (for resolver/gateway)
- Any other secrets required by those services


### Compile & Test Contracts

```bash
npm run compile
npm test

```
This will compile smart contracts and run unit tests.

### Deploy Locallly (Hardhat)
1. Start a Hardhat local node
```bash 
npx hardhat node
```
2. In a separate terminal, deploy the contracts
```bash
npm run deploy
```
3. After deploymeny, you'll get a deployed ```DomainRegistry``` contract address → Insert that address into ```resolver/.env``` under the relevant variable (e.g., ```REGISTRY_ADDRESS```).

### Start the Resolver

```bash
cd resolver
npm run start
```

It exposes APIs like:
- ```POST /resolver``` -- expects payload ```{"domain": "example.eth", "recordType": "A"}``` → returns record + metadata
- ```GET /health``` — for health check

### Start the Gateway 
```bash
cd client/gateway
npm run start
```

Exposes:
- ```POST /resolve``` — verifies resolver results, caches them with TTL
- ```GET /health``` — service status
Once both are running, requests to the gateway will ultimately verify and serve DNS responses based on on-chain data.

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


## Project Board & Tracking

We use a GitHub Project Board to track user stories, backlog, in-progress, done, etc.
    - GitHub Project board: https://github.com/orgs/DDNS-Labs/projects/1
    - Weekly updates: docs/updates
    - We keep Backlog, In Progress, Review, Done columns
    - Each user story is added as a card with acceptance criteria, estimates, and owner

## Peer-Testing Confirmation

“The above setup instructions were tested by [Indy] on [Linux, Node 22, Hardhat local]. Everything worked as described.”


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

## Assumptions & Notes

- We currently use Hardhat + Solidity for the smart contract track
- The resolver and gateway are built in TypeScript / Node
- You can swap to testnet (e.g. Sepolia) by adjusting RPC_URL and deploying appropriately
- Future enhancements: governance, dispute resolution modules, browser plugin, etc.

### Images of Project Board
<img width="1321" height="868" alt="image" src="https://github.com/user-attachments/assets/c7fb0fd9-45ea-4c17-a7f4-3372786d858e" />

<img width="801" height="281" alt="image" src="https://github.com/user-attachments/assets/340af1cb-f5f1-457b-8808-0cc48cd5bb0e" />

