# DSFMP Fraud Detection Module
## Combined ML Anomaly Detection + Blockchain Record Integrity
### Implementation Architecture Handout
**Digital School Feeding Management Platform | ICS C4 Capstone 2026**

---

## 1. The Core Idea

Traditional fraud prevention systems choose one approach — detect fraud after it happens, or prevent record tampering before it does. DSFMP's fraud module does both simultaneously by combining two technologies that operate at different layers of the system without conflicting.

```
BLOCKCHAIN LAYER
Governs what gets written and guarantees
no one can change it after the fact
            +
ML ANOMALY DETECTION LAYER
Watches what is being written and flags
suspicious patterns before they solidify
            =
Fraud is harder to commit AND harder to hide
```

**The key principle: Blockchain secures the data. ML watches the data.**

---

## 2. Division of Responsibilities

| Responsibility | Handled By |
|---|---|
| Preventing record tampering after entry | Blockchain |
| Detecting suspicious patterns at entry | ML |
| Verifying identity at registration | Blockchain |
| Flagging ghost beneficiary behavior | ML |
| Guaranteeing delivery confirmation | Blockchain Smart Contract |
| Detecting inflated procurement quantities | ML |
| Immutable audit trail | Blockchain |
| Real-time risk scoring | ML |
| Payment release rules enforcement | Blockchain Smart Contract |
| Payment velocity anomalies | ML |
| Backdating prevention | Blockchain |
| Temporal behavioral profiling | ML |
| Supplier-school collusion proof | Blockchain (record) + ML (detection) |

---

## 3. How They Connect — System Architecture

```
┌─────────────────────────────────────────────────────┐
│                DSFMP CORE PLATFORM                  │
│      (Enrollments, Payments, Meals, Logistics)      │
└──────────────────────────┬──────────────────────────┘
                           │
              Every event fires TWO parallel processes
                           │
           ┌───────────────┴─────────────────┐
           │                                 │
           ▼                                 ▼
┌──────────────────┐               ┌─────────────────────┐
│  BLOCKCHAIN      │               │  ML ANOMALY         │
│  LAYER           │               │  DETECTION LAYER    │
│                  │               │                     │
│ Writes event     │               │ Scores event        │
│ to ledger        │               │ in real time        │
│                  │               │                     │
│ Hashes record    │               │ Compares against    │
│ cryptographically│               │ learned baseline    │
│                  │               │                     │
│ Smart contract   │               │ Generates composite │
│ validation rules │               │ risk score          │
│                  │               │                     │
│ Cannot be altered│               │ Raises alert if     │
│ after writing    │               │ threshold exceeded  │
└────────┬─────────┘               └──────────┬──────────┘
         │                                    │
         └──────────────┬─────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                 MYSQL + REDIS                       │
│                                                     │
│  Every record stores BOTH:                         │
│  - Blockchain hash (proof of integrity)             │
│  - ML risk score (proof of behavioral analysis)     │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│           FRAUD WORKFLOW & DASHBOARD                │
│                                                     │
│  Investigators see:                                 │
│  WHAT happened — guaranteed by blockchain           │
│  HOW suspicious it is — scored by ML               │
└─────────────────────────────────────────────────────┘
```

---

## 4. Blockchain Integration Per DSFMP Module

### 4.1 Beneficiary Registration

```
Student registered in DSFMP
            │
            ▼
Blockchain writes identity record
- Cryptographic hash of student details
- School ID, county, registration timestamp
- Immutable — cannot be duplicated or altered
            │
            ▼
ML checks simultaneously
- Is this enrollment pattern suspicious?
- Does profile match known ghost patterns?
- Duplicate identity fuzzy match score
- Enrollment spike flag vs school baseline
```

### 4.2 Payments

```
M-Pesa / Subsidy payment initiated
            │
            ▼
Smart Contract validates:
- Is the school registered on the ledger?
- Does a confirmed meal record exist for this period?
- Is payment amount within the approved range?
            │
       ┌────┴────┐
       │         │
     PASS       FAIL
       │         │
       ▼         ▼
  Payment      Payment
  recorded     blocked
  on ledger    automatically
  (immutable)
       │
       ▼
ML scores the transaction:
- Payment velocity check (last 24 hours)
- Amount Z-score vs rolling baseline
- Off-hours transaction flag
- Subsidy-to-meals-served gap analysis
```

### 4.3 Supply Chain & Deliveries

