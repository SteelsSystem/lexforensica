# LEX FORENSICA — UPDATE LOG

> Canonical record of architectural changes, known flaws, remediation status, and launch gate progress.  
> Last updated: 2026-04-07 | Maintainer: SteelsSystem  
> Repository: `SteelsSystem/AI-Forensica` (renamed from `testforensica`)

---

## [v8.0.0] — 2026-04-07 | Complete Rebuild — LLM Abstraction Layer + Encrypted Architecture

### Summary

Full ground-up rebuild of LEX FORENSICA addressing all 5 BLOCKERs and 8 language gaps from the v7.0 audit. The v8.0 codebase lives in `lex-forensica-v8/` on the `v8.0` branch. Repository renamed from `testforensica` to `AI-Forensica`.

**CoC ↔ Code Coherence Score: 8/9 CYPHER-STATEs aligned** (up from 7/9)

### Architecture

| Component | Technology | Notes |
|:---|:---|:---|
| Framework | Vite + React 18 + TypeScript | Strict mode, no `any` in domain code |
| Styling | Tailwind CSS v4 | Dark forensic theme |
| LLM Layer | **ProviderRegistry pattern** | Swappable backends — Gemini default, OpenAI/Anthropic/local ready |
| MIND1 | `gemini-2.5-flash` (temp=0.1) | Normalized Event Frame extraction |
| DEEP_1 | `gemini-3.1-pro-preview` (thinking=HIGH) | Full forensic analysis + Google Search |
| Defense | `gemini-3.1-pro-preview` (thinking=HIGH) | ECHR/CRPD counter-argument synthesis |
| Encryption | AES-256-GCM + PBKDF2 (100k iter) | Web Crypto API, zero-knowledge |
| Storage | Firestore — ALL paths encrypted | Audits, metadata, chat history, SKSS |
| Auth | Firebase Auth (Google OAuth) | UID-scoped Firestore rules |
| NLP | ForensicNLP singleton | CZ/EN/DE trilingual, A1-A6 axiom checks |

### Pipeline: MIND1 → DEEP_1 → LOOP_CYCLE → DEFENSE_SYNTHESIS

1. **MIND1** — Extract NormalizedEventFrames from dual inputs (INPUT_A vs INPUT_B, never conflated)
2. **IMMUTABLE_ANCHORS** — Build FactCheckpoints from STRONG frames with SHA-256 hashes
3. **DEEP_1** — Full forensic reasoning with thinking budget + web search grounding
4. **LOOP_CYCLE** — Programmatic A1-A6 axiom validation; re-runs DEEP_1 up to 2× on CRITICAL violations
5. **DEFENSE_SYNTHESIS** — Inside pipeline (resolves BLOCKER-03), generates ECHR/CRPD legal brief

### LLM Abstraction Layer (New in v8.0)

```
src/services/llm/
├── types.ts              — LLMProvider interface, PipelineConfig, ChatTurn
├── provider-registry.ts  — Singleton registry, phase resolution, event system
├── gemini-provider.ts    — Gemini SDK implementation (generateStructured/generateText/chat)
└── index.ts              — initializeLLM(), resolvePhase() convenience exports
```

To add a new provider:
1. Implement `LLMProvider` interface
2. `registry.register(new MyProvider(apiKey))`
3. `registry.setPipelineConfig({ deep1: { provider: 'my-provider', model: '...' } })`

### BLOCKERs Resolved

| ID | Issue | Resolution |
|:---|:---|:---|
| BLOCKER-01 | localStorage for sensitive data | **RESOLVED** — Zero localStorage usage. All data in encrypted Firestore. |
| BLOCKER-02 | Firestore writes unencrypted | **RESOLVED** — `crypto.ts` (AES-256-GCM + PBKDF2), `db.ts` encrypts ALL paths. |
| BLOCKER-03 | Defense Synthesis outside pipeline | **RESOLVED** — Phase 4 inside `analyzeDeep()`, executed after LOOP_CYCLE. |
| BLOCKER-04 | IMMUTABLE_ANCHORS empty array | **RESOLVED** — `buildFactCheckpoints()` populates from STRONG frames with hashes. |
| BLOCKER-05 | API key in URL query params | **RESOLVED** — `@google/genai` SDK only, routed through ProviderRegistry. |

### Language Gaps Resolved

