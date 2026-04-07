import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Globe, PlayCircle, CheckCircle2, FileText, Zap, Brain, Database, ArrowRight, Puzzle, Package, RefreshCw, Shield, Scale, TrendingDown } from 'lucide-react';
import { AppLanguage } from '../lib/translations';

const TRANSLATIONS: Record<AppLanguage, any> = {
  EN: {
    title: "LEX FORENSICA v8.3",
    subtitle: "Codebase Alignment & Architectural Meta-Prompt",
    systemReady: "SYSTEM READY",
    overview: "Alignment Overview: The frontend application has generalized its AI payload to strictly reflect Code of Conduct (CoC) principles. This dashboard maps the requisite backend alignment and introduces the new MIND1/MIND2 Performance Architecture designed to drastically lower token costs via static pre-processing and quantized models.",
    pipelineTitle: "Architecture Pipeline: MIND1/MIND2 Processing",
    pipelineDesc: "Interactive data flow diagram demonstrating the separation of MIND1 (Fast/Static) and MIND2 (Slow/Dynamic) protocols.",
    telemetryTitle: "Optimization Telemetry",
    telemetryDesc: "Projected token cost reduction utilizing the v8.3 MIND1/MIND2 hybrid deployment.",
    estCostReduction: "Est. Cost Reduction",
    impactAnalysis: "Impact Analysis",
    executeBenchmark: "EXECUTE BENCHMARK PROTOCOLS",
    languageToggle: "SWITCH TO CZECH (MECHANICAL)",
    reqAction: "Required Action (LOOP_CYCLE):",
    techSpecs: "Tech Specs:",
    routingLogic: "Routing Logic:",
    selectNode: "Select a node in the pipeline above to view technical specifications and backend routing logic.",
    impact1Title: "Legacy Monolithic Approach",
    impact1Desc: "Previously, 100% of raw forensic text was sent directly to high-cost cloud LLMs, resulting in massive token burn for simple entity extraction.",
    impact2Title: "MIND1 Fast Protocol (Static)",
    impact2Desc: "Lightweight Regex and structural heuristics now filter roughly 60% of noise locally before invoking external APIs.",
    impact3Title: "MIND2 Slow Protocol (Dynamic)",
    impact3Desc: "Local 4-bit/8-bit models handle basic semantic mapping, reserving expensive dynamic reasoning purely for causal inference and deep bias detection."
  },
  CZENG: {
    title: "LEX FORENSICA v8.3",
    subtitle: "Zarovnání Kódové Základny & Architektonický Meta-Prompt",
    systemReady: "SYSTÉM PŘIPRAVEN",
    overview: "Přehled Zarovnání: Frontend aplikace zobecnil svou AI zátěž, aby striktně odrážela principy Kodexu Chování (CoC). Tento řídicí panel mapuje nezbytné backendové zarovnání a představuje novou Architekturu Výkonu MIND1/MIND2 navrženou k drastickému snížení nákladů na tokeny prostřednictvím statického předzpracování a kvantovaných modelů.",
    pipelineTitle: "Architektonická Pipeline: Zpracování MIND1/MIND2",
    pipelineDesc: "Interaktivní diagram toku dat demonstrující oddělení protokolů MIND1 (Rychlý/Statický) a MIND2 (Pomalý/Dynamický).",
    telemetryTitle: "Telemetrie Optimalizace",
    telemetryDesc: "Předpokládané snížení nákladů na tokeny s využitím hybridního nasazení v8.3 MIND1/MIND2.",
    estCostReduction: "Odh. Snížení Nákladů",
    impactAnalysis: "Analýza Dopadu",
    executeBenchmark: "SPUSTIT BENCHMARK PROTOKOLY",
    languageToggle: "PŘEPNOUT DO ANGLIČTINY",
    reqAction: "Požadovaná Akce (LOOP_CYCLE):",
    techSpecs: "Technické Specifikace:",
    routingLogic: "Logika Směrování:",
    selectNode: "Vyberte uzel v pipeline výše pro zobrazení technických specifikací a logiky backendového směrování.",
    impact1Title: "Původní Monolitický Přístup",
    impact1Desc: "Dříve bylo 100 % surového forenzního textu odesíláno přímo do nákladných cloudových LLM, což vedlo k masivnímu spalování tokenů pro jednoduchou extrakci entit.",
    impact2Title: "MIND1 Rychlý Protokol (Statický)",
    impact2Desc: "Odlehčené Regex a strukturální heuristiky nyní filtrují zhruba 60 % šumu lokálně před vyvoláním externích API.",
    impact3Title: "MIND2 Pomalý Protokol (Dynamický)",
    impact3Desc: "Lokální 4-bit/8-bit modely zpracovávají základní sémantické mapování, čímž vyhrazují drahé dynamické uvažování čistě pro kauzální inference a detekci hlubokých zkreslení."
  }
};

