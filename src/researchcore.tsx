/**
 * LEX FORENSICA - JÁDROVÁ LOGIKA A DATABÁZE VÝZNAMŮ (Architektura v4.0 / v7.0)
 * * Tento modul byl redefinován podle "Code of Conduct Reference".
 * Představuje plně data-agnostický full-stack boilerplate pro AI Ingestion.
 * Radikálně odděluje byznysovou logiku do vysoce specializovaných analytických
 * modulů (Causal Chronometer a Semantic Bridge).
 * * Systém neprovádí pasivní sumarizaci, ale AKTIVNĚ a AGRESIVNĚ vyhledává:
 * 1. Skryté logické trhliny.
 * 2. Fonetické a terminologické zkreslení sémantiky.
 * 3. Neospravedlnitelná časová vakua.
 */

// ==========================================
// 1. DATA-AGNOSTICKÁ KATEGORIZACE A STRUKTUROVANÁ LOGIKA
// ==========================================

export enum CausalityLayer {
  ROOT_CAUSE = "Kořenová příčina (Systémové nastavení/Záměr)",
  PROCESS_FAILURE = "Procesní selhání (Nedodržení závazných postupů)",
  COGNITIVE_BIAS = "Kognitivní a systémový bias (Pochybení lidského operátora)",
  EXECUTION_ERROR = "Chyba provedení (Aktivní konání/Nečinnost)",
  IMPACT = "Přímý následek (Dopad na práva/subjekt)",
}

// Analytická doména: Mapování neospravedlnitelných časových vakuí
export enum ChronologicalAnomaly {
  TIME_VACUUM = "Neospravedlnitelné časové vakuum (Prodleva bez legálního důvodu)",
  LOGICAL_CRACK = "Skrytá logická trhlina v posloupnosti (Příčina následuje po následku)",
  DEADLINE_EVASION = "Účelové obcházení lhůt (Umělé prodlužování řízení)",
}

// Analytická doména: Mapování zkreslení významu
export enum SemanticDistortion {
  TERMINOLOGICAL_BIAS = "Terminologické zkreslení sémantiky (Účelová redefinice pojmu)",
  PHONETIC_BIAS = "Fonetické zkreslení (Záměna podobně znějících/vypadajících entit)",
  CONTEXT_OMISSION = "Vytržení z kontextu (Zamlčení určujícího faktu)",
}

export enum LegalImpact {
  CONSTITUTIONAL = "Ústavněprávní rozměr (Zásah do ZPS)",
  CRIMINAL = "Trestněprávní rovina",
  ADMINISTRATIVE = "Správní / Medicínské / Administrativní pochybení",
  CIVIL = "Občanskoprávní / Náhrada škody",
  PROCEDURAL = "Procesní vada s fatálním vlivem na validitu",
}

// ==========================================
// 2. SPECIALIZOVANÉ ANALYTICKÉ MODULY (Struktury)
// ==========================================

// Datová struktura pro Causal Chronometer (Časová analytika)
export interface ChronometerData {
  expectedSequence: string;
  actualSequence: string;
  anomalyType: ChronologicalAnomaly;
  timeGapDuration: string; // např. "45 dní"
  unjustifiedVacuum: boolean; 
}

// Datová struktura pro Semantic Bridge (Sémantická analytika)
export interface SemanticBridgeData {
  originalTerm: string;
  distortedTerm: string;
  distortionType: SemanticDistortion;
  cognitiveBiasDetected: boolean;
  impactOnMeaning: string; // Jak toto zkreslení mění vyznění celé situace
}

export interface ForensicEvidence {
  id: string;
  contentSnippet: string; // Připraveno pro hybridní pgvector vyhledávání
  source: string;
  timestamp: string;
}

// ==========================================
// 3. STRUKTURA "MEZIPROCESU" (Iterativní interakční smyčka)
// ==========================================

export interface AnalyticalNode {
  nodeId: string;
  eventDescription: string;
  causality: CausalityLayer;
  impactLayer: LegalImpact;
  
  // Přímé napojení na vysoce specializované moduly
  chronometerAnalysis?: ChronometerData;
  semanticAnalysis?: SemanticBridgeData;
  
  linkedEvidenceIds: string[];
  
  // Logické odůvodnění detekce vady (prokazování systémového pochybení)
  logicalJustification: string;
  mitigationRequirement: string; // Jak měla instituce správně postupovat
}