| ID | Issue | Resolution |
|:---|:---|:---|
| LG-01 | No Czech legal terminology | **RESOLVED** — `constants.ts` (708 lines): CZ/EN/DE term lists, slang maps |
| LG-02 | No German support | **RESOLVED** — Full DE term lists, ASSISTANT_PROMPT_DE |
| LG-03 | No trilingual prompts | **RESOLVED** — `prompts.ts` (595 lines): MIND1/DEEP1/Defense/Assistant ×3 |
| LG-04 | Slang detection missing | **RESOLVED** — `nlp-core.ts` slang maps for CZ colloquial terms |
| LG-05 | No negation scope tracking | **RESOLVED** — NormalizedEventFrame.negationScope field |
| LG-06 | No lexical escalation scoring | **RESOLVED** — NormalizedEventFrame.lexicalEscalation (0-3) |
| LG-07 | No institution-specific patterns | **RESOLVED** — InstitutionType enum (9 types), pattern matching per type |
| LG-08 | Assistant monolingual | **RESOLVED** — Language-switched system prompts (cs/en/de) |

### UI Components (11)

| Component | Lines | Purpose |
|:---|:---|:---|
| AuthGate | 78 | Firebase Google OAuth gate |
| VaultModal | 96 | Zero-knowledge vault password creation/unlock |
| DualInput | 308 | Dual-source input (INPUT_A / INPUT_B, never conflated) |
| Dashboard | 155 | Tabbed audit results (6 tabs) |
| RiskGauge | ~80 | Visual risk level + coherence score |
| DiscrepancyMatrix | ~90 | A1-A6 violation entries with evidence |
| LegalMatrix | ~70 | ECHR/CRPD article mapping |
| ChronologyTimeline | ~75 | Temporal anomaly visualization |
| DefenseDraft | ~95 | Defense synthesis display |
| ChatAssistant | 129 | Multi-turn forensic assistant |
| ExportPanel | ~130 | JSON/PDF export |

### Build Verification

- `npx tsc --noEmit` — **0 errors**
- `npx vite build` — **63 modules transformed**, build OK (910 KB bundle)
- No API keys in committed code (all via `import.meta.env.VITE_*`)

### Known Limitations (v8.0)

- Bundle size 910 KB (Gemini SDK heavy) — consider code splitting
- SKSS Firestore persistence implemented but UI for browsing SKSS registry not yet built
- No offline mode — requires Firestore connectivity
- Export to PDF generates client-side (no server rendering)

---

## [v7.2-audit] — 2026-04-07 | System Instruction Coherence Audit

Line-by-line verification of v7.2 System Instruction against codebase. Found 3 CRITICAL contradictions and scope conflict. Integrated into UPDATELOG. See commit `0589c13`.

---

## [v7.0.2-dev] — 2026-04-07 | Post-Audit Integration + Domain Scope Correction

### Summary

Full forensic coherence audit completed against all 17 source files (~3,534 lines). Two independent passes performed: a repository audit (code on `main`) and a delta audit against updated local development files. This entry integrates all findings into a single source of truth.

**Critical scope correction:** LEX FORENSICA is a **domain-agnostic** forensic audit engine. The architecture (Axioms A1–A6, Dual Input Protocol, ECHR mapping, semantic drift detection, LOOP_CYCLE validation) is structurally independent of any specific legal domain. Psychiatric forensics is the first and most extensively tested application, but the system applies equally to judicial proceedings, administrative decisions, immigration cases, custodial records, regulatory enforcement, and any institutional process where an individual's documented treatment must be compared against their own testimony. All documentation has been updated to reflect this legal–civilisational scope. The app should never be framed as psychiatry-only.

**CoC ↔ Code Coherence Score: 7/9 CYPHER-STATEs aligned**

### What Was Resolved (Development Branch)

| ID | Description | Resolution |
|:---|:---|:---|
| CG-01 | MIND1 static preprocessing was UI-only (AlignmentArchitecture.tsx) | **RESOLVED** — `gemini.ts` now implements full MIND1 phase via `gemini-2.5-flash` (temp=0.1, deterministic extraction). Dedicated `mind1Prompt` in `research.ts`. |
| CG-02 | LOOP_CYCLE existed only in LLM prompt text, no programmatic enforcement | **RESOLVED** — `runLoopCycleValidation()` (120 lines) checks TRIPARTITE HIERARCHY, all 6 Axioms (A1-A6), RULE_001. Czech-language pattern matching for A2/A5/A6. Re-prompts on CRITICAL violations (max 2 cycles). |
| CG-08 | API key exposed in URL query parameter (ForensicEngine path) | **RESOLVED** — ForensicEngine uses `@google/genai` SDK with `aiClient.models.generateContent()`. No URL-based key exposure in the engine path. |
| CG-09 | researchcore.tsx types disconnected from pipeline | **SUPERSEDED** — MIND1 prompt schema (NormalizedEventFrame) functionally replaces `researchcore.tsx` typed abstractions. |

### Architecture Changes (Development Branch, Not Yet on `main`)

**New Processing Pipeline:**

