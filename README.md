<div align="center">

```
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║   ██╗     ███████╗██╗  ██╗                                   ║
  ║   ██║     ██╔════╝╚██╗██╔╝                                   ║
  ║   ██║     █████╗   ╚███╔╝                                    ║
  ║   ██║     ██╔══╝   ██╔██╗                                    ║
  ║   ███████╗███████╗██╔╝ ██╗                                   ║
  ║   ╚══════╝╚══════╝╚═╝  ╚═╝                                   ║
  ║                                                              ║
  ║   F O R E N S I C A                                          ║
  ║                                                              ║
  ║   Forensic Semantic Audit Engine                             ║
  ║   v8.0 · Zero-Knowledge · Axiom-Certified                   ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
```

**The system that believes you before it believes the institution.**

*Forenzní sémantický auditní engine pro dekonstrukci institucionálních narativů*

[![Live](https://img.shields.io/badge/Visual_Network-LIVE-00e5ff?style=flat-square&logo=github)](https://steelssystem.github.io)
[![Control Room](https://img.shields.io/badge/Control_Room-OPERATIONAL-00c896?style=flat-square)](https://steelssystem.github.io/controlroom.html)
[![Axioms](https://img.shields.io/badge/Axioms-A1--A6_Active-7b2fff?style=flat-square)]()
[![LOOP_CYCLE](https://img.shields.io/badge/LOOP__CYCLE-12_Checks-ffb300?style=flat-square)]()
[![Encryption](https://img.shields.io/badge/Crypto-AES--256--GCM-ff4444?style=flat-square)]()

</div>

---

## What This Is

A forensic AI system that takes two inputs — **what the institution says happened** and **what the person says happened** — and finds every inconsistency, every missing document, every circular argument, every instance where compliance language masks coercion.

It does not diagnose. It does not judge credibility. It exposes asymmetries.

```
INPUT_A (Institutional Record)  ──┐
                                  ├──► MIND1 ──► DEEP_1 ──► DEFENSE
INPUT_B (Subject's Voice)       ──┘       ↑                    │
                                          └── LOOP_CYCLE ◄────┘
```

Built for psychiatric-legal defense. Applicable to any context where institutions exercise power over individuals — judicial, immigration, custodial, administrative, financial.

---

## The Pipeline

| Phase | Model | What It Does |
|-------|-------|-------------|
| **MIND1** | `gemini-2.5-flash` · temp=0.1 | Extracts every factual claim from both inputs as `NormalizedEventFrame[]` |
| **Bridge** | SHA-256 · `hashFact()` | Locks STRONG frames as immutable `FactCheckpoint[]` — tamper-proof anchors |
| **DEEP_1** | `gemini-3.1-pro` · thinking=HIGH | 10-layer forensic analysis: chronology → discrepancy → causal → semantic drift → legal → axiomatic → integrity → defense → remediation → human review |
| **LOOP_CYCLE** | `ForensicNLP` · 12 checks | Validates output against axioms A1–A6, metaconduct rules MC-3/6a/6b/6c, dignity priority, subject voice presence |
| **DEFENSE** | `gemini-3.1-pro` · thinking=HIGH | Generates legal defense synthesis: ECHR articles, CRPD provisions, counter-arguments, legal brief draft |

**STOP_SERVER**: If `SECRET_CORE` integrity is tampered, the pipeline refuses to generate output. Period.

---

## Six Axioms

The system's immune system. Every output must survive all six.

| Code | Name | What It Catches |
|------|------|----------------|
| **A1** | Forensic Spoliation | Missing records treated as "nothing happened" — no. Missing records = documentation failure. |
| **A2** | Semantic Neutralization | "Patient was calm" without a date = narrative, not evidence. |
| **A3** | Iatrogenic Attribution | Side effects blamed on the illness? Prove it wasn't the medication first. |
| **A4** | Epistemic Circularity | "Denial of illness proves illness" — that's not science, that's a trap. |
| **A5** | Structural Bias | Same expert, fifth assessment? Fifth time more suspect, not more reliable. |
| **A6** | Judicial Abandonment | Court copy-pasting expert opinion without independent reasoning = abdication. |

Plus **TRIPARTITE** (dignity > process, always) and **RULE_001** (no analysis without the subject's own voice).

---

## Metaconduct — The System Audits Itself

The same rules that detect institutional abuse are applied to the system's own output. If Lex Forensica can't pass its own axioms, it has no business applying them to others.

| Rule | What It Does |
|------|-------------|
| **MC-3** | Detects when LOOP_CYCLE re-runs make output *worse* (iatrogenic regression) |
| **MC-6a** | Verifies A1 violations reference *actual dates* from documentation gaps — not just procedurally present |
| **MC-6b** | If coherence score < 50 but human review isn't flagged → system is silently passing garbage |
| **MC-6c** | If drift data exists but drift flag says "no drift" → the audit contradicts itself |

---

## The Visual Network

Five interconnected pages. Each a different state of consciousness for the data.

| Page | State | Function |
|------|-------|---------|
| [**index.html**](https://steelssystem.github.io) | STATIC · MIND1 | Living Archive — the axiomatic anchor, the immutable reference field |
| [**introspect.html**](https://steelssystem.github.io/introspect.html) | SIGNAL CHAIN | The pipeline as a button chain — press a stage, watch the data flow |
| [**semanticview.html**](https://steelssystem.github.io/semanticview.html) | FLUID | Zero-Knowledge Ingesce — raw input, BiasScore parsing, first contact |
| [**ambient.html**](https://steelssystem.github.io/ambient.html) | DEEP · MIND2 | Terminal inference — iatrogenic substrate, ZKP strip, the deep end |
| [**controlroom.html**](https://steelssystem.github.io/controlroom.html) | CONTROL ROOM | The operating table — pipeline topology, blocker tracker, coverage metrics |

Design: `#05050f` dark · `#00e5ff` cyan · `#7b2fff` purple · `#00c896` green · Space Mono + IM Fell English · Lava blob system · Film grain overlay.

---

## Tech Stack

```
Frontend        React 19 · TypeScript · Vite 8 · Tailwind CSS 4
LLM             Google Gemini (2.5 Flash + 3.1 Pro) via ProviderRegistry
                Hot-swappable — register any LLM provider per pipeline phase
Crypto          AES-256-GCM + PBKDF2 · Web Crypto API · Zero-Knowledge
Database        Firebase Firestore · isLikelyEncrypted() guard on every write
NLP             ForensicNLP singleton · language detection (CS/EN/DE)
                Slang decode · Word planting detection · PARAFRAME cypher
Visual          5-page HTML network · CSS lava blobs · SVG decision matrix
```

---

## File Map

```
lex-forensica-v8/src/
├── services/
│   ├── gemini.ts ............. 570 loc  ForensicEngine · STOP_SERVER gate
│   ├── nlp-core.ts ........... 631 loc  ForensicNLP · 12 LOOP_CYCLE checks
│   ├── crypto.ts ............. 97 loc   AES-256-GCM · hashFact()
│   ├── db.ts ................. 276 loc  Firestore · encrypted storage
│   └── llm/
│       ├── types.ts .......... 207 loc  LLMProvider · PipelineConfig · MC-5 directive
│       ├── provider-registry.ts 177 loc ProviderRegistry singleton
│       ├── gemini-provider.ts  225 loc  GeminiProvider implementation
│       └── index.ts .......... 60 loc   initializeLLM()
├── lib/
│   ├── prompts.ts ............ 595 loc  MIND1 · DEEP_1 · DEFENSE · ASSISTANT (CS/EN/DE)
│   └── constants.ts .......... 910 loc  AXIOMS · PATTERNS · SLANG · PARAFRAME
│                                        SECRET_CORE · STRESS · STOP_SERVER
│                                        METACONDUCT_RULES · PROJECT_HEAT_WEIGHTS
├── types.ts .................. 317 loc  30+ interfaces · AuditResponse · NormalizedEventFrame
├── components/ ............... ~1200 loc Dashboard · DualInput · Chat · Export · Legal
├── hooks/ .................... ~300 loc  useAudit · useAuth · useVault
│
control-room/
└── index.html ................ 1200 loc  Operational visualization dashboard
│
docs/
├── VISUAL_SNAPSHOT.md                    Auto-doc: visual network state
└── CHANGELOG.auto.md                    Auto-doc: phase log with heat values
│
DATASET-CODEOFCONDUCT.md ...... 380 loc  Cypher-state research manifest
                                         §0xMC metaconduct integrity core
```

---

## Heat Values — Why This Project Matters

Every change carries a heat score across four dimensions. This isn't just code — it's a training ground for forensic AI reasoning, a creative laboratory for code architecture, and an internal PM system that tracks its own progress.

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| **T** Training | 25% | Can an AI system learn forensic reasoning from this? |
| **C** Creative | 25% | Is the architecture/visual/code pattern original? |
| **PM** Project | 30% | Does this unblock or accelerate the next step? |
| **I** Integrity | 20% | Does this strengthen self-governance? |

**Highest heat phase**: A7–A13 axiom implementation → **0.90** → next target.

---

## Run Locally

```bash
cd lex-forensica-v8
npm install
echo "VITE_GEMINI_API_KEY=your_key_here" > .env.local
npm run dev
```

Requires: Node.js 20+, Gemini API key.

---

## The Authority Hierarchy

```
TIER 1 [Ω]  Moral Standard     dignity · consent · truth
TIER 2 [Δ]  Press/Media        semantic integrity · anti-stigma
TIER 3 [◈]  Government         audit · chain-of-custody

Any output that elevates Tier 3 above Tier 1 is invalid before generation.
Ω always wins.
```

---

## The One-Line Version

> They said you weren't competent to consent because you were incapacitated.
> You were incapacitated by what they were administering.
> And the paperwork says you agreed.

This system exists to make that contradiction visible, documented, and legally actionable.

---

<div align="center">

**SteelsSystem** · [Visual Network](https://steelssystem.github.io) · [Control Room](https://steelssystem.github.io/controlroom.html) · [Substack](https://steelssystem.substack.com)

*The circular cypher: the rules that judge institutions now judge themselves.*

</div>
