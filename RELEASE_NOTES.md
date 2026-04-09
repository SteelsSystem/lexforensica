# LEX FORENSICA v7.0 — Release Documentation

## [1.0] PRODUCT PROTOTYPE OVERVIEW
LEX FORENSICA v7.0 is a high-fidelity forensic semantic audit engine designed to detect systemic bias, documentation gaps, and procedural violations in legal and medical records. It utilizes a **Hybrid Forensic Architecture** (DEEP_1 / FAST_2) to provide both deep reasoning and rapid metadata indexing.

### [1.1] Intended Usage
- **Legal Defense:** Identifying grounds for appeal or tort claims in cases of involuntary psychiatric hospitalization.
- **Medical Audit:** Detecting "iatrogenic framing" and "compliance bias" in clinical notes.
- **Human Rights Monitoring:** Auditing state-actor documentation for violations of ECHR Art. 3, 5, 6, and 8.

---

## [2.0] TECHNICAL SUMMARIZATION (CONTEXTS VERSION)

### [2.1] Architectural Layers
1. **INPUT_A (System Record Layer):** Official documentation (PDF, DOCX, TXT) processed via chunked extraction to handle large datasets on "slower computer" environments.
2. **INPUT_B (Subject Voice Layer):** First-person testimony analyzed through the "Metacognitive Influence" protocol to detect gaslighting and internalized oppression.
3. **LOOP_CYCLE (Self-Correction):** A recursive validation layer that audits the AI's own findings against forensic axioms (A1-A6) before finalization.
4. **FAST_2 (Metadata Indexing):** Rapid extraction of key risk factors and chronology for Firestore indexing, enabling persistent context across sessions.

### [2.2] Looping & Error Detection
The system implements a **Reality Check** protocol during the `LOOP_CYCLE`. This specifically addresses "context exhaustion" in large files by:
- Flagging truncated inputs as "Processing Limitation Errors".
- Cross-referencing extracted entities to prevent semantic drift.
- Validating "compliance framing" against specific dates to expose documentation gaps.

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
*Document Version: 7.0.1*
*Author: LEX FORENSICA ARCHITECT*
*Date: 2026-04-06*
