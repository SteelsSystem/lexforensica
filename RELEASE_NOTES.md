# LEX FORENSICA v7.0 - Release Documentation

## Overview
LEX FORENSICA v7.0 is a domain-agnostic forensic semantic audit engine that analyzes dual inputs (institutional records vs. subject testimony) across any legal–civilisational context. It applies a two-phase AI pipeline (MIND1 extraction → DEEP_1 reasoning) to surface temporal gaps, semantic distortions, procedural violations, and human rights breaches — whether the source material is psychiatric, judicial, administrative, migratory, custodial, or any other institutional process where an individual's rights are adjudicated by a system.

## Technical Architecture

### 1. Frontend Framework
- **React 19**: Core UI library.
- **Vite**: Build tool for fast development and optimized production builds.
- **Tailwind CSS v4**: Utility-first CSS framework for styling.
- **React Router DOM v7**: Client-side routing for seamless navigation between Ingestion, Matrix, and Visual Context views.
- **Lucide React**: Iconography.

### 2. Security & Data Management
- **Client-Side Encryption**: Implements AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations). User data is encrypted locally before transmission.
- **Zero-Knowledge Vault**: The `VaultPasswordModal` ensures that the encryption key (derived from the user's password) is never stored on the server or in persistent local storage.
- **Firebase/Firestore**: Provides secure, scalable backend storage for encrypted audit records. User authentication is handled via Firebase Auth (Google Provider).

### 3. AI Integration
- **Gemini API (Dual-Model Pipeline)**: MIND1 static preprocessing via `gemini-2.5-flash` (deterministic NLP extraction, temp=0.1) feeds into DEEP_1 forensic reasoning via `gemini-3.1-pro-preview` (neuro-symbolic abduction, ThinkingLevel.HIGH).
- **Structured Output**: Enforces strict JSON schema responses (`responseMimeType: application/json`) to populate the Discrepancy Matrix, Legal Matrix, and Causal Map.
- **LOOP_CYCLE Validation**: Programmatic post-generation check against six forensic Axioms (A1–A6) and three Conduct Violation Rules. Re-prompts on CRITICAL violations (max 2 cycles).
- **Defense Synthesis Engine**: Generates formal legal defense drafts from structured audit findings. Domain-adaptive — supports ECHR, national civil codes, administrative law, and customisable legal frameworks.

## Core Features
1. **Dual Input Ingestion**: Side-by-side text areas for any official institutional records (INPUT_A) and subject/witness testimony (INPUT_B). Domain-agnostic — works with psychiatric, judicial, administrative, immigration, custodial, or any other institutional documentation.
2. **AI Loop Cycle**: A visual progress indicator that provides feedback during the multi-step AI analysis process.
3. **Legal Discrepancy Matrix**: A structured table detailing identified anomalies, categorized by severity and reference codes (e.g., `[REF-AX1-VOID]`).
4. **CSV Export**: Allows users to download the discrepancy matrix for further analysis in spreadsheet applications.
5. **Visual Context**: Graphical representations of the data, including a Chronological Anomaly Tracker and Cognitive Bias Distribution chart.
6. **Usage Limits Declaration**: Clear visibility of system constraints (e.g., file upload limits, AI usage) within the application sidebar.

## Professional Timeline Structure
- **Phase 1: Ingestion**: User provides `INPUT_A` and `INPUT_B`.
- **Phase 2: Authentication & Vault**: User authenticates via Google and unlocks the secure vault with a local password.
- **Phase 3: AI Analysis (Loop Cycle)**: The system processes the inputs through the Gemini API, identifying discrepancies and formatting the output.
- **Phase 4: Matrix Generation**: The structured data is presented in the Evidence Matrix.
- **Phase 5: Encryption & Storage**: The results are encrypted client-side and saved to Firestore.
- **Phase 6: Synthesis & Export**: The user can generate a legal defense draft or export the matrix to CSV.
