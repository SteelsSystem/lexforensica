# LEX FORENSICA v7.0 - Release Documentation

## Overview
LEX FORENSICA v7.0 is an advanced forensic semantic audit engine designed to analyze dual inputs (system records vs. subject testimony) for medical and legal discrepancies. It leverages the Gemini 2.5 Flash model to identify time vacuums, semantic distortions, and potential human rights violations.

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
- **Gemini API**: Utilizes `gemini-2.5-flash-preview-09-2025` for deep semantic analysis.
- **Structured Output**: Enforces strict JSON schema responses from the LLM to populate the Discrepancy Matrix and Visual Context metrics reliably.
- **Defense Synthesis Engine**: A secondary LLM prompt generates a formal legal appeal outline based on the identified discrepancies.

## Core Features
1. **Dual Input Ingestion**: Side-by-side text areas for official system records and subject testimony.
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