```
INPUT_A + INPUT_B
       ↓
[MIND1 — Gemini 2.5 Flash, temp=0.1]
  → NormalizedEventFrames JSON (parser-only, no reasoning)
       ↓
[DEEP_1 — Gemini 3.1 Pro, ThinkingLevel.HIGH]
  → Full AuditResponse (neuro-symbolic abduction on pre-parsed frames)
       ↓
[runLoopCycleValidation()] — programmatic axiom checks
  → Pass: return validated result
  → Fail: re-prompt with violation list (max 2 cycles)
```

**New files/fields:**
- `research.ts`: Added `mind1Prompt` (MIND1 agent prompt), `deep1Prompt` (DEEP_1 agent prompt), Section 0.9 (Programmatic Dialogue Awareness)
- `gemini.ts`: Added `refCode?: string` in discrepancy matrix, `skssDatasheet` array in AuditResponse, MIND1 extraction phase (lines 183-210), `runLoopCycleValidation()` (lines 300-421)
- `DATASET-CODEOFCONDUCT.md`: Added Section 0x09 (Proactive Enforcement, Cost-Reduction Schemes, Metacognitive State Vector, Awareness Mode)

**File change summary (dev vs. repo `main`):**

| File | Repo Lines | Dev Lines | Delta |
|:---|:---:|:---:|:---|
| `gemini.ts` | 381 | 564 | +183 lines (+48%) |
| `research.ts` | 241 | 312 | +71 lines (+29%) |
| `DATASET-CODEOFCONDUCT.md` | 47 | 55 | +8 lines (+17%) |
| `db.ts` | 152 | 153 | Effectively identical |

---

## Known Flaws — Active Registry

### CRITICAL

**BLOCKER-01: Sensitive Input Data in localStorage Plaintext**
- **Location:** `App.tsx` lines 141, 150
- **Description:** Two `useEffect` hooks write `inputA` and `inputB` to `localStorage` on every keystroke. Complete text of medical records and personal testimony stored without encryption. XSS exfiltration vector.
- **Legal basis:** GDPR Art. 5(1)(f) — integrity and confidentiality; GDPR Art. 25 — Privacy by Design.
- **Contradicts:** VaultPasswordModal claims ("your data cannot be recovered" without vault password — but the actual input data bypasses the vault entirely).
- **Fix:** Remove both `localStorage.setItem` calls. Replace with in-memory React state only. If session persistence needed, implement optional encrypted IndexedDB write using vault password key.
- **Status:** OPEN
- **Phase:** 0

**BLOCKER-02: FastMetadata and ChatHistory in Firestore Plaintext**
- **Location:** `db.ts` functions `saveFastMetadata()` (line 44) and `saveChatHistory()` (line 73)
- **Description:** `AuditRecord` correctly uses `encryptedData` field, but `saveFastMetadata()` writes `keyFlags[]` and `summary` as plaintext, and `saveChatHistory()` writes `messages[]` as plaintext. These contain extracted legal conclusions, risk levels, and full conversations about psychiatric cases.
- **Legal basis:** GDPR Art. 25, Art. 9 (special category medical data), ECHR Art. 8 (private life).
- **Acknowledged:** Comment in `App.tsx` line 207: "We will update saveFastMetadata to use encryption later."
- **Fix:** Apply `encryptData(JSON.stringify(payload), vaultPassword)` pattern already used for AuditRecord. Thread `vaultPassword` from App.tsx state to save calls.
- **Status:** OPEN
- **Phase:** 0

**BLOCKER-03: Defense Synthesis Engine Bypasses Forensic Pipeline**
- **Location:** `App.tsx` function `handleDraftAppeal()`, lines 218–257
- **Description:** The DEFENSE SYNTHESIS ENGINE makes a raw REST API call directly to Gemini, bypassing ForensicEngine, MIND1 preprocessing, DEEP_1 structured schema, LOOP_CYCLE validation, Axiom A1-A6 checks, and `responseMimeType` JSON enforcement. Temperature 0.4 with no hallucination controls. Receives only `discrepancyMatrix` JSON as context (no IMMUTABLE_ANCHORS, no NormalizedEventFrame[] history, no SKSS data). Output is free-text with no structured validation.
- **Secondary issue:** API key in URL query parameter on line 240.
- **Legal basis:** EU AI Act Annex III transparency; ECHR Art. 6 evidentiary admissibility.
- **Impact:** The product's most visible output — the document a lawyer or subject would submit to a court — has zero forensic guarantees.
- **Fix:** Replace `handleDraftAppeal()` with call to `ForensicEngine.getInstance().analyzeDeep()` or add dedicated `defenseSynthesis()` method to ForensicEngine. Move API key to request header.
- **Status:** OPEN
- **Phase:** 1

### HIGH

