# DSFMP Fraud Detection Module
## ML vs Blockchain — Comparative Handout
**Digital School Feeding Management Platform | ICS C4 Capstone 2026**

---

## Background

School feeding programs manage millions of dollars in government subsidies, donor funding, and parental contributions annually. Without intelligent oversight, these programs remain vulnerable to:

- **Ghost beneficiaries** — fictitious or duplicate student registrations
- **Payment fraud** — irregular transactions and subsidy misappropriation
- **Supply chain manipulation** — inflated invoices and delivery diversion
- **Record tampering** — manual alteration of beneficiary and procurement records

Studies by the World Food Programme estimate that **10–30% of school feeding resources** fail to reach intended beneficiaries due to weak oversight and manual accountability systems.

---

## The Two Approaches

### Option A — Machine Learning (ML)

ML models learn what "normal" looks like across all system transactions and automatically flag statistical deviations as potential fraud.

**Models Deployed in DSFMP:**

| Model | Role |
|---|---|
| Isolation Forest | General transaction anomaly detection |
| Autoencoder | Deep pattern reconstruction and deviation scoring |
| LSTM Autoencoder | Temporal behavioral profiling per school |
| Graph Neural Network | Relationship and collusion detection |

#### Pros
- Detects unknown and evolving fraud patterns automatically
- Integrates directly into existing DSFMP data architecture
- Gets smarter over time through investigator feedback loops
- Works on standard hardware — cost effective to build and maintain
- Open source libraries mean no licensing costs
- Scales from pilot to national level without architectural changes
- Aligns with DSFMP's human-in-the-loop decision principle

#### Cons
- Produces false positives — legitimate transactions may be flagged
- Weak at launch — requires historical data to establish a reliable baseline
- Models drift over time and must be periodically retrained
- Deep learning outputs are difficult to explain in legal or audit contexts
- Requires ongoing ML expertise to maintain

---

### Option B — Blockchain

Blockchain records every transaction on a cryptographically secured, immutable distributed ledger that no single actor can alter.

#### Pros
- Provides mathematically provable, tamper-proof audit trails
- Smart contracts enforce rules automatically — e.g. payment released only after delivery confirmed
- Ghost beneficiaries are harder to create with cryptographic identity verification
- Highly credible in legal, compliance, and donor accountability contexts
- Decentralization prevents unilateral record manipulation

#### Cons
- High implementation complexity and specialized expertise required
- Expensive to build, deploy, and maintain
- Limited transaction throughput — high daily event volumes can congest the chain
- Immutability complicates legitimate data corrections
- High adoption barrier for rural schools and local suppliers
- Cannot verify that data entered was truthful — a ghost student on a blockchain is still a ghost student
- Multi-stakeholder governance of the chain is politically and administratively complex

---

## Side-by-Side Comparison

| Dimension | Machine Learning | Blockchain |
|---|---|---|
| Fraud detection | Reactive — detects after the fact | Preventive — hardens the record layer |
| Implementation complexity | Moderate | High |
| Cost | Low to moderate | High |
| Explainability | Challenging | Strong |
| Adaptability | High — retrains over time | Low — rules baked into smart contracts |
| Data entry fraud | Cannot prevent | Cannot prevent |
| Record tampering | Cannot prevent | Prevents completely |
| Adoption barrier | Low | High |
| Best strength | Pattern recognition at scale | Immutable audit trail |
| Core weakness | False positives, needs labeled data | Garbage in, garbage out |

---

## What Each Approach Solves

```
FRAUD THREAT                  ML          BLOCKCHAIN
─────────────────────────────────────────────────────
Ghost beneficiaries           ✅ Detects   ⚠️  Hardens
Payment anomalies             ✅ Detects   ✅  Prevents tampering
Supply chain irregularities   ✅ Detects   ✅  Prevents tampering
Supplier collusion            ✅ Detects   ⚠️  Partial
Record manipulation           ❌ Cannot    ✅  Prevents completely
Evolving fraud patterns       ✅ Adapts    ❌  Cannot adapt
Real-time alerting            ✅ Yes       ❌  Limited
```

---

## The Honest Conclusion

Neither approach is complete on its own.

- **ML** excels at detecting anomalies in behavior
- **Blockchain** excels at guaranteeing the integrity of records
- They solve **different parts of the same problem**

The most robust long-term architecture combines both:

```
BLOCKCHAIN LAYER
(Immutable, verified record keeping)
          +
ML DETECTION LAYER
(Behavioral anomaly detection on top of trusted data)
          =
Comprehensive Fraud Protection
```

### For DSFMP Capstone Scope

**ML is the correct and justified starting point** because:

- Lower cost and complexity
- Faster to prototype and iterate
- Sufficient hardware available (RTX 4060, i7 13th Gen)
- Directly addresses the highest-impact fraud vectors
- Blockchain noted as a **future infrastructure upgrade path**

---

## Proposed DSFMP Fraud Module Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| ML Models | Python, Scikit-learn, TensorFlow, PyTorch Geometric | Mature ecosystem, GPU support, open source |
| Primary DB | MySQL | Reliable, relational, strong audit trail support |
| Cache / Queue | Redis | Real-time scoring and alert queue management |
| API Layer | FastAPI | Lightweight, fast, Python-native |
| Frontend | React (DSFMP Dashboard) | Integrated case management UI |
| Methodology | Agile | Iterative delivery with stakeholder feedback |
| Execution Domain | Web-based + ML Backend | Multi-stakeholder access, no installation required |

---

*DSFMP Fraud Detection Module | ICS C4 Capstone Projects 2026 | Industry Partnership Collaboration — Webmasters*
