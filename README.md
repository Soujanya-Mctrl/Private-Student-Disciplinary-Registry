# 🎓 Private Student Disciplinary Registry

> A privacy-focused smart contract that allows schools to record disciplinary actions on-chain with selective disclosure — ensuring transparency without exposing sensitive student data.

---

## 📖 Project Description

The **Private Student Disciplinary Registry** is a blockchain-based smart contract built using the Midnight Compact language.

Traditional school disciplinary systems are centralized and opaque. Records can be altered, lost, or exposed without proper authorization.

This project introduces a **privacy-preserving on-chain registry** where:

* Schools can record disciplinary actions securely.
* Student records remain private.
* Authorized institutions can verify records without full data exposure.

It demonstrates how blockchain can be used for **trust + privacy + verifiability** in education systems.

---

## ⚙️ What It Does

This smart contract enables:

1. **Student Registration**

   * Schools register students on-chain.
   * Each student gets a private disciplinary counter.

2. **Private Disciplinary Recording**

   * Schools add disciplinary actions.
   * The count updates privately on-chain.

3. **Selective Disclosure Verification**

   * Authorized institutions can verify a student’s disciplinary count.
   * Full details remain private.
   * Only the necessary information is revealed.

---

## ✨ Features

* 🔒 **Privacy First** – Student records are stored privately.
* 📊 **Selective Disclosure** – Only summary data can be verified.
* 🏫 **School-Controlled Entries** – Only authorized parties can add actions.
* 🧾 **Tamper-Resistant** – On-chain integrity ensures records cannot be altered.
* 🧑‍🎓 **Student-Centric** – Protects student identity and sensitive data.
* 🧠 **Beginner-Friendly Contract Structure** – Simple and easy to understand.

---

## 🏗️ Smart Contract Overview

* Uses `Counter` for tracking disciplinary actions.
* Maintains:

  * A public student counter.
  * A private map of student disciplinary records.
* Follows Midnight’s `ledger` and `circuit` model.

---

## 🚀 Deployed Smart Contract

**Contract Name:** `disciplinary.compact`  
**Source File:** [`src/disciplinary.compact`](file:///d:/Projects/Midnight-full-stack/midnight-starter-template-windows/disciplinary-contract/src/disciplinary.compact)  
**Contract Address:** `47e5aa756ebb75df1fa5feb6af40d0ac5ce24ef2fe683cfa7e467b3ee6d06585`  
**Network:** `undeployed` (local)

> This contract is deployed on the Midnight network and demonstrates a minimal implementation of a privacy-preserving student disciplinary registry.

---

## 💡 Why This Matters

Educational institutions often need to share student disciplinary records with:

* Other schools (transfers)
* Universities
* Scholarship committees

But exposing full records can:

* Violate privacy
* Harm student futures
* Create unnecessary bias

This solution ensures:

> ✔ Trust without overexposure
> ✔ Verification without revealing full history
> ✔ Privacy preserved by design

---

## 🛠️ Built With

* Midnight Compact Language
* Compact Standard Library
* Privacy-focused smart contract architecture

---

## 📌 Future Improvements

* Role-based access control (School / Verifier roles)
* Severity levels (minor / major offenses)
* Multi-school registry
* ZK-based proof verification instead of raw counters
* Frontend dashboard for schools

---

## 🤝 Contributing

This is a beginner-friendly educational project.
Feel free to fork, experiment, and improve!

---

## 📜 License

Apache 2.0

---