**BLOCKER-04: IMMUTABLE_ANCHORS Hardcoded Empty**
- **Location:** `gemini.ts` line 205
- **Description:** `const immutableCheckpoints: any[] = []` — never populated. DEEP_1 receives `{{IMMUTABLE_ANCHORS}}` placeholder but gets `[]`. Fact-checking checkpoint system described in `deep1Prompt` is effectively disabled. Increases hallucination risk.
- **Legal basis:** ECHR Art. 6 (fair trial — reliability of AI-generated evidence).
- **Fix:** Filter MIND1 `extractedFrames` for `evidentiaryStrength === 'STRONG'`, transform to `FactCheckpoint` objects with SHA-256 hashes.
- **Status:** OPEN
- **Phase:** 1

**BLOCKER-05: API Key in URL Query Parameter**
- **Location:** `App.tsx` lines 240, 267, 325
- **Description:** API key embedded as `?key=${apiKey}` in URL. Visible in browser history, network tab, Referer headers. ForensicEngine path uses SDK correctly; this affects only inline `App.tsx` calls.
- **Fix:** Move to `x-goog-api-key` header or use ForensicEngine SDK path exclusively.
- **Status:** OPEN (ForensicEngine path resolved)
- **Phase:** 0

**LG-01: Demo Data Hardcoded Czech**
- **Location:** `App.tsx` lines 115–119
- **Description:** Default demo input text is Czech psychiatric case. EN/DE users see Czech as first-run experience.
- **Fix:** Add EN/DE demo texts. Make default language-aware.
- **Status:** OPEN
- **Phase:** 2

**LG-02: Axiom A5 Regex Misses German Titles**
- **Location:** `gemini.ts` line 382
- **Description:** Expert name regex `/(?:Dr\.|MUDr\.|PhDr\.)\s+([A-Z...][a-z...]+)/` matches Czech/English prefixes only. German titles (Dr. med., Prof. Dr., PD Dr., Dr. rer. nat.) not covered.
- **Fix:** Extend regex with German academic title patterns.
- **Status:** OPEN
- **Phase:** 2

**LG-04: Axiom A2 Missing German Compliance Terms**
- **Location:** `gemini.ts` line 338
- **Description:** Compliance framing includes English ('refuses', 'lacks insight') and Czech ('nespolupracuje', 'chybí náhled') but no German ('verweigert', 'fehlende Krankheitseinsicht', 'mangelnde Compliance').
- **Fix:** Add German equivalents to term list.
- **Status:** OPEN
- **Phase:** 2

**LG-05: AI Assistant System Instruction Czech-Only**
- **Location:** `gemini.ts` line 524
- **Description:** AI assistant system instruction is entirely Czech. EN/DE users get Czech-instructed assistant.
- **Fix:** Extend to EN/DE or translate dynamically based on UI language.
- **Status:** OPEN
- **Phase:** 2

**CG-EXPORT-1: CSV Missing Evidence Columns**
- **Location:** `export.ts` line 416
- **Description:** CSV export missing `refCode`, `articles[]`, and `remedySuggestion` columns. Evidence structure incomplete for court filing.
- **Fix:** Add ECHR article, refCode, and remedySuggestion columns to CSV export.
- **Status:** OPEN
- **Phase:** 2

**CG-EXPORT-2: No PII Redaction Before Export**
- **Location:** `export.ts` lines 7, 403
- **Description:** No PII redaction layer before press report or CSV export.
- **Legal basis:** GDPR Art. 5(1)(c) — data minimisation.
- **Fix:** Implement regex-based name/ID/DOB masking before `generatePressReport()` and CSV export.
- **Status:** OPEN
- **Phase:** 2

### MEDIUM

**CG-NAMING: TIER Label Collision**
- **Location:** `research.ts`, `gemini.ts`
- **Description:** TIER_1/2/3 used for both authority hierarchy and keyword register. Prompt logic confusion risk.
- **Fix:** Rename one set (e.g., `AUTH_TIER_1/2/3` vs `KEYWORD_REGISTER_1/2/3`).
- **Status:** OPEN
- **Phase:** 1

**LG-03: Axiom A3 Missing German Iatrogenic Terms**
- **Location:** `gemini.ts` line 358
- **Description:** Iatrogenic term list includes Czech 'akatizie' but not German 'Akathisie', 'Sedierung', 'extrapyramidale Störungen', 'tardive Dyskinesie'.
- **Fix:** Add German pharmacological terms.
- **Status:** OPEN
- **Phase:** 2

**LG-06: Press Report Defaults to lang-cs**
- **Location:** `export.ts` line 87
- **Description:** HTML press report body class hardcoded to `lang-cs`. English/German reports appear in Czech until user manually switches.
- **Fix:** Set `lang` attribute from analysis language.
- **Status:** OPEN
- **Phase:** 2

