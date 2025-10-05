# DDNS Prototype Demonstration Script

This script outlines a demonstration of the **Blockchain-Anchored DNS (DDNS)** prototype, showcasing the key components and the immutable, verifiable nature of domain resolution.

## I. Setup

1.  **Start Services:**
    * Hardhat local node (`npx hardhat node`)
    * Deployment script (`npm run deploy`)
    * Resolver** service (`cd resolver && npm run start`)
    * Client Gateway (`cd client/gateway && npm run start`)
    * Notes: 
    * the **Hardhat blockchain** for immutability
    * the **Resolver** to read records
    * the **Client Gateway** which simulates a user's local DNS proxy

---

## II. On-Chain Registration & Update

**Objective:** Demonstrate that domain records are truly anchored on-chain using the `DomainRegistry.sol` contract.

1.  **Initial State Check (Failure):**
    * Use the `resolver` endpoint to check for an un-registered domain, e.g., `resolve("demo-test.eth")`.
    * *Expected Output:* An error or empty response indicating "Domain Not Found."
    * *Narration:* "The resolver confirms: no record exists on the blockchain yet."

2.  **Contract Interaction (Registration):**
    * Execute a Hardhat script to register a new domain and set its `A` record.
    * *Command:* `npx hardhat run scripts/register-demo-domain.js --network localhost` (Assume this script is pre-written).
    * *Narration:* "We're now sending a transaction to the `DomainRegistry` contract, registering 'demo-test.eth' with an IP address of '192.0.2.42'. This anchors the ownership and record on the Ethereum chain."

3.  **On-Chain Verification (Success):**
    * Run the same `resolver` check from step 1.
    * *Expected Output:* A JSON response containing `domain: "demo-test.eth"`, `recordType: "A"`, `value: "192.0.2.42"`, and **TTL/freshness metadata**.
    * *Narration:* "The resolver instantly fetches the record directly from the contract state. The TTL metadata is also included, which is crucial for client-side caching."

---

## III. Client Gateway & Cache Behavior

**Objective:** Illustrate how the Client Gateway enforces record freshness and prevents cache poisoning.

1.  **First Gateway Resolve (Cache Miss):**
    * Use the `gateway` endpoint for the first time.
    * *Command:* `curl -X POST http://localhost:8081/resolve -H "Content-Type: application/json" -d '{ "domain": "demo-test.eth", "recordType": "A" }'`
    * *Narration:* "The gateway contacts the resolver, validates the record, and caches it. This request was a **cache miss**."

2.  **Second Gateway Resolve (Cache Hit):**
    * Immediately run the same `curl` command.
    * *Expected Behavior:* The response is *instantaneous*.
    * *Narration:* "This is a **cache hit**. The gateway served the record from its safe, local cache, saving an expensive blockchain read."

3.  **Contract Interaction (Record Update):**
    * Execute a Hardhat script to update the domain's IP address.
    * *Command:* `npx hardhat run scripts/update-demo-domain.js --network localhost` (New IP: `192.0.2.99`).
    * *Narration:* "We are now forcing a new, verifiable update on the blockchain."

4.  **Third Gateway Resolve (Forced Cache Refresh):**
    * Run the `curl` command again.
    * *Expected Behavior:* A brief delay, followed by the **new** IP (`192.0.2.99`).
    * *Narration:* "The gateway detected the cache was now **stale** (or the TTL expired), forced a new resolution via the resolver, and updated its cache with the new, verified on-chain data. This mechanism ensures no stale or poisoned records can be served."

---

## IV. Conclusion

**Objective:** Summarize the benefits and point to future work.

* *Summary:* "We've demonstrated a verifiable, end-to-end resolution process where domain records are immutable, and the client-side gateway enforces freshness, effectively eliminating the risk of cache poisoning and central outages."
* *Future:* "Our next steps include adding **signed resolver responses** and **multi-resolver voting** for even stronger consensus and security."