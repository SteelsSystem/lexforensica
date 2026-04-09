# LEX FORENSICA — Visual Network Snapshot
## Auto-Generated Documentation · April 2026

> **Generation Rule**: This document updates automatically after every visual change across either repository.
> **Trigger**: commit to `SteelsSystem/SteelsSystem.github.io` or `control-room/` in `SteelsSystem/AI-Forensica`

---

## Visual Network State

| Page | URL | Persona State | Status | Last Change |
|------|-----|--------------|--------|-------------|
| **Živý Archiv** | [steelssystem.github.io](https://steelssystem.github.io) | STATIC · MIND1 | ✅ LIVE | Pop-up target definition added — 2026-04-09 |
| **Introspekce** | [/introspect.html](https://steelssystem.github.io/introspect.html) | SIGNAL CHAIN | ✅ LIVE | Control Room card added to doc-grid (4 cols) — 2026-04-09 |
| **Semantic View** | [/semanticview.html](https://steelssystem.github.io/semanticview.html) | FLUID · REACTIVE | ✅ LIVE | No changes this session |
| **Ambient** | [/ambient.html](https://steelssystem.github.io/ambient.html) | DEEP · MIND2 | ✅ LIVE | No changes this session |
| **Control Room** | [/controlroom.html](https://steelssystem.github.io/controlroom.html) | CONTROL ROOM | ✅ LIVE | Dev Target Status panel · Secret Core section — 2026-04-09 |

---

## Control Room Panel Status

| Panel | Content | Data Source | Status |
|-------|---------|-------------|--------|
| 00 | Dev Target Status | hardcoded (session state) | ✅ ACTIVE · amber |
| 01 | Topological Pipeline Map | SVG concentric rings | ✅ ACTIVE |
| 02 | Pipeline Config · Provider Registry | hardcoded config | ✅ ACTIVE |
| 03 | File Topology (v8 codebase) | hardcoded file list | ✅ ACTIVE |
| 04 | Axiom Matrix A1-A6 + special rules | hardcoded AXIOM_DEFINITIONS | ✅ ACTIVE |
| 05 | Instructional Phrase Engine | hardcoded from prompts | ✅ ACTIVE |
| 06 | Visual Network Entry Points | internal links | ✅ ACTIVE |
| 06 | Blocker Tracker | hardcoded 6 blockers | ✅ ACTIVE |
| 06 | Schema Validation · Placeholder Audit | hardcoded 10 checks | ✅ ACTIVE |
| 06 | Coverage Metrics | hardcoded bars | ✅ ACTIVE |
| 07 | Operational Instruction Sidebar | hardcoded directives | ✅ ACTIVE |

---

## Pipeline Architecture State

```
MIND1 (gemini-2.5-flash · temp=0.1)
  ↓ NormalizedEventFrame[]
BRIDGE (hashFact · SHA-256)
  ↓ FactCheckpoint[] + mind1OutputHash
DEEP_1 (gemini-3.1-pro-preview · thinkingLevel=HIGH · webSearch=ON)
  ↓ AuditResponse (18 top-level fields)
LOOP_CYCLE (ForensicNLP.verifyIntegrity · 12 checks)
  ↓ [if CRITICAL: re-run DEEP_1, max 2×]
DEFENSE (gemini-3.1-pro-preview · thinkingLevel=HIGH)
  ↓ DefenseSynthesis
```

**Pipeline Seal**: `MIND1→BRIDGE→DEEP_1→LOOP_CYCLE→DEFENSE_SYNTHESIS`
**STOP_SERVER**: Active — halts pipeline if seal is tampered

---

## Codebase Coverage Metrics

| Metric | Current | Target | Delta |
|--------|---------|--------|-------|
| Placeholder Match Rate | 90% (9/10) | 100% | −10% |
| Axiom Coverage (LOOP_CYCLE) | 46% (6/13) | 100% | −54% |
| LLM Output Schema Validation | 0% | 100% | −100% |
| Test Coverage | 0% | >80% | −80% |
| LOOP_CYCLE Checks | 12 | 12 | ✅ |
| MC Rules Active | 7/8 | 8/8 | −1 (MC-5 DIRECTIVE) |
| Orphan Files (root legacy) | 6 | 0 | −6 |
| Singleton Init Safety | 1 guard | full | partial |

---

## Secret Core Condensation State

| Value | Status |
|-------|--------|
| `IDENTITY` | LEX_FORENSICA_v8 |
| `AUTHORITY_ROOT` | Ω > Δ > ◈ |
| `PIPELINE_SEAL` | verified |
| `LOOP_MAX` | 2 |
| `INPUT_B_MIN` | 50 chars |
| `COHERENCE_FLOOR` | 50/100 |
| `STOP_SERVER` | 6 activation conditions defined |
| `verifySecretCore()` | integrated in analyzeDeep() |

**Stress Test Thresholds**:
- BiasScore trigger: 0.7
- LexicalEscalation max: 3
- SemanticDrift floor: 0.75
- Hallucination risk max: 0.3
- ExpertRepeat max: 1
- DocGap trigger: 14 days

---

## Commit Trail (Recent)

| Commit | Description | Phase |
|--------|-------------|-------|
| `b166c7d` | SKSS metaconduct integrity core — cypher-state database | MC Complete |
| `4f94107` | Metaconduct self-governing rules MC-3, MC-5, MC-6 | MC Rules |
| `203d576` | Control-room dev target status panel sync | Visual |
| `7dc674f` | Control-room operational visualization dashboard | Visual |
| `2e4fd4a` | Placeholder sync + pipeline hash + TIER substitution | Bugfix |

---

*Auto-generated after visual phase completion · Trigger: `commit to visual network files`*
*Next regeneration: after A7-A13 axiom implementation or next visual change*