**LG-07: readme/manual/plan Strings Czech-Only**
- **Location:** `research.ts`
- **Description:** Three of five RESEARCH_DEFINITION string fields are entirely Czech, served to AI assistant regardless of UI language.
- **Fix:** Add EN/DE variants or translate dynamically.
- **Status:** OPEN
- **Phase:** 2

**CG-DB-IDBX: IndexedDB Local Vault Not Implemented**
- **Location:** Not yet created
- **Description:** Declared zero-knowledge vault requires local encrypted storage. IndexedDB implementation missing. Contradicts marketing claim.
- **Fix:** Implement `src/lib/idb.ts` with get/put/deleteAll using vault key.
- **Status:** OPEN
- **Phase:** 3

**CG-DB-DEL: deleteAudit() Does Not Cascade**
- **Location:** `db.ts` line 146
- **Description:** Deleting an audit does not cascade to `fast_indices` or `chat_histories`. GDPR Art. 17 right to erasure incomplete.
- **Fix:** Add `deleteAllUserData(uid)` covering audits, fast_indices, chat_histories.
- **Status:** OPEN
- **Phase:** 3

**CG-05: fast_indices No Firestore Rules**
- **Location:** `firestore.rules`
- **Description:** Rules defined for `users`, `audits`, `chat_histories` but zero rules for `fast_indices`. Collection is unprotected.
- **Fix:** Add owner-only read/write rules mirroring audits pattern.
- **Status:** OPEN
- **Phase:** 3

**CG-10: IMMUTABLE_ANCHORS Empty (dev files)**
- **Location:** `gemini.ts` line 205
- **Description:** In development files, `immutableCheckpoints` array is always empty. DEEP_1 prompt references `{{IMMUTABLE_ANCHORS}}` but receives `[]`. Fact-checking disabled.
- **Fix:** Populate from MIND1 frames with `evidentiaryStrength === 'STRONG'`.
- **Status:** OPEN (overlaps with BLOCKER-04)
- **Phase:** 1

### LOW

**CG-07: Version String Mismatch**
- **Location:** `translations.ts`, `AlignmentArchitecture.tsx`
- **Description:** UI shows v8.3 in some places, architecture declares v7.0.
- **Fix:** Unify version string.
- **Status:** OPEN
- **Phase:** 3

**CG-SKSS: SKSS Datasheet No Persistence**
- **Location:** `db.ts`, `gemini.ts`
- **Description:** `skssDatasheet` type exists in `AuditResponse` but has no Firestore persistence path. Session-only.
- **Fix:** Add `skss_registry` Firestore collection with encrypted storage.
- **Status:** OPEN
- **Phase:** 3

**CG-RLHF: RLHF Endpoint Not Implemented**
- **Location:** Not yet created
- **Description:** CYPHER-STATE 0x07 declares self-updating training. No RLHF endpoints exist.
- **Fix:** Add Firestore collection and `submitFeedback()` function.
- **Status:** OPEN
- **Phase:** 3

**LG-08: researchcore.tsx Czech Enum Values**
- **Location:** `researchcore.tsx`
- **Description:** All enum values and prompt arrays are Czech strings. Module unusable in EN/DE pipelines.
- **Fix:** Translate to English primary with Czech as i18n variant.
- **Status:** OPEN
- **Phase:** 3

**CG-11: NormalizedEventFrame No TypeScript Interface (dev files)**
- **Location:** `gemini.ts` line 202
- **Description:** MIND1 response parsed as raw JSON with no type validation. Rich schema in prompt but no TypeScript interface.
- **Fix:** Define `NormalizedEventFrame` interface. Add validation after `JSON.parse`.
- **Status:** OPEN
- **Phase:** 1

**CG-12: MIND1 Error Recovery Binary (dev files)**
- **Location:** `gemini.ts` lines 201–202
- **Description:** MIND1 failure either throws or passes empty array. No fallback to direct text analysis.
- **Fix:** Add try/catch with fallback to empty frames (DEEP_1 handles gracefully).
- **Status:** OPEN
- **Phase:** 1

---

## Remediation Plan — Phased Execution

### Phase 0: Security Hardening (3–4 days)
**Gate:** Zero plaintext sensitive data in any storage layer.

| # | Task | Resolves |
|:--|:---|:---|
| 1 | Remove `localStorage.setItem` calls for inputA/inputB | BLOCKER-01 |
| 2 | Encrypt `saveFastMetadata()` output before Firestore write | BLOCKER-02a |
| 3 | Encrypt `saveChatHistory()` output before Firestore write | BLOCKER-02b |
| 4 | Move API key from URL query to request header | BLOCKER-05 |