```
Supplier submits delivery confirmation
            │
            ▼
Blockchain smart contract:
- Matches delivery against original procurement order
- Releases supplier payment ONLY if delivery confirmed
- Records delivery hash and timestamp on ledger
            │
            ▼
ML checks simultaneously:
- Is quantity consistent with school enrollment?
- Is this supplier's invoice pattern normal?
- Does delivery timing match historical rhythm?
- Single-supplier dependency flag
```

---

## 5. ML Detection Layer (Unchanged)

### Four Models

| Model | Purpose | Output |
|---|---|---|
| **Isolation Forest** | General tabular anomaly detection | Anomaly score per record |
| **Autoencoder** | Deep pattern reconstruction deviation | Reconstruction error score |
| **LSTM Autoencoder** | Time-series behavioral profiling per school | Temporal anomaly score |
| **Graph Neural Network** | Relationship and collusion detection | Graph centrality anomaly score |

### Risk Scoring

```
Isolation Forest  (25%)
Autoencoder       (30%)    →   Composite Score (0.00 – 1.00)   →   Risk Tier
LSTM Temporal     (25%)
Graph Analysis    (20%)
```

| Score | Tier | Action |
|---|---|---|
| 0.80 – 1.00 | CRITICAL | Suspend. Escalate to county oversight immediately |
| 0.60 – 0.79 | HIGH | Flag for senior review. Freeze pending disbursements |
| 0.40 – 0.59 | MEDIUM | Queue for investigation. Monitor for 7 days |
| 0.00 – 0.39 | LOW | Log and monitor. No immediate action required |

---

## 6. Blockchain Options for DSFMP

A public blockchain like Ethereum mainnet is not suitable for a government program. A **private permissioned blockchain** is the correct choice — controlled access, no transaction fees, high throughput.

| Option | Best For | Complexity | Cost |
|---|---|---|---|
| **Hyperledger Fabric** | Enterprise government systems | High | Free (open source) |
| **Private Ethereum Network** | Smart contract flexibility | Medium | Free to run privately |
| **Polygon (private)** | Lighter Ethereum alternative | Medium | Low |
| **HashiCorp Vault** | Simpler tamper-proof logging (not full blockchain) | Low | Free tier available |

### Recommended for Capstone
**Hyperledger Fabric** — most credible for a government-facing system, well documented, widely used in public sector pilots globally, and fully open source.

---

## 7. What This Combination Defeats

| Fraud Attack | Blockchain Alone | ML Alone | Combined |
|---|---|---|---|
| Ghost student registered | ⚠️ Hardens | ✅ Detects pattern | ✅✅ Harder to register + detected if attempted |
| Payment record altered after the fact | ✅ Impossible | ❌ Cannot detect | ✅✅ Impossible + cryptographic proof |
| Inflated supplier invoice | ⚠️ Records it | ✅ Flags deviation | ✅✅ Immutably recorded + immediately flagged |
| Supplier-school collusion | ❌ Cannot detect | ✅ Graph analysis | ✅✅ Relationship on ledger + behaviorally flagged |
| Subsidy released without meal confirmation | ✅ Smart contract blocks | ⚠️ Detects after | ✅✅ Blocked at source, no leakage |
| Backdated enrollment | ✅ Timestamp immutable | ✅ Temporal anomaly | ✅✅ Cannot be backdated + flagged if attempted |
| Novel unknown fraud pattern | ❌ Cannot detect | ✅ Anomaly scoring | ✅✅ Recorded in full + anomaly scored |

---

## 8. Updated Full Stack

```
┌───────────────────────────────────────────────────┐
│                 DSFMP PLATFORM                    │
├───────────────────────────────────────────────────┤
│  BLOCKCHAIN LAYER (Hyperledger Fabric)            │
│  - Beneficiary identity registry                  │
│  - Payment and subsidy transaction ledger         │
│  - Delivery confirmation smart contracts          │
│  - Immutable cryptographic audit trail            │
├───────────────────────────────────────────────────┤
│  ML DETECTION LAYER                               │
│  - Isolation Forest  (tabular anomalies)          │
│  - Autoencoder       (deep pattern detection)     │
│  - LSTM              (temporal profiling)         │
│  - GNN               (collusion detection)        │
│  - XGBoost           (supervised refinement)      │
├───────────────────────────────────────────────────┤
│  DATA LAYER                                       │
│  MySQL  — persistent records + blockchain hashes  │
│  Redis  — real-time scores + alert queues         │
├───────────────────────────────────────────────────┤
│  APPLICATION LAYER                                │
│  FastAPI  — ML serving + blockchain queries       │
│  React    — case management dashboard             │
└───────────────────────────────────────────────────┘
```

