export const DB_LANGUAGES = [
  { code: 'EN', name: 'English (Reference)', type: 'global' },
  { code: 'CZENG', name: 'Czenglish (Mechanický Překlad)', type: 'personalized' }
] as const;

export type AppLanguage = typeof DB_LANGUAGES[number]['code'];

export const UI_DICT: Record<AppLanguage, any> = {
  EN: {
    title: "LEX FORENSICA",
    version: "v8.3",
    subtitle: "FORENSIC SEMANTIC AUDIT ENGINE • RESEARCH SOURCING LAYER",
    tab1: "01_DUAL_INPUT_INGESTION",
    tab2: "02_EVIDENCE_MATRIX",
    tab3: "03_VISUAL_CONTEXT",
    tab4: "04_SYSTEM_ALIGNMENT",
    refLabels: "REFERENCE LABELS",
    usageLimits: "USAGE LIMITS",
    login: "LOGIN",
    logout: "LOGOUT",
    executeLoop: "EXECUTE AI LOOP_CYCLE",
    uploadDoc: "Upload Document",
    analyzing: "Analyzing...",
    sysError: "System Error",
    inputA: "INPUT_A: DIAGNOSTIC REPORT",
    inputB: "INPUT_B: SUBJECT TESTIMONY",
    generateDraft: "GENERATE LEGAL DRAFT",
    drafting: "Drafting...",
    downloadCsv: "DOWNLOAD CSV",
    saveAudit: "SAVE AUDIT",
    aiAnalysis: "AI Analysis:",
    fileUploads: "File Uploads:",
    export: "Export:",
    unlimited: "Unlimited (Preview)",
    maxFiles: "Max 10MB / 10 files",
    formats: "CSV / JSON",
    runLoopFirst: "Run the AI Loop Cycle first to generate the visual context."
  },
  CZENG: {
    title: "LEX FORENSICA",
    version: "v8.3",
    subtitle: "FORENZNÍ SÉMANTICKÝ AUDIT ENGINE • VÝZKUMNÁ SOURCING VRSTVA",
    tab1: "01_DUÁLNÍ_INPUT_INGESCE",
    tab2: "02_DISCREPANCY_MATICE",
    tab3: "03_VIZUÁLNÍ_KONTEXT",
    tab4: "04_SYSTÉMOVÝ_ALIGNMENT",
    refLabels: "REFERENČNÍ LABELY (SKSS)",
    usageLimits: "USAGE LIMITY (MIND1/MIND2)",
    login: "LOGIN (ZERO-KNOWLEDGE)",
    logout: "LOGOUT",
    executeLoop: "EXEKUOVAT AI LOOP_CYCLE",
    uploadDoc: "Uploadovat Dokument (MIND1 Statický)",
    analyzing: "Analyzování (DEEP_1 Dynamický)...",
    sysError: "Systémový Error (Conduct Violation)",
    inputA: "INPUT_A: SYSTÉMOVÝ RECORD (Akuzace)",
    inputB: "INPUT_B: SUBJECT VOICE (Obrana)",
    generateDraft: "GENEROVAT LEGAL DEFENSE DRAFT",
    drafting: "Draftování (Defense Synthesis)...",
    downloadCsv: "DOWNLOAD CSV (FAST_2)",
    saveAudit: "ULOŽIT AUDIT (RLHF Smyčka)",
    aiAnalysis: "AI Analýza (MIND2):",
    fileUploads: "File Uploady (MIND1):",
    export: "Export (Fluidní Stav):",
    unlimited: "Neomezeno (Preview)",
    maxFiles: "Max 10MB / 10 souborů",
    formats: "CSV / JSON",
    runLoopFirst: "Nejdříve exekuujte AI LOOP_CYCLE pro vygenerování vizuálního kontextu a SKSS mapování."
  }
};