# LEX FORENSICA v7.0 — Release Documentation

## [1.0] PRODUCT PROTOTYPE OVERVIEW
LEX FORENSICA v7.0 is a domain-agnostic forensic semantic audit engine designed to detect systemic bias, documentation gaps, and procedural violations across any legal–civilisational context. It is not limited to medical or psychiatric records — the architecture applies to judicial proceedings, administrative decisions, immigration cases, custodial records, regulatory enforcement, and any institutional process where an individual's documented treatment can be forensically compared against their own testimony. It utilises a **Hybrid Forensic Architecture** (MIND1 / DEEP_1 / FAST_2 / LOOP_CYCLE) to provide deterministic extraction, deep reasoning, rapid metadata indexing, and programmatic self-correction.

### [1.1] Intended Usage
- **Legal Defense (any domain):** Identifying grounds for appeal, tort claims, or procedural challenges in cases where institutional documentation contradicts the subject's account — psychiatric, judicial, administrative, migratory, custodial, or regulatory.
- **Institutional Audit:** Detecting systemic framing patterns (compliance bias, iatrogenic framing, procedural shortcuts, documentation gaps) in any official records — clinical notes, court transcripts, police reports, immigration decisions, regulatory findings.
- **Human Rights Monitoring:** Auditing state-actor and institutional documentation for violations of ECHR Art. 3 (prohibition of torture), Art. 5 (liberty), Art. 6 (fair trial), Art. 8 (private life), and CRPD provisions.
- **Cross-Domain Application:** The Axiom system (A1–A6) and Dual Input Protocol are structurally domain-agnostic. Psychiatric forensics is the first and most extensively tested application, but the architecture supports any adversarial document analysis where institutional records and subject testimony must be compared.

---

## [2.0] TECHNICAL SUMMARIZATION (CONTEXTS VERSION)

### [2.1] Architectural Layers
1. **INPUT_A (System Record Layer):** Official documentation (PDF, DOCX, TXT) processed via chunked extraction to handle large datasets on "slower computer" environments.
2. **INPUT_B (Subject Voice Layer):** First-person testimony or witness accounts analysed through the "Metacognitive Influence" protocol to detect imposed narratives, institutional pressure, and systematic misrepresentation across any domain.
3. **LOOP_CYCLE (Self-Correction):** A recursive validation layer that audits the AI's own findings against forensic axioms (A1-A6) before finalization.
4. **FAST_2 (Metadata Indexing):** Rapid extraction of key risk factors and chronology for Firestore indexing, enabling persistent context across sessions.

### [2.2] Looping & Error Detection
The system implements a **Reality Check** protocol during the `LOOP_CYCLE`. This specifically addresses "context exhaustion" in large files by:
- Flagging truncated inputs as "Processing Limitation Errors".
- Cross-referencing extracted entities to prevent semantic drift.
- Validating institutional framing patterns (compliance bias, procedural language, authority assertions) against specific dates to expose documentation gaps.

---

## [3.0] PROFESSIONAL TIMELINE (DEVELOPMENT & RELEASE)

| Phase | Milestone | Description | Status |
| :--- | :--- | :--- | :--- |
| **Q1-2026** | **v7.0-ALPHA** | Initial implementation of the Dual Input Protocol and Gemini 3.1 Pro integration. | COMPLETED |
| **Q2-2026** | **HYBRID-BETA** | Deployment of the FAST_2 indexing layer and Firestore integration for persistent audits. | COMPLETED |
| **Q2-2026** | **LOOP-CORE** | Integration of the LOOP_CYCLE self-correction protocol and Metacognitive Influence logic. | COMPLETED |
| **Q2-2026** | **RELEASE-v7.0** | Final refinement of the "Slower Computer" extraction logic and Release Documentation. | **CURRENT** |
| **Q3-2026** | **v7.1-EXT** | Planned integration of Firebase Extensions for native vector search (Vertex AI). | PLANNED |

---

## [4.0] REFERENCABLE ASPECTS & USAGE
- **Forensic Engine:** `src/services/gemini.ts` -> Core reasoning logic.
- **Research Prompt:** `src/research.ts` -> The "Code of Conduct" and Axiom definitions.
- **Data Persistence:** `src/lib/db.ts` -> Firestore schema and indexing.
- **Interactive Report:** `src/services/export.ts` -> The "Press Report" infographic generator.

---
*Document Version: 7.0.2*
*Author: LEX FORENSICA ARCHITECT*
*Date: 2026-04-06*