### Phase 1: Architecture Correction (4–5 days)
**Gate:** All Gemini calls through ForensicEngine. IMMUTABLE_ANCHORS populated.

| # | Task | Resolves |
|:--|:---|:---|
| 1 | Refactor `handleDraftAppeal()` to use ForensicEngine | BLOCKER-03 |
| 2 | Populate IMMUTABLE_ANCHORS from MIND1 STRONG frames with SHA-256 | BLOCKER-04, CG-10 |
| 3 | Resolve TIER_1/2/3 naming collision | CG-NAMING |
| 4 | Define NormalizedEventFrame TypeScript interface + fallback | CG-11, CG-12 |

### Phase 2: Language Parity (4–5 days)
**Gate:** All 6 Axioms produce correct results for CZ/EN/DE.

| # | Task | Resolves |
|:--|:---|:---|
| 1 | Add EN/DE demo input texts | LG-01 |
| 2 | Extend AI assistant to EN/DE | LG-05 |
| 3 | Add German compliance framing terms (A2) | LG-04 |
| 4 | Add German academic title patterns (A5) | LG-02 |
| 5 | Add German iatrogenic terms (A3) | LG-03 |
| 6 | Set press report lang from analysis language | LG-06 |
| 7 | Add refCode/ECHR columns to CSV export | CG-EXPORT-1 |
| 8 | Implement PII redaction layer | CG-EXPORT-2 |

### Phase 3: Feature Completion (7–10 days)
**Gate:** Full CoC coherence (9/9). GDPR Art.17 cascade delete. SKSS persistence.

| # | Task | Resolves |
|:--|:---|:---|
| 1 | Implement IndexedDB local vault | CG-DB-IDBX |
| 2 | Add cascade `deleteAllUserData(uid)` | CG-DB-DEL |
| 3 | Add Firestore rules for fast_indices | CG-05 |
| 4 | Implement SKSS persistence | CG-SKSS |
| 5 | Add RLHF feedback endpoint | CG-RLHF |
| 6 | Translate researchcore.tsx to English primary | LG-08 |

---

## Launch Gates

| Gate | Condition | Requires |
|:---|:---|:---|
| **Tier 1 Beta (CZ)** | No GDPR violations, core pipeline functional | Phase 0 + Phase 1 |
| **Tier 1 EN/DE** | Language parity for Axiom checks and UI | Phase 0 + 1 + 2 |
| **Tier 2 Professional** | ECHR-mapped CSV, zero-knowledge, Defense Synthesis in pipeline | Phase 0 + 1 + 2 |
| **Tier 3 Institutional** | SKSS registry, cascade delete, RLHF, batch API | All phases |
| **EU AI Act Conformity** | All phases + legal review + third-party audit + Annex IV docs | All + external |

**Total estimated effort to Tier 1 CZ beta: 7–9 working days**  
**Total effort to full Tier 3 readiness: 18–24 working days**

---

## Audit Trail

| Date | Event | Source |
|:---|:---|:---|
| 2026-04-07 | Full coherence audit (17 files, 3,534 lines) | Perplexity Computer |
| 2026-04-07 | Delta audit against updated dev files | Perplexity Computer |
| 2026-04-07 | UPDATELOG.md created, RELEASE_NOTES.md and RELEASE_DOCS.md corrected | Perplexity Computer |
| 2026-04-07 | Domain scope correction: removed psychiatry-only framing from all docs. Reframed as domain-agnostic legal–civilisational forensic engine. Updated RELEASE_NOTES.md, RELEASE_DOCS.md, UPDATELOG.md. | SteelsSystem + Perplexity Computer |
| 2026-04-07 | v7.2 System Instruction submitted for coherence audit. See v7.2 Integration Notes below. | SteelsSystem + Perplexity Computer |

---

## [v7.2] System Instruction — Coherence Audit

### What v7.2 Declares vs. What the Code Actually Does

The v7.2 system instruction represents a significant evolution of the forensic protocol. Below is a line-by-line verification against the actual codebase (dev files + repo `main`).

#### Section 0: Identity & Role

| v7.2 Claim | Code Reality | Status |
|:---|:---|:---:|
| "Deconstruct institutional narratives in **psychiatric-legal** documentation" | **SCOPE CONFLICT** — We corrected all project docs to domain-agnostic legal–civilisational scope. This instruction narrows it back to psychiatry. | REWRITE NEEDED |
| "Defensive Architect / Epistemic Resistance" | `gemini.ts` L216: `mindsetApproach \|\| "Standard Defensive Architect"` — matches | ALIGNED |
| "Transition from passive analyzer to influential legal-forensic advocate" | This is a v7.2 evolution. Current `deep1Prompt` says "Defensive mindset: Prioritize subject rights" but does not explicitly frame the engine as an *advocate*. The shift from analyzer → advocate is a meaningful architectural change that should be reflected in the prompt. | PROMPT UPDATE NEEDED |

