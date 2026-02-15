# 🎓 Private Student Disciplinary Registry (SDR)

> **Verifiable Accountability. Absolute Privacy.**  
> A privacy-centric decentralized application on the Midnight Network that allows educational institutions to manage disciplinary records without compromising student identity.

![SDR Dashboard](./public/screenshots/Screenshot%202026-02-15%20183029.png)

---

## 📖 Overview

The **Private Student Disciplinary Registry** transforms traditional, centralized disciplinary systems into a **decentralized, privacy-preserving infrastructure**. Built on Midnight's **Compact** language, it ensures that while a student's history is immutable and verifiable, their personal data never leaves their local environment.

### The Problem
Traditional records are either opaque or overly exposed. Sharing a "permanent record" often harms a student's future through bias or data leaks.

### The Solution: Trust + Privacy
SDR uses **Zero-Knowledge Proofs (ZKP)** to prove facts about a student's record (e.g., "This student has 0 serious incidents") without revealing the student's name or the specific details of the incidents to the public ledger.

---

## ✨ Key Features

*   🔒 **Privacy by Design** – Student IDs are hashed locally. Only a cryptographic commitment is stored on-chain.
*   🛡️ **ZK-Verified Queries** – Institutions verify student standing via Zero-Knowledge proofs.
*   📊 **Dynamic Severity Status** – Records are automatically categorized (Clear, Warning, Critical) based on verifiable incident counts.
*   ⚡ **Secure Proof Generation** – Real-time snark-proof execution directly in the browser.
*   🏫 **Authorized Recording** – Only registered school wallets can sign incident updates.

---

## 🛠️ Technology Stack

The project leverages a modern, privacy-first technical stack:

*   **Midnight Network** – Decentralized blockchain with native Zero-Knowledge (ZK) capabilities.
*   **Compact Language** – A specialized smart contract language designed for privacy-preserving circuits.
*   **Vite + React (TypeScript)** – High-performance modular frontend architecture.
*   **RxJS & Observables** – Reactive SDK layer for real-time contract state synchronization.
*   **Framer Motion** – Premium micro-animations for ZK proof generation transparency.
*   **Tailwind CSS** – Custom utility-first design system with privacy-focused UI patterns.

---

## 🏗️ Project Structure

The repository is organized as a monorepo for seamless full-stack dev-to-deploy experience:

```text
├── disciplinary-contract/    # Smart contract (Compact) logic and schema
├── frontend-vite-react/      # React + Vite frontend application
│   ├── src/modules/midnight/  
│   │   ├── disciplinary-sdk/ # Custom SDK layer for ZK interactions
│   │   └── wallet-widget/    # Midnight wallet integration components
│   └── src/pages/             # UI Views (Dashboard, Records, Registration)
├── counter-cli/              # Deployment & test script runner
└── public/screenshots/       # Project visual documentation
```

---

## 🧠 Smart Contract Internals

The `disciplinary.compact` contract is the backbone of the registry. It defines the privacy rules for student data.

### Data Model
*   **`ledger totalStudents: Counter`**: A public registry of the total number of students enrolled.
*   **`ledger accounts: Map<Field, Uint<64>>`**: A private mapping of student commitments (hashes) to their disciplinary incident counts.

### Core Circuits
1.  **`registerStudent(studentId: Field)`**: 
    - Increments global student counter.
    - Creates a new entry in the `accounts` map using a `disclose(studentId)` hash.
2.  **`addDisciplinaryAction(studentId: Field)`**: 
    - Verifies student existence on-chain.
    - Increments the private incident counter for that specific hashed ID.
3.  **`verifyRecord(studentId: Field)`**: 
    - A read-only circuit that proves knowledge of a student ID.
    - Returns the current incident count without revealing the ID to the network.

---

## 📜 Deployed Contract

*   **Contract Name:** `disciplinary.compact`
*   **Source File:** [`disciplinary-contract/src/disciplinary.compact`](./disciplinary-contract/src/disciplinary.compact)
*   **Contract Address:** `47e5aa756ebb75df1fa5feb6af40d0ac5ce24ef2fe683cfa7e467b3ee6d06585`
*   **Network:** Midnight Testnet (Local / Dev)

---

## 🚶 How It Works

### 1. Privacy-Preserving Registration
When a student is added, the system generates a local hash. The blockchain only sees a **Commitment Hash**, ensuring the student's real identity remains anonymous to the network.

![Registration Flow](./public/screenshots/Screenshot%202026-02-15%20183051.png)

### 2. Zero-Knowledge Proof Generation
Every interaction requiring a state change or a private query triggers a **ZK-SNARK proof**. This allows the Midnight Network to verify that the transaction follows the rules without seeing the private data (Student ID, private history) involved.

![ZK Proof Modal](./public/screenshots/Screenshot%202026-02-15%20183059.png)

### 3. Verification & Record Management
The Records dashboard allows administrators to query a student's ID and retrieve a verified proof of their status. If an incident occurs, a new record can be added securely.

![Records Dashboard](./public/screenshots/Screenshot%202026-02-15%20183137.png)

---

## 🚀 Getting Started

1.  **Install Midnight Lace Wallet**: Required to sign ZK transactions.
2.  **Enter Demo Mode**: If you don't have a testnet wallet, use the "Demo Mode" toggle in the app to see the simulated ZK flows.
3.  **Register a Student**: Start by creating a private commitment on the Registration page.

---

## 📌 Roadmap & Future Improvements

*   [ ] **Role-Based Access Control** – Specific "Verifying Institution" vs "School" roles.
*   [ ] **Multi-School Registry** – Federated records across different educational districts.
*   [ ] **Student Self-Proof** – Allow students to generate their own "Good Standing" proofs for third parties.
*   [ ] **Encrypted Note Storage** – Storing full incident narratives in private, encrypted sidechains.

---

## 🤝 Contributing

This is a developer-focused template for privacy-preserving applications. Contributions to the contract logic or the UX patterns are welcome.

---

## 📜 License

Apache 2.0
