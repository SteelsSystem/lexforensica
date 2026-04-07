# LEX FORENSICA — UPDATE LOG

> Canonical record of architectural changes, known flaws, remediation status, and launch gate progress.  
> Last updated: 2026-04-07 | Maintainer: SteelsSystem

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