#### Section 1: Axiomatic Defense Matrix (A1+ to A6+)

The v7.2 axioms are *evolved* versions (A1+ through A6+) of the current A1–A6. Key differences:

| Axiom | v7.2 Definition | Current Code (`gemini.ts`) | Gap |
|:---|:---|:---|:---|
| A1+ | Gap > 30 days = "Institutional Negligence". **Assume missing data favorable to subject.** | L329: Checks `documentationGaps.length === 0` on large input. No 30-day threshold. No favorable-assumption logic. | CODE GAP — need temporal threshold + presumption logic |
| A2+ | Labels without timestamped incident reports = "Linguistic Gaslighting". **Strip evidentiary weight.** | L338–354: Checks compliance terms, flags if not in `auditIntegrity`. Does not strip evidentiary weight or use the term "Linguistic Gaslighting". | PROMPT GAP — term exists in concept but language needs alignment |
| A3+ | Agitation post-dose-increase = **medical error**, not worsening. | L358–367: Checks iatrogenic terms, requires `researchGrounding`. Does not explicitly classify as medical error. Does check both INPUT_A and INPUT_B. | PARTIAL — logic present, conclusion strength differs |
| A4+ | "Lack of Insight" used to invalidate disagreement = **circular logic error**. | L370–378: Checks circular terms including 'anosognosia', 'popírá nemoc'. Requires `epistemicCircularities` populated. | ALIGNED — strong match |
| A5+ | Same expert multiple reviews without oversight = **systemic bias**. | L382–390: Regex for `Dr./MUDr./PhDr.` titles, checks uniqueness. Missing German titles (known gap LG-02). | PARTIAL — logic present, German titles missing |
| A6+ | Courts rubber-stamping medical claims = **ECHR Art.5/6 violation**. | L394–401: Checks judicial terms (CZ+EN), requires `legalMatrix` populated. | ALIGNED — but v7.2 should not limit to "medical claims" (domain-agnostic scope) |

#### Section 2: Operational Pipeline (RELOOP_DECIDE)

| v7.2 Claim | Code Reality | Status |
|:---|:---|:---:|
| PHASE 1 MIND1: Extract entities, dates, dosages, Subject Voice | `gemini.ts` L183–202: MIND1 calls `gemini-2.5-flash` with `mind1Prompt`. Extracts actor/predicate/object/negation/date/lexicalEscalation/iatrogenic/evidentiaryStrength. | ALIGNED |
| MIND1: "Populating immutableCheckpoints is **mandatory**" | `gemini.ts` L205: `const immutableCheckpoints: any[] = []` — **ALWAYS EMPTY**. This is BLOCKER-04 / CG-10 from the audit. v7.2 declares it mandatory but code doesn't populate it. | **CRITICAL CONTRADICTION** |
| PHASE 2 DEEP_1: Cross-reference against A1+–A6+ | `gemini.ts` L204–278: DEEP_1 calls `gemini-3.1-pro-preview` with `deep1Prompt` referencing Axioms A1–A6. | ALIGNED (but axioms are A1–A6, not A1+–A6+) |
| CG-10 requirement: "Do not initiate deductions without factual anchor" | v7.2 correctly references CG-10 from the audit. But code still has empty array. The instruction mandates what the code doesn't enforce. | CODE FIX REQUIRED |
| PHASE 3 LOOP_CYCLE: Self-audit for bias and Semantic Drift | `gemini.ts` L300–421: `runLoopCycleValidation()` checks TRIPARTITE, A1–A6, RULE_001. 120 lines of programmatic validation. | ALIGNED |
| CG-03 requirement: "No PII in output. Cyphered Persistence." | No PII redaction layer exists. Known gap CG-EXPORT-2 from audit. `export.ts` has no masking. `db.ts` `saveFastMetadata()` writes plaintext (BLOCKER-02). | **CRITICAL CONTRADICTION** |

#### Section 3: Subscription Tier Logic

| v7.2 Claim | Code Reality | Status |
|:---|:---|:---:|
| Tier 1 (Survivor): A1/A2 only | No tier-based filtering in `gemini.ts`. All analyses run full A1–A6. | NOT IMPLEMENTED |
| Tier 2 (Advocate): Full A1–A6 + ECHR/CRPD | Current default behavior matches Tier 2. | IMPLICIT |
| Tier 3 (Institutional): Multi-case + SKSS | SKSS field exists in `AuditResponse` (CG-SKSS) but no persistence. No multi-case analysis. | NOT IMPLEMENTED |

#### Section 4: Mandatory Output Schema