### Full Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Blockchain | Hyperledger Fabric | Enterprise-grade, permissioned, government-ready |
| Smart Contracts | Hyperledger Chaincode (Go / Node.js) | Native Fabric contract language |
| ML Models | Python, Scikit-learn, TensorFlow, PyTorch Geometric | Mature ecosystem, GPU support |
| Supervised Layer | XGBoost | High accuracy on labeled fraud data |
| Primary DB | MySQL | Reliable relational storage + blockchain hash storage |
| Cache / Queue | Redis | Real-time scoring and alert management |
| API Layer | FastAPI | Lightweight, Python-native, fast |
| Frontend | React (DSFMP Dashboard) | Unified case management UI |
| Containerization | Docker | Consistent environments, easy server migration |
| Methodology | Agile | Iterative delivery with stakeholder feedback |
| Execution Domain | Web-based + ML + Blockchain Backend | Multi-stakeholder access, no installation required |

---

## 9. Updated Database — Key Addition

### New Field in Core Tables

Every transaction and enrollment record in MySQL now carries an additional field:

```
blockchain_hash      VARCHAR(256)    — cryptographic record hash
blockchain_tx_id     VARCHAR(256)    — ledger transaction reference
blockchain_status    ENUM            — PENDING / CONFIRMED / FAILED
ledger_written_at    TIMESTAMP       — when blockchain write completed
```

This means every MySQL record can be **verified against the blockchain ledger** at any point — if the MySQL record and the blockchain hash don't match, tampering is immediately proven.

---

## 10. Honest Implementation Challenges

| Challenge | Description | Mitigation |
|---|---|---|
| Complexity doubles | Two sophisticated systems to build and maintain | Build ML first, integrate blockchain in Phase 2 |
| Blockchain slows writes | Every record write takes longer than a standard DB insert | Write to blockchain asynchronously — don't block the UI |
| Smart contract bugs | A bug in a deployed smart contract is very hard to fix | Thorough testing on a local Fabric network before deployment |
| Team expertise | Requires both ML and blockchain knowledge | Assign module ownership — one sub-team per layer |
| Blockchain does not verify truth | A ghost student on a blockchain is still a ghost student | ML handles truth verification, blockchain handles integrity |

---

## 11. Recommended Phased Build Order

### Phase 1 — ML Foundation
```
Build the complete ML fraud detection module
├── Feature engineering pipeline
├── Isolation Forest + Autoencoder
├── LSTM Autoencoder
├── Graph Neural Network
├── Risk scoring engine
├── Fraud workflow (MySQL + Redis)
└── SOB / COB procedures
```

### Phase 2 — Blockchain Integration
```
Introduce Hyperledger Fabric for:
├── Beneficiary identity registry
├── Payment transaction ledger
├── Delivery confirmation smart contracts
└── Blockchain hash fields added to MySQL tables
```

### Phase 3 — Full Integration
```
ML reads from blockchain-verified records
├── ML scores attached to ledger transactions
├── Blockchain hashes stored alongside ML scores in MySQL
├── Unified case investigation view in dashboard
└── Investigators see: ledger proof + ML risk score per case
```

---

## 12. Key Design Principles

- **Blockchain secures the data. ML watches the data.** They solve different parts of the same problem
- **Neither approach is complete alone** — together they cover both prevention and detection
- **AI is advisory, not autonomous** — models generate risk scores, humans make final decisions
- **Immutability is the blockchain's core value** — no record can be altered once written to the ledger
- **Smart contracts enforce rules automatically** — payment cannot be released without confirmed delivery
- **The feedback loop makes ML smarter** — every investigated case improves future detection accuracy
- **MySQL remains the application source of truth** — blockchain provides the cryptographic proof layer on top
- **Build ML first** — it delivers immediate value and does not depend on blockchain being ready

---

## 13. Why This Architecture is Significant

Most fraud detection systems in public sector programs implement one approach or the other. This module proposes a genuinely novel combination where:

- **Blockchain guarantees the integrity of what is recorded**
- **ML guarantees the behavioral analysis of what is happening**
- **Together they create a system where fraud is both harder to commit and harder to conceal**

This transforms school feeding oversight from reactive auditing into a proactive, intelligent, cryptographically secured, and continuously learning program protection infrastructure.

---

*DSFMP Fraud Detection & Anomaly Monitoring Module*
*Combined ML + Blockchain Implementation Architecture*
*ICS C4 Capstone Projects 2026 | Industry Partnership Collaboration — Webmasters*
