# Week 6 Update — DDNS

## Progress (3/3)
- Finalized project topic: **Blockchain-anchored DNS for DDoS Prevention**.
- Conducted background study on DNS vulnerabilities such as cache poisoning, hijacking, and central failure.
- Reviewed key related works like BDNS, TI-DNS, Phicoin DDNS, and DagGridLedger to understand current decentralized DNS approaches.
- Defined initial project goals: to design a decentralized, tamper-resistant DNS registry using Ethereum smart contracts.
- Discussed and outlined core system components — on-chain registry, resolver validation, and client gateway — at a conceptual level.

## Evidence (3/3)
- Draft project proposal document completed and uploaded (`docs/proposal/Project_Proposal.docx`).
- Initial folder structure created (`docs/updates/`, `docs/security/`, `contracts/`, etc.).
- Brainstorm meeting notes and references compiled in a shared Google Doc (linked internally).
- Reference papers collected and cited for comparative analysis.

## Technical Depth (2/2)
- Explored how Ethereum-based smart contracts can store DNS records with verifiable ownership.
- Studied the ENS (Ethereum Name Service) architecture as a reference model for domain registration and lookup.
- Identified potential use of off-chain indexers and resolver caching to reduce latency.
- Considered governance and dispute resolution requirements within a decentralized DNS environment.

## Next Plan (1/1)
- Begin designing the system architecture diagram and defining smart contract interfaces (`DomainRegistry`, `AccessControl`).
- Set up a local Hardhat environment and verify connectivity to a testnet.
- Assign team members to literature review and architecture documentation tasks.

## Collaboration (1/1)
- Gabby implemented the Solidity skeleton + deploy script, Vien authored the resolver stub, Dheeraj maintained the resolver <> gateway wiring, and Indy executed the peer verification pass on the README runbook.
- Weekly sync held Sunday to assign issues on the GitHub project board (backlog now tracks MVP + stretch stories).

_Updated by: Dheeraj Kumar_  
_Date: 2025-10-05_