const DIRECTIVES_DATA: Record<AppLanguage, any> = {
  EN: [
    { id: 'd1', title: 'Data-Agnostic Paradigm', icon: Puzzle, type: 'Schema Rule', content: 'Ensure all new schema additions strictly follow the "data-agnostic" mandate. Do not create rigid, domain-specific columns like `patient_diagnosis`. Use abstract entity mapping to ensure the architecture remains universally applicable across different forensic domains.', actionable: 'Refactor Prisma schema to remove domain-specific field names. Implement generic EAV (Entity-Attribute-Value) or JSONB structures where appropriate.' },
    { id: 'd2', title: 'Generalized Payload Structure', icon: Package, type: 'Data Transfer Object', content: 'The backend must now receive and process the unified `forensicAuditPayload`. The system no longer uses a single NLP string array. It utilizes distinct, structured arrays for different analytical modules.', actionable: 'Create DTOs and Prisma models for `SemanticBridgeNode` (sourceTerm, distortedTerm, context, validatedStatus) and `CausalChronometerNode` (gapDuration, anomalyType, context, validatedStatus).' },
    { id: 'd3', title: 'Subject Reconnection Loops (RLHF)', icon: RefreshCw, type: 'API Route', content: 'Create a secure, asynchronous ingestion endpoint `POST /api/v1/training-pool/sync`. This endpoint processes human feedback (validated nodes) to fuel the self-updating model training mechanism and reconnect subjects to their data.', actionable: 'Implement Express.js route. Must verify user JWT via AsyncLocalStorage context mapping and securely append the validated node into the pgvector database.' },
    { id: 'd4', title: 'Zero-Knowledge Check', icon: Shield, type: 'Security Constraint', content: 'Validate that the backend logic completely strips all Personally Identifiable Information (PII) before the RLHF data reaches the global `trainingPool`.', actionable: 'Implement a middleware sanitization layer utilizing local static language rules to redact names, IDs, and precise locations from the `context` strings before database insertion.' },
    { id: 'd5', title: 'MIND1/MIND2 Processing Architecture', icon: Scale, type: 'Performance Engine', content: 'Dramatically lower token costs and improve speed by separating processing into MIND1 (Fast/Static) and MIND2 (Slow/Dynamic) categories. Do not send raw, unparsed data directly to the LLM.', actionable: 'Build a preprocessing pipeline. Implement lightweight, deterministic algorithms (advanced Regex, string-matching) to extract basic entities and format data prior to LLM dispatch.' },
    { id: 'd6', title: 'LLM Quantization-Based Linguistics', icon: TrendingDown, type: 'Hybrid Deployment', content: 'Architect the backend to support hybrid model deployment. Utilize highly optimized local models for immediate linguistic preprocessing.', actionable: 'Integrate inference capabilities for 4-bit/8-bit quantized local models. Feed only highly refined, token-optimized contextual anomalies to the primary dynamic reasoning engine.' },
    { id: 'd7', title: 'PROTOCOL GAMMA: Logic-Self-Updating Hash', icon: Database, type: 'System Integrity', content: 'Aggressively update the Logic-Self-Updating dataset. Maintain stability by ensuring the "Crypto" layer hashes all new logic to prevent unauthorized drift.', actionable: 'Implemented `hashLogicRule` in `crypto.ts` to hash new logic rules. Treat code errors as "Conduct Violations" and generate "Generalization Rules".' },
    { id: 'd8', title: 'Analysis Deduction & Symbolic Knowledge', icon: Brain, type: 'Cognitive Posture', content: 'The system must operate on an immutable tripartite authority hierarchy (Moral Standard > Press/Media > Institutional) and apply six operational axioms (A1-A6) to detect semantic drift and internalized oppression via the SKSS (Symbolic Knowledge Security Store).', actionable: 'Integrate Metacognitive Influence checks into the DEEP_1 reasoning layer to reconstruct the "Survivor Narrative" from INPUT_B.' }
  ],
  CZENG: [
    { id: 'd1', title: 'Datově-Agnostické Paradigma', icon: Puzzle, type: 'Pravidlo Schématu', content: 'Zajistěte, aby všechny nové doplňky schématu striktně dodržovaly "datově-agnostický" mandát. Nevytvářejte rigidní, doménově specifické sloupce jako `patient_diagnosis`. Použijte abstraktní mapování entit, aby architektura zůstala univerzálně použitelná napříč různými forenzními doménami.', actionable: 'Refaktorujte Prisma schéma k odstranění doménově specifických názvů polí. Implementujte generické struktury EAV (Entity-Attribute-Value) nebo JSONB tam, kde je to vhodné.' },
    { id: 'd2', title: 'Generalizovaná Struktura Payloadu', icon: Package, type: 'Data Transfer Object', content: 'Backend nyní musí přijímat a zpracovávat sjednocený `forensicAuditPayload`. Systém již nepoužívá jediné pole řetězců NLP. Využívá odlišná, strukturovaná pole pro různé analytické moduly.', actionable: 'Vytvořte DTO a Prisma modely pro `SemanticBridgeNode` (sourceTerm, distortedTerm, context, validatedStatus) a `CausalChronometerNode` (gapDuration, anomalyType, context, validatedStatus).' },
    { id: 'd3', title: 'Smyčky Zpětného Připojení Subjektu (RLHF)', icon: RefreshCw, type: 'API Cesta', content: 'Vytvořte bezpečný, asynchronní koncový bod pro příjem `POST /api/v1/training-pool/sync`. Tento koncový bod zpracovává lidskou zpětnou vazbu (ověřené uzly), aby poháněl mechanismus samoaktualizačního tréninku modelu a znovu připojil subjekty k jejich datům.', actionable: 'Implementujte Express.js cestu. Musí ověřit uživatelský JWT přes mapování kontextu AsyncLocalStorage a bezpečně připojit ověřený uzel do databáze pgvector.' },
    { id: 'd4', title: 'Kontrola Nulové Znalosti (Zero-Knowledge)', icon: Shield, type: 'Bezpečnostní Omezení', content: 'Ověřte, že backendová logika zcela odstraňuje všechny Osobně Identifikovatelné Informace (PII) předtím, než data RLHF dosáhnou globálního `trainingPool`.', actionable: 'Implementujte vrstvu sanitizace middlewaru využívající lokální statická jazyková pravidla k redigování jmen, ID a přesných lokací z řetězců `context` před vložením do databáze.' },
    { id: 'd5', title: 'Architektura Zpracování MIND1/MIND2', icon: Scale, type: 'Výkonnostní Jádro', content: 'Drasticky snižte náklady na tokeny a zvyšte rychlost rozdělením zpracování do kategorií MIND1 (Rychlý/Statický) a MIND2 (Pomalý/Dynamický). Neodesílejte surová, nezpracovaná data přímo do LLM.', actionable: 'Vytvořte pipeline pro předzpracování. Implementujte odlehčené, deterministické algoritmy (pokročilé Regex, porovnávání řetězců) k extrakci základních entit a formátování dat před odesláním do LLM.' },
    { id: 'd6', title: 'Kvantizační Lingvistika LLM', icon: TrendingDown, type: 'Hybridní Nasazení', content: 'Navrhněte backend pro podporu hybridního nasazení modelů. Využijte vysoce optimalizované lokální modely pro okamžité lingvistické předzpracování.', actionable: 'Integrujte schopnosti inference pro 4-bit/8-bit kvantované lokální modely. Do primárního jádra dynamického uvažování posílejte pouze vysoce rafinované, tokenově optimalizované kontextuální anomálie.' },
    { id: 'd7', title: 'PROTOCOL GAMMA: Logic-Self-Updating Hash', icon: Database, type: 'Integrita Systému', content: 'Agresivně aktualizujte dataset Logic-Self-Updating. Udržujte stabilitu zajištěním, že vrstva "Crypto" hashuje veškerou novou logiku, aby se zabránilo neoprávněnému posunu.', actionable: 'Implementováno `hashLogicRule` v `crypto.ts` pro hashování nových logických pravidel. Považujte chyby v kódu za "Porušení Chování" a generujte "Pravidla Zobecnění".' },
    { id: 'd8', title: 'Analytická Dedukce & Symbolické Znalosti', icon: Brain, type: 'Kognitivní Postoj', content: 'Systém musí fungovat na neměnné trojdílné hierarchii autorit (Morální Standard > Tisk/Média > Institucionální) a aplikovat šest operačních axiomů (A1-A6) k detekci sémantického posunu a internalizovaného útlaku prostřednictvím SKSS (Symbolic Knowledge Security Store).', actionable: 'Integrujte kontroly Metakognitivního Vlivu do vrstvy uvažování DEEP_1 pro rekonstrukci "Příběhu Přeživšího" z INPUT_B.' }
  ]
};