// ==========================================
// 4. DATABÁZE SYSTÉMOVÝCH PROMPTŮ (AI Ingestion Pipeline)
// ==========================================
// Agresivní instrukce pro model (např. Gemini 2.5), aby nedělal pasivní sumarizace,
// ale aplikoval hlubokou forenzní kontrolu.

export interface PromptTemplate {
  phase: string;
  systemContext: string;
  instructionPlan: string[];
  expectedOutputFormat: string;
}

export const ForensicAIPromptDatabase: Record<string, PromptTemplate> = {
  PHASE_1_INGESTION: {
    phase: "AI Ingestion Pipeline: Extrakce a Vektorová Příprava",
    systemContext: "Jsi data-agnostický forenzní extraktor. Tvá práce není text sumarizovat, ale rozbít jej na elementární faktické vektory (entity, časy, tvrzení). Ignoruj emotivní zabarvení dokumentů.",
    instructionPlan: [
      "1. Extrahuj veškeré časové údaje a vytvoř rigidní chronologickou osu.",
      "2. Identifikuj všechny izolované termíny, výroky a definice.",
      "3. Připrav data pro iterativní interakční smyčku."
    ],
    expectedOutputFormat: "JSON pole objektů typu ForensicEvidence."
  },
  PHASE_2_CAUSAL_CHRONOMETER: {
    phase: "Speciální modul: Causal Chronometer",
    systemContext: "Jsi 'Causal Chronometer'. Tvým jediným cílem je hledat skryté logické trhliny a neospravedlnitelná časová vakua v institucionálních/procesních spisech.",
    instructionPlan: [
      "1. Porovnej extrahovanou časovou osu se standardními procesními lhůtami.",
      "2. Agresivně upozorni na jakoukoliv prodlevu (Time Vacuum), pro kterou chybí logické a právní opodstatnění.",
      "3. Odhal situace, kdy formální úkon předcházel reálnému zjištění (Logical Crack)."
    ],
    expectedOutputFormat: "JSON struktura doplňující AnalyticalNode o chronometerAnalysis."
  },
  PHASE_3_SEMANTIC_BRIDGE: {
    phase: "Speciální modul: Semantic Bridge",
    systemContext: "Jsi 'Semantic Bridge'. Tvou rolí je detekovat hluboce zakořeněné kognitivní biasy, fonetické a terminologické zkreslení sémantiky.",
    instructionPlan: [
      "1. Analyzuj, zda se v průběhu případu nemění definice klíčových pojmů (např. z 'pochybení' na 'drobný nedostatek').",
      "2. Detekuj vytržení z kontextu a účelovou manipulaci s textem.",
      "3. Kategorizuj nalezená zkreslení a popiš jejich dopad na objektivitu."
    ],
    expectedOutputFormat: "JSON struktura doplňující AnalyticalNode o semanticAnalysis."
  },
  PHASE_4_ITERATIVE_SYNTHESIS: {
    phase: "Závěrečná Iterativní Smyčka a Eliminace Biasu",
    systemContext: "Jsi hlavní nezávislý auditor. Tvořím nevyvratitelnou důkazní mapu pro neziskové organizace, auditorství nebo univerzitní kliniky.",
    instructionPlan: [
      "1. Zkompletuj uzly (AnalyticalNodes) z chronometru a sémantického mostu.",
      "2. Vytvoř přímý důkazní řetězec ukazující na systémové selhání.",
      "3. Formuluj výstup tak, aby sloužil jako technologická páka k prokazování chyb."
    ],
    expectedOutputFormat: "Strukturovaný formát dat pro front-end (HTML report / UI vizualizace)."
  }
};

// ==========================================
// 5. ROZŠIŘITELNOST TŘETÍ STRANOU (Modulární registry)
// ==========================================

export class ForensicEngineContext {
  private static externalModules: Record<string, any> = {};

  static registerExternalLogic(moduleName: string, logicDefinition: any) {
    this.externalModules[moduleName] = logicDefinition;
  }

  static getContext() {
    return {
      causality: Object.values(CausalityLayer),
      chronologicalAnomalies: Object.values(ChronologicalAnomaly),
      semanticDistortions: Object.values(SemanticDistortion),
      impacts: Object.values(LegalImpact),
      prompts: ForensicAIPromptDatabase,
      externalLogic: this.externalModules
    };
  }
}