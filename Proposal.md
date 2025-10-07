# Blockchain-anchored DNS for DDoS Prevention — immutable domain resolution resistant to chase poisoning, hijacking, and central failure.

“A decentralized DNS architecture that thwarts malicious redirection, cache tampering, and centralized outages by combining on-chain records resolver verification, and incentive mechanism.."

## Problem and Stakeholders

The current DNS infrastructure is vulnerable: centralized points (root, TLD, authoritative servers) are frequent targets in DDoS attacks or hijacks, and cache poisoning can silently redirect large user bases to malicious sites. [1]
End-users, content providers, ISPs, and regulators suffer from outages, trust loss, phishing, or censorship. A robust decentralized DNS would directly benefit end-users (safety), operators (resilience), and auditors/regulators (verifiable trust).

## Research Alignment

This research extends the **Supply-chain traceability** theme by treating DNS resolution as a traceable, auditable chain of proof. It also strongly intersects with **IoT + Blockchain**, since robust DNS underpins secure IoT connectivity and telemetric communication.

## Platform and Rationale
**Platform: Ethereum (Hardhat / testnet)**
**Rationale:**
    - Ethereum offers mature support for smart contracts, wallets, and developer tooling, enabling faster prototyping and adaption.
    - The ENS ecosystem already demonstrates how domain-like systems can function in Ethereum, giving useful reference patterns.
    - For our purposes, we can build hybrid layers (on-chain registry + off-chain indexing) to offset latency, while leveraging Ethereum’s security guarantees.
Alternate options (e.g. custom chain or DAG architecture) exist (e.g. DagGridLedger) [2], but Ethereum provides an ecosystem-tested foundation for prototyping.

## MVP Features + Stretch
**MVP Features (by week 10):**
    1. On-chain domain registration + Update (A / AAAA / CNAME records) with cryptographic proof.
    2. Resolver module that validates on-chain records and returns signed proofs to clients.
    3. Browser plugin or local gateway that intercepts DNS resolution to validate against proofs.
    4. Benchmarking record latency. Throughput under load, cache efficiency.

**Stretch Targets:**
    - Multi-resolver voting to detect and mitigate forged DNS entries (inspired by TI-DNS) [3].
    - Integration with IPFS or decentralized storage for content-addressed record storage (as in Phicoin DDNS) [4].

## Architecture Sketch

<img width="1900" height="1330" alt="image" src="https://github.com/user-attachments/assets/707a3e28-3ef7-4ed3-978a-05b6c59265a1" />


**Description / FLow**
    - **Smart Contracts (on-chain):**
        - Domain registry contract: manages registrations, renewals, transfers, and updates.
        - Access / governance contract: handles dispute resolution, expiration, revocation.
    - **Blockchain Ledger:** stores domain ownership, record pointers, zone metadata.
    - **Resolvers / Validation Nodes:** query on-chain state, validate record signatures, possibly run a multu-resolver voting mechanism, produce signed responses.
    - **Client Gateway / Plugin:** intercept DNS request, forwards to resolver(s), verifies signed proofs before trusting results.
    - **Off-Chain Cache / Indexer:** caches signed proofs, serves frequent queries with lower latency,
    - **Bridging Layer (optional):** fallback to conventional DNS or compatibility gateways to handle legacy domains.
On-chain transactions cover registration / update/ governance, query/resolver flows take place off-chain but validate cryptographically.

## Security and Privacy Requirements

   - **Integrity / Authenticity:** Domain records must be signed by the domain owner’s private key, and smart contracts enforce access control and update rules.
    - **Resolver Resistance to poisoning:** Use multi-resolver consensus / voting to detect malicious responses (inspired by TI-DNS) [3].
    - **Cache Safety:** Signed proofs have expiration/freshness metadata. Clients reject stale or conflicting proofs.
    - **Rate Limiting & DoS Protection:** Resolver APIs will enforce query throughput caps; clients may be charged (or staked) for high-volume use.
    - **Privacy of Queries:** Optionally integrate query obfuscation, aggregation, or differential privacy techniques so that adversaries can’t infer user interest from traffic patterns.
    - **Governance & Dispute Resolutions:** Smart contracts must allow revocation or conflict resolution (e.g. trademark disputes), but with transparent logs and immutable history.

## Milestones

- W6: Deep literature review: BDNS, TI-DNS, Phicoin DDNS, DagGridLedger, Setonix.
- W7: Finalize architecture + initial contract scaffolding ( registry, update).
- W8: Implement domain registration && update flows (on-chain + contact test).
- W9: Build resolver prototype (on-chain query, record validation).
- W10: Client plugin /gateway + end-to-end demo (domain →resolver IP).
- W11: Cache and performance optimization (indexer, proof caching).
- W12: Security & threat modeling (attack scenarios: poisoning, hijack, collusion).
- W13: (Stretch) Multi-resolver voting, or IPFS integration.
- W14: Evaluation, experiments (latency, throughput, resilience), and write-up draft.

## Team and Roles + Logistics

- **Research Lead / PM:** Literature, design, evaluation plan.
- **Smart Contract Developer:** Domain registry, governance, access policies.
- **Backend / Resolver Developer:** resolver logic, multi-voting, cache indexer.
- **Fronted Developer:** plugin/gateway, client integration.
- **DevOps / Test / Benchmarking:** Infrastructure, stress testing, DDoS simulation
Weekly standup. Discord channel. GitHub repo for version control and collaboration.

## Top Risks and Mitigations

1. **Scalability / Latency Constraints:** Blockchain lookups may be slow under load – mitigate via off-chain cache, batch queries, sharding or DAG strategies (e.g. DagGridLedger) [2].
2. **Resolver / Voting Collusion or Malicious Nodes:** if multiple resolver nodes collude they may fabricate proofs. Mitigate via incentive / stake-based penalties, diversity of nodes audits, cross-checking.
3. **Adaption & Compatibility:** Clients / ISPs may resist new DNS workflows – mitigate via plugin/gateway fallback, backward compatibility bridges, and usability focus.

## References

[1]	Giamouridis, G., Kang, B., Aniello, L. (2024). Blockchain-based DNS: Current Solutions and Challenges. CEUR Workshop Proceedings.
[2]	Others) Research on DagGridLedger (sharded + DAG for DNS)
[3]	Fu, Y., Wei, J., Li, Y., Peng, B., Li, X. (2023). TI-DNS: A Trusted and Incentive DNS Resolution Architecture based on Blockchain. ArXiv preprint.
[4]	Yang, G. et al. (2025). Blockchain-Based Decentralized Domain Name System. ArXiv preprint.