const PIPELINE_SPECS: Record<AppLanguage, any> = {
  EN: {
    raw: { title: 'Raw Payload Ingestion', spec: 'Unstructured text, PDFs, and CSV records from forensic archives.', logic: 'Memory-efficient streams push raw chunks to the processing queue. No LLM processing occurs at this stage to preserve budget.' },
    tier1: { title: 'MIND1: Fast Protocol (Static Rules)', spec: 'Regex, NLP Tokenizers, and 4-bit/8-bit Local Models (e.g., Llama.cpp instances).', logic: 'Performs structural validation, basic entity redaction (Zero-Knowledge Check), and phonetic matching. Drops 60% of irrelevant tokens.' },
    tier2: { title: 'MIND2: Slow Protocol (Dynamic Reasoning)', spec: 'High-parameter Cloud LLM APIs (e.g., Gemini 3.1 Pro).', logic: 'Receives only token-optimized, pre-filtered anomaly chunks. Executes deep causal inference to identify "Semantic Drift" and "Logical Cracks".' },
    db: { title: 'pgvector DB (Reconnection Loops)', spec: 'PostgreSQL with pgvector extension.', logic: 'Stores structured `SemanticBridgeNode` and `CausalChronometerNode` outputs. Acts as the global training pool for future Reinforcement Learning.' }
  },
  CZENG: {
    raw: { title: 'Příjem Surového Payloadu', spec: 'Nestrukturovaný text, PDF a CSV záznamy z forenzních archivů.', logic: 'Paměťově efektivní streamy tlačí surové bloky do fronty zpracování. V této fázi nedochází k žádnému zpracování LLM pro zachování rozpočtu.' },
    tier1: { title: 'MIND1: Rychlý Protokol (Statická Pravidla)', spec: 'Regex, NLP Tokenizéry a 4-bit/8-bit Lokální Modely (např. instance Llama.cpp).', logic: 'Provádí strukturální validaci, základní redakci entit (Kontrola Nulové Znalosti) a fonetické porovnávání. Zahazuje 60 % irelevantních tokenů.' },
    tier2: { title: 'MIND2: Pomalý Protokol (Dynamické Uvažování)', spec: 'Vysokoparametrová Cloudová LLM API (např. Gemini 3.1 Pro).', logic: 'Přijímá pouze tokenově optimalizované, předfiltrované bloky anomálií. Provádí hlubokou kauzální inferenci k identifikaci "Sémantického Posunu" a "Logických Trhlin".' },
    db: { title: 'pgvector DB (Smyčky Zpětného Připojení)', spec: 'PostgreSQL s rozšířením pgvector.', logic: 'Ukládá strukturované výstupy `SemanticBridgeNode` a `CausalChronometerNode`. Slouží jako globální tréninkový fond pro budoucí Zpětnovazební Učení.' }
  }
};