| v7.2 Field | AuditResponse Interface | Status |
|:---|:---|:---:|
| `coherenceScore` | `auditIntegrity.overallCoherenceScore` (number) | ALIGNED (different path) |
| `axiomaticViolations[]` | Not a direct field. Violations surface in `discrepancyMatrix`, `legalMatrix`, `auditIntegrity.flagsRaised`. | STRUCTURAL MISMATCH — v7.2 wants a flat violations array, code uses distributed fields |
| `semanticDriftTimeline[]` | `auditIntegrity.semanticDriftDetected` (boolean) + `chronologicalAnomalyTracker` (array with dates) | PARTIAL — drift is detected but not tracked as a timeline with `pathologizingShift` flag |
| `defenseSynthesis{}` | Defense Synthesis is in `App.tsx` `handleDraftAppeal()` — raw REST call bypassing ForensicEngine (BLOCKER-03). Not part of `AuditResponse`. | **CRITICAL CONTRADICTION** |
| `remediationPatches[]` | Not in `AuditResponse` interface. | NOT IMPLEMENTED |

#### Section 5: System Status Claims

| v7.2 Claim | Reality | Status |
|:---|:---|:---:|
| `CG-03: ENCRYPTED` | BLOCKER-01 (localStorage plaintext), BLOCKER-02 (Firestore plaintext). Only `audits/` collection is encrypted. | **FALSE — 2 of 4 storage paths are plaintext** |
| `CG-10: ACTIVE` | `immutableCheckpoints: any[] = []`. Always empty. | **FALSE — declared active but hardcoded empty** |
| `Coherence Target: 9/9` | Current score: 7/9 CYPHER-STATEs aligned. | **ASPIRATIONAL, NOT CURRENT** |

---

### v7.2 Scope Conflict: Psychiatry vs. Domain-Agnostic

The v7.2 instruction opens with: *"deconstruct institutional narratives in **psychiatric-legal** documentation."* This directly contradicts the domain-agnostic correction we pushed to `main` earlier today. Specific issues:

1. **Section 0** — "psychiatric-legal documentation" should read "institutional documentation across any legal–civilisational context"
2. **A1+** — "Institutional Negligence" is already domain-agnostic (good)
3. **A2+** — "Linguistic Gaslighting" is domain-agnostic (good)
4. **A3+** — "Symptoms of Illness" and "dose increase" are psychiatry-specific. For domain-agnostic: generalize to "institutional cause vs. subject condition" (e.g., in immigration: "stress response from detention" vs. "pre-existing condition")
5. **A6+** — "rubber-stamp **medical** claims" should read "rubber-stamp **institutional** claims"
6. **Tier 1** name "Survivor" carries psychiatric connotation. Consider "Individual" or keep "Survivor" but define it broadly.

**Recommendation:** Maintain v7.2's forensic aggression and advocacy stance, but replace domain-specific terms with domain-agnostic equivalents. Psychiatric forensics becomes the *exemplar application*, not the *definitional scope*.

---

### v7.2 Integration Roadmap

To bring the codebase into alignment with v7.2 declarations:

| Priority | Task | Resolves |
|:---|:---|:---|
| **P0** | Populate `immutableCheckpoints` from MIND1 STRONG frames | CG-10 claim "ACTIVE" becomes true |
| **P0** | Encrypt `saveFastMetadata()` and `saveChatHistory()` | CG-03 claim "ENCRYPTED" becomes true |
| **P0** | Remove localStorage plaintext writes | CG-03 claim "ENCRYPTED" becomes true |
| **P1** | Add `axiomaticViolations[]` flat array to AuditResponse | v7.2 output schema alignment |
| **P1** | Add `semanticDriftTimeline[]` with date/term/pathologizingShift | v7.2 output schema alignment |
| **P1** | Move Defense Synthesis into ForensicEngine, add to AuditResponse | v7.2 output schema alignment |
| **P1** | Add `remediationPatches[]` to AuditResponse | v7.2 output schema alignment |
| **P2** | Implement 30-day gap threshold for A1+ | A1+ evolution |
| **P2** | Add tier-based analysis depth filtering | v7.2 Section 3 |
| **P2** | Rewrite v7.2 Section 0 and A3/A6 for domain-agnostic scope | Domain scope alignment |
| **P3** | Add PII redaction layer before all outputs | v7.2 CG-03 "Cyphered Persistence" |

**Net assessment:** v7.2 is a strong architectural vision. The instruction is ahead of the code in several places — particularly the CG-03/CG-10 status claims, the output schema, and the subscription tier logic. Two claims are currently false (ENCRYPTED, ACTIVE). The Plan of Focus phases 0–1 will resolve the P0 items, making the v7.2 status claims truthful.
