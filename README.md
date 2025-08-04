# Blockchain From Scratch

> **Ongoing Project** – Building a minimal UTXO-based blockchain from the ground up to gain a deep, hands-on understanding of how Bitcoin-style systems work.

---

## 🚀 Project Overview

This repository is an evolving learning lab. Each day, new features go in to explore core blockchain concepts:

- **UTXO Model** – Track unspent transaction outputs and build a reliable ledger.  
- **Mempool** – Collect, validate, and prioritize pending transactions before mining.  
- **Signing & Verification** – Use public/private key cryptography to sign transactions and guarantee authenticity.  
- **Miner Fees** – Enforce fee markets so miners are rewarded fairly and users compete for block space.  
- **Proof-of-Work Mining** – Implement a hash-puzzle mechanism to secure the chain and regulate issuance.  
- **Block & Chain Validation** – Verify every block’s proof-of-work, transaction integrity, and consensus rules.  
- **Fork Handling & Longest-Chain Rule** – Track side-branches, reorganize on heavier work, and converge on a single history.

---

## 📦 Features (In Progress)

- **Transaction Lifecycle**  
  - Create, serialize, and hash transactions.  
  - Sign with ECDSA; verify signatures on every node.  
  - Enforce correct input→output sums + fee extraction.

- **Mempool Management**  
  - In-memory pool indexed by TX ID, fee-rate priority queue, and UTXO locks.  
  - Reject double-spends and low-fee spam.  
  - Emit `transactionAdded` events for miners and UIs.

- **Mining & Rewards**  
  - Assemble candidate blocks from top-fee TXs + coinbase reward.  
  - Adjustable difficulty & target suppression via leading-zero hashes.  
  - Add total fees to miner’s reward output.

- **Chain Storage & Traversal**  
  - Store blocks in a hash map; compute max-height tip on every addition.  
  - Unfold parent pointers to extract the canonical “longest chain.”  
  - Handle orphans and side forks until one branch wins.

- **Utilities & Tools**  
  - CLI scripts to bootstrap a test network of nodes and wallets.  
  - Automated tests: unit suites for `UTXOPool`, `Transaction`, `Block`, and integration flows (wallet → mempool → miner → chain).  
  - Sample fixtures for default transactions and wallets.

---

## ⚙️ Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/blockchain-from-scratch.git
   cd blockchain-from-scratch
   ```
2. **Install dependencies**  
   ```bash
   npm install
   ```
3. **Run tests**  
   ```bash
   npm test
   ```

> _Building blockchains one line of code at a time._  