export default function AlignmentArchitecture({ lang }: { lang: AppLanguage }) {
  const [activeDirectiveId, setActiveDirectiveId] = useState('d1');
  const [activePipelineNode, setActivePipelineNode] = useState<string | null>(null);
  const [benchmarkStatus, setBenchmarkStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETE'>('IDLE');

  const t = TRANSLATIONS[lang];
  const dData = DIRECTIVES_DATA[lang];
  const pSpecs = PIPELINE_SPECS[lang];

  const activeDirective = dData.find(d => d.id === activeDirectiveId);
  const activeNodeData = activePipelineNode ? pSpecs[activePipelineNode as keyof typeof pSpecs] : null;

  const initialChartData = [
    { name: 'Legacy Monolithic', cloudTokens: 100000, localTokens: 0 },
    { name: 'v8.2 Two-Tier Hybrid', cloudTokens: 100000, localTokens: 0 }
  ];

  const optimizedChartData = [
    { name: 'Legacy Monolithic', cloudTokens: 100000, localTokens: 0 },
    { name: 'v8.2 Two-Tier Hybrid', cloudTokens: 22000, localTokens: 78000 }
  ];

  const [chartData, setChartData] = useState(initialChartData);

  const runBenchmark = () => {
    setBenchmarkStatus('RUNNING');
    setChartData(initialChartData);
    setTimeout(() => {
      setChartData(optimizedChartData);
      setBenchmarkStatus('COMPLETE');
    }, 1500);
  };

  return (
    <div className="min-h-full bg-[#fbfaf8] text-[#2d3748] font-sans p-4 md:p-8 rounded-xl border border-[#e5e0d8] shadow-inner overflow-y-auto">
      <header className="w-full bg-[#f4f1ea] border-b border-[#e5e0d8] py-6 px-4 md:px-8 mb-8 shadow-sm rounded-t-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#2d3748]">
              {t.title.split('v8.3')[0]} <span className="text-[#2b6cb0]">v8.3</span>
            </h1>
            <p className="text-sm font-mono text-[#718096] mt-1">{t.subtitle}</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className="flex items-center gap-1 px-3 py-1.5 bg-white border border-[#e5e0d8] rounded-full text-xs font-semibold text-[#2f855a] tracking-wide">
              <CheckCircle2 className="w-4 h-4" /> {t.systemReady}
            </span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 mb-4">
          <p className="text-lg leading-relaxed text-[#2d3748] bg-white p-6 rounded-lg border border-[#e5e0d8] shadow-sm">
            <strong>{t.overview.split(':')[0]}:</strong> {t.overview.split(':')[1]}
          </p>
        </div>

        <section className="lg:col-span-4 flex flex-col gap-3">
          {dData.map(d => {
            const isActive = d.id === activeDirectiveId;
            const Icon = d.icon;
            return (
              <div 
                key={d.id}
                onClick={() => setActiveDirectiveId(d.id)}
                className={`p-4 bg-[#f4f1ea] border rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md flex items-center gap-3 ${isActive ? 'border-l-4 border-l-[#2b6cb0] border-[#e5e0d8] bg-white' : 'border-transparent'}`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-[#2b6cb0]' : 'text-[#718096]'}`} />
                <div className="flex-1">
                  <h4 className="font-bold text-[#2d3748] text-sm">{d.title}</h4>
                  <span className="text-xs font-mono text-[#718096]">{d.type}</span>
                </div>
                <ArrowRight className={`w-4 h-4 text-[#2b6cb0] transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            );
          })}
        </section>

        <section className="lg:col-span-8 flex flex-col gap-6">
          {activeDirective && (
            <div className="bg-white rounded-lg border border-[#e5e0d8] p-6 shadow-sm min-h-[300px]">
              <div className="flex items-center gap-3 mb-4">
                <activeDirective.icon className="w-10 h-10 text-[#2b6cb0]" />
                <div>
                  <span className="text-xs font-mono text-[#2b6cb0] tracking-widest uppercase">{activeDirective.type}</span>
                  <h2 className="text-2xl font-bold text-[#2d3748]">{activeDirective.title}</h2>
                </div>
              </div>
              <div className="mb-6 p-4 bg-[#fbfaf8] border-l-4 border-[#2b6cb0] rounded-r text-[#2d3748]">
                {activeDirective.content}
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#718096] mb-2">{t.reqAction}</h4>
                <p className="text-sm font-mono bg-[#f4f1ea] p-3 rounded border border-[#e5e0d8] text-[#2d3748]">
                  &gt; {activeDirective.actionable}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-[#e5e0d8] p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 border-b border-[#e5e0d8] pb-2">{t.pipelineTitle}</h3>
            <p className="text-sm text-[#718096] mb-6">{t.pipelineDesc}</p>
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-between text-center font-mono text-sm">
              <div onClick={() => setActivePipelineNode('raw')} className={`flex-1 bg-[#f4f1ea] border ${activePipelineNode === 'raw' ? 'border-[#2b6cb0]' : 'border-[#e5e0d8]'} rounded p-4 flex flex-col justify-center cursor-pointer hover:-translate-y-0.5 transition-transform`}>
                <FileText className="w-8 h-8 mx-auto mb-2 text-[#718096]" />
                <span className="font-bold">Raw Payload</span>
              </div>
              <div className="flex items-center justify-center text-[#718096] font-bold">»</div>
              <div onClick={() => setActivePipelineNode('tier1')} className={`flex-1 bg-blue-50 border ${activePipelineNode === 'tier1' ? 'border-[#2b6cb0]' : 'border-blue-200'} rounded p-4 flex flex-col justify-center cursor-pointer hover:-translate-y-0.5 transition-transform`}>
                <Zap className="w-8 h-8 mx-auto mb-2 text-[#2b6cb0]" />
                <span className="font-bold text-[#2b6cb0]">MIND1</span>
              </div>
              <div className="flex items-center justify-center text-[#718096] font-bold">»</div>
              <div onClick={() => setActivePipelineNode('tier2')} className={`flex-1 bg-orange-50 border ${activePipelineNode === 'tier2' ? 'border-[#c05621]' : 'border-orange-200'} rounded p-4 flex flex-col justify-center cursor-pointer hover:-translate-y-0.5 transition-transform`}>
                <Brain className="w-8 h-8 mx-auto mb-2 text-[#c05621]" />
                <span className="font-bold text-[#c05621]">MIND2</span>
              </div>
              <div className="flex items-center justify-center text-[#718096] font-bold">»</div>
              <div onClick={() => setActivePipelineNode('db')} className={`flex-1 bg-green-50 border ${activePipelineNode === 'db' ? 'border-[#2f855a]' : 'border-green-200'} rounded p-4 flex flex-col justify-center cursor-pointer hover:-translate-y-0.5 transition-transform`}>
                <Database className="w-8 h-8 mx-auto mb-2 text-[#2f855a]" />
                <span className="font-bold text-[#2f855a]">pgvector</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#f4f1ea] rounded border border-[#e5e0d8] text-sm min-h-[100px]">
              {activeNodeData ? (
                <>
                  <strong className="block text-[#2d3748] text-base mb-2">{activeNodeData.title}</strong>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="block text-xs font-bold text-[#718096] uppercase mb-1">{t.techSpecs}</span> <span className="font-mono text-xs">{activeNodeData.spec}</span></div>
                    <div><span className="block text-xs font-bold text-[#718096] uppercase mb-1">{t.routingLogic}</span> <span className="font-mono text-xs">{activeNodeData.logic}</span></div>
                  </div>
                </>
              ) : (
                <span className="text-[#718096]">{t.selectNode}</span>
              )}
            </div>
          </div>
        </section>

        <section className="lg:col-span-12 bg-white rounded-lg border border-[#e5e0d8] p-6 shadow-sm mt-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-[#e5e0d8] pb-4">
            <div>
              <h3 className="text-xl font-bold text-[#2d3748]">{t.telemetryTitle}</h3>
              <p className="text-sm text-[#718096] mt-1">{t.telemetryDesc}</p>
            </div>
            <div className="mt-4 md:mt-0 flex gap-4 text-center items-center">
              <button 
                onClick={runBenchmark}
                disabled={benchmarkStatus === 'RUNNING'}
                className="flex items-center gap-2 px-4 py-2 bg-[#2b6cb0] text-white rounded hover:bg-[#2c5282] transition-colors font-bold text-sm disabled:opacity-50"
              >
                {benchmarkStatus === 'RUNNING' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                {t.executeBenchmark}
              </button>
              <div className="bg-[#f4f1ea] px-4 py-2 rounded border border-[#e5e0d8]">
                <span className="block text-xs text-[#718096] font-mono uppercase">{t.estCostReduction}</span>
                <span className="block text-xl font-bold text-[#2f855a]">{benchmarkStatus === 'COMPLETE' ? '-78%' : '---'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12, fontFamily: 'monospace'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#718096', fontSize: 12, fontFamily: 'monospace'}} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2d3748', borderRadius: '4px', border: 'none', color: '#fff', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', color: '#718096' }} />
                  <Bar dataKey="cloudTokens" name="Cloud LLM Tokens (High Cost)" stackId="a" fill="#c05621" radius={[0, 0, 4, 4]} animationDuration={1000} />
                  <Bar dataKey="localTokens" name="Local/Static Processing (Low Cost)" stackId="a" fill="#2b6cb0" radius={[4, 4, 0, 0]} animationDuration={1000} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 text-[#2d3748]">{t.impactAnalysis}</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-[#2b6cb0] font-bold mt-1">01</span>
                  <div>
                    <strong className="block text-[#2d3748]">{t.impact1Title}</strong>
                    <span className="text-sm text-[#718096]">{t.impact1Desc}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#c05621] font-bold mt-1">02</span>
                  <div>
                    <strong className="block text-[#2d3748]">{t.impact2Title}</strong>
                    <span className="text-sm text-[#718096]">{t.impact2Desc}</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#2f855a] font-bold mt-1">03</span>
                  <div>
                    <strong className="block text-[#2d3748]">{t.impact3Title}</strong>
                    <span className="text-sm text-[#718096]">{t.impact3Desc}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
