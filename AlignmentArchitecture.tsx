import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, FileText, Scale, Activity, RefreshCw, ChevronRight, Database, BrainCircuit, CheckCircle2, Sparkles, MessageSquareWarning, Download, Lock, Key } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from './components/FirebaseProvider';
import { encryptData, decryptData } from './lib/crypto';
import { saveAudit, getAudit, subscribeToUserAudits, AuditRecord } from './lib/db';
import AlignmentArchitecture from './components/AlignmentArchitecture';
import { DB_LANGUAGES, AppLanguage, UI_DICT } from './lib/translations';

import { RESEARCH_DEFINITION } from './research';
import { NormalizedEventFrame, FactCheckpoint } from './types';
import { ForensicEngine, AuditInput, AuditResponse } from './services/gemini';
import { validateAuditInputs } from './lib/validation';

const apiKey = process.env.GEMINI_API_KEY; // API key is provided by the execution environment

// --- REFERENCE LABELS (Code of Conduct Short-codes) ---
const REF_LABELS = {
  VOID: "[REF-AX1-VOID]",
  BIAS: "[REF-AX2-BIAS]",
  CHRONO: "[REF-MOD-CHRONO]",
  SEM: "[REF-MOD-SEM]",
  DUAL: "[REF-DUAL-IN]"
};

// --- SYNTHESIZED LOOP TARGET-SPECIFIC LOGIC & INTERVENTIONS ---
const INTERVENTION_SCHEME = {
  [REF_LABELS.VOID]: { target: "MEMORY_RECONSTRUCTION", action: "Flag for temporal vacuum. Initiate timeline bridging.", codeOfConduct: "TIER 1 [Ω] Truth-preservation" },
  [REF_LABELS.BIAS]: { target: "INSTITUTIONAL_AUDIT", action: "Isolate subjective framing. Strip institutional bias.", codeOfConduct: "TIER 2 [Δ] Semantic integrity" },
  [REF_LABELS.CHRONO]: { target: "TIMELINE_VERIFICATION", action: "Cross-reference dates with external anchors.", codeOfConduct: "TIER 3 [◈] Chronological audit" },
  [REF_LABELS.SEM]: { target: "LINGUISTIC_DECOMPILATION", action: "Deconstruct phonetic/semantic distortion.", codeOfConduct: "TIER 2 [Δ] Patient voice protection" },
  [REF_LABELS.DUAL]: { target: "MULTIMODAL_INTEGRATION", action: "Merge System Record and Subject Voice into unified CLSL frame.", codeOfConduct: "TIER 1 [Ω] Identity sovereignty" }
};

function VaultPasswordModal({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-cyan-500/10 rounded-full">
            <Lock className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 font-mono">SECURE VAULT</h2>
            <p className="text-xs text-slate-400 font-mono">AES-256-GCM Client-Side Encryption</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 mb-6">
          Enter your vault password to encrypt/decrypt audit data. This password is never sent to our servers. If you lose it, your data cannot be recovered.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); onUnlock(password); }}>
          <div className="relative mb-6">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Vault Password"
              className="w-full bg-slate-950 border border-slate-800 rounded-md py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={!password}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> UNLOCK VAULT
          </button>
        </form>
      </div>
    </div>
  );
}

// Exponential backoff helper for Gemini API
const delay = (ms) => new Promise(res => setTimeout(res, ms));
async function fetchWithRetry(url, options, retries = 5) {
  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(delays[i]);
    }
  }
}

export default function LexForensicaDashboard() {
  const { user, signIn, logout, isAuthReady } = useFirebase();
  const [vaultPassword, setVaultPassword] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [lang, setLang] = useState<AppLanguage>('EN');
  const t = UI_DICT[lang];

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loopState, setLoopState] = useState('');
  const [results, setResults] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // New State for LLM drafted appeal
  const [isDrafting, setIsDrafting] = useState(false);
  const [legalDraft, setLegalDraft] = useState("");
  const [enableSkss, setEnableSkss] = useState(false);

  const [inputA, setInputA] = useState(() => {
    const saved = localStorage.getItem('lex_forensica_inputA');
    return saved !== null ? saved : "2014: Pacient trpí ztrátou paměti na dny, kdy se nevrátil domů. Zapsáno jako důkaz absence náhledu na chorobu (anosognosie) v rámci toxické psychózy.\n\n2015-2018: [Žádné záznamy v archivu]. Záznam z konce roku 2018 konstatuje dlouhodobé léčení pro paranoidní schizofrenii (F20.0).\n\n2017: Pacient uvádí jméno vnitřní identity 'Steal' - projev bizarního bludu a schizofrenní produkce.";
  });
  const [inputB, setInputB] = useState(() => {
    const saved = localStorage.getItem('lex_forensica_inputB');
    return saved !== null ? saved : "2014: Nepamatuji si vůbec, co se dělo. Najednou jsem byl jinde (Amnézie/Switching).\n\n2015-2018: Nebyl jsem nikde hospitalizován, nedostával jsem žádné léky.\n\n2017: Snažil jsem se doktorovi vysvětlit, že moje podpůrná část se jmenuje 'Steel' (Ocel), protože mě chrání. On to zapsal anglicky jako krást.";
  });

  const [syncStatus, setSyncStatus] = useState('SYNCED');
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    let combinedText = '';
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const text = await file.text();
      combinedText += `\n--- FILE: ${file.name} ---\n${text}\n`;
    }
    
    setter(prev => prev + combinedText);
    e.target.value = ''; // Reset input
  };

  useEffect(() => {
    setSyncStatus('SYNCING...');
    localStorage.setItem('lex_forensica_inputA', inputA);
    const timer = setTimeout(() => {
      setSyncStatus('SYNCED');
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 500);
    return () => clearTimeout(timer);
  }, [inputA]);

  useEffect(() => {
    setSyncStatus('SYNCING...');
    localStorage.setItem('lex_forensica_inputB', inputB);
    const timer = setTimeout(() => {
      setSyncStatus('SYNCED');
      setLastSyncTime(new Date().toLocaleTimeString());
    }, 500);
    return () => clearTimeout(timer);
  }, [inputB]);

  const callGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    setResults(null);
    setLegalDraft("");

    const inputAData: AuditInput = { text: inputA, images: [] };
    const inputBData: AuditInput = { text: inputB, images: [] };
    const validation = validateAuditInputs(inputAData, inputBData);
    
    if (!validation.isValid) {
      setApiError(validation.error);
      setIsAnalyzing(false);
      return;
    }

    try {
      setLoopState('Initializing DEEP_1 Forensic Engine...');
      
      const engine = ForensicEngine.getInstance();
      const auditResult: AuditResponse = await engine.analyzeDeep(
        inputAData,
        inputBData,
        {
          customApiKey: apiKey || undefined,
          applyMetacognitiveInfluence: enableSkss,
          mindsetApproach: enableSkss ? "SKSS Enhanced" : "Standard Defensive Architect"
        }
      );

      setResults(auditResult);
      navigate('/matrix');

      // Save encrypted to Firestore
      if (user && vaultPassword) {
        setLoopState('Encrypting and saving to Vault...');
        const encryptedData = await encryptData(JSON.stringify(auditResult), vaultPassword);
        const auditRecord: AuditRecord = {
          id: auditResult.meta.auditId,
          uid: user.uid,
          encryptedData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await saveAudit(auditRecord);

        // Also save fast metadata for indexing
        const metadata = await engine.extractFastMetadata(auditResult);
        // We will update saveFastMetadata to use encryption later
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to generate analysis.");
    } finally {
      setIsAnalyzing(false);
      setLoopState('');
    }
  };

  const handleDraftAppeal = async () => {
    setIsDrafting(true);
    setApiError(null);
    
    const matrixData = JSON.stringify(results.discrepancyMatrix, null, 2);
    const promptText = `
      Act as an expert human rights defense attorney. Based on the following forensic discrepancy matrix generated by Lex Forensica, draft a powerful, formal, and concise legal appeal outline (3 paragraphs maximum). 
      Argue against the institutional findings by highlighting the discrepancies, cognitive biases, and potential violations of ECHR (European Convention on Human Rights) articles based on these exact findings. Do not hallucinate outside facts.
      
      Matrix Findings:
      ${matrixData}
    `;

    const payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048
      }
    };

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`;
      const data = await fetchWithRetry(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) throw new Error("Empty response from LLM");
      
      setLegalDraft(responseText);
    } catch (err) {
      console.error(err);
      setApiError("Failed to draft legal appeal. Please try again.");
    } finally {
      setIsDrafting(false);
    }
  };

  const exportToCSV = () => {
    if (!results) return;
    
    let csvContent = "";

    if (results.discrepancyMatrix) {
      const headers = ["EVENT_ID", "SYSTEM_VERSION", "SUBJECT_VERSION", "DISCREPANCY_TYPE", "SEVERITY", "REF_CODE"];
      const rows = results.discrepancyMatrix.map((row: any) => [
        `"${(row.eventId || '').replace(/"/g, '""')}"`,
        `"${(row.systemVersion || '').replace(/"/g, '""')}"`,
        `"${(row.subjectVersion || '').replace(/"/g, '""')}"`,
        `"${(row.discrepancyType || '').replace(/"/g, '""')}"`,
        `"${row.severity || ''}"`,
        `"${(row.refCode || '').replace(/"/g, '""')}"`
      ]);
      csvContent += "--- DISCREPANCY MATRIX ---\n";
      csvContent += [headers.join(","), ...rows.map((e: any) => e.join(","))].join("\n");
      csvContent += "\n\n";
    }

    if (results.skssDatasheet) {
      const skssHeaders = ["TERM", "DOMAIN", "DEFINITION", "IMPORTANCE", "CONNECTIONS", "ETHICAL_WEIGHT", "BIAS_FLAGS", "DECOMPILE_KEY", "UPGRADE_NOTE"];
      const skssRows = results.skssDatasheet.map((row: any) => [
        `"${(row.term || '').replace(/"/g, '""')}"`,
        `"${(row.domain || '').replace(/"/g, '""')}"`,
        `"${(row.definition || '').replace(/"/g, '""')}"`,
        `"${(row.importance || '').replace(/"/g, '""')}"`,
        `"${(row.connections || '').replace(/"/g, '""')}"`,
        `"${(row.ethicalWeight || '').replace(/"/g, '""')}"`,
        `"${(row.biasFlags || '').replace(/"/g, '""')}"`,
        `"${(row.decompileKey || '').replace(/"/g, '""')}"`,
        `"${(row.upgradeNote || '').replace(/"/g, '""')}"`
      ]);
      csvContent += "--- SKSS DATASHEET ---\n";
      csvContent += [skssHeaders.join(","), ...skssRows.map((e: any) => e.join(","))].join("\n");
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lex_forensica_audit_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "lex_forensica_audit_results.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthReady) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500"><RefreshCw className="w-8 h-8 animate-spin" /></div>;
  }

  if (user && !vaultPassword) {
    return <VaultPasswordModal onUnlock={setVaultPassword} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-900 pb-12">
      {/* HEADER */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-500" />
            <div>
              <h1 className="text-xl font-bold tracking-wider text-slate-100">{t.title} <span className="text-cyan-500 font-mono text-sm">{t.version}</span></h1>
              <p className="text-xs text-slate-400 font-mono">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as AppLanguage)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-cyan-500"
            >
              {DB_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <div className="flex gap-2 text-xs font-mono">
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Gemini 2.5 Flash
              </span>
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-purple-500" /> DEEP_1 / FAST_2
              </span>
            </div>
            {user ? (
              <button onClick={logout} className="text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors">{t.logout}</button>
            ) : (
              <button onClick={signIn} className="text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded transition-colors">{t.login}</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT SIDEBAR - CODE OF CONDUCT LABELS */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> {t.refLabels}
            </h3>
            <ul className="space-y-3 font-mono text-xs">
              <li className="p-2 bg-slate-800/50 rounded border-l-2 border-red-500 hover:bg-slate-800 transition-colors">
                <span className="text-red-400 block mb-1">[REF-AX1-VOID]</span>
                Absence of documentation = Evidentiary failure.
              </li>
              <li className="p-2 bg-slate-800/50 rounded border-l-2 border-orange-500 hover:bg-slate-800 transition-colors">
                <span className="text-orange-400 block mb-1">[REF-AX2-BIAS]</span>
                Compliance framing without incident dates.
              </li>
              <li className="p-2 bg-slate-800/50 rounded border-l-2 border-cyan-500 hover:bg-slate-800 transition-colors">
                <span className="text-cyan-400 block mb-1">[REF-MOD-CHRONO]</span>
                Time Vacuums & Logical Cracks.
              </li>
              <li className="p-2 bg-slate-800/50 rounded border-l-2 border-purple-500 hover:bg-slate-800 transition-colors">
                <span className="text-purple-400 block mb-1">[REF-MOD-SEM]</span>
                Phonetic & Terminological distortion.
              </li>
              <li className="p-2 bg-slate-800/50 rounded border-l-2 border-emerald-500 hover:bg-slate-800 transition-colors">
                <span className="text-emerald-400 block mb-1">[REF-DUAL-IN]</span>
                Dual Input Source verification.
              </li>
            </ul>
          </div>

          {apiError && (
            <div className="bg-red-950/50 border border-red-900 rounded-lg p-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <MessageSquareWarning className="w-5 h-5" />
                <span className="text-sm font-bold">{t.sysError}</span>
              </div>
              <p className="text-xs text-red-300">{apiError}</p>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> {t.usageLimits}
            </h3>
            <div className="space-y-2 font-mono text-xs text-slate-400">
              <div className="flex justify-between">
                <span>{t.aiAnalysis}</span>
                <span className="text-cyan-400">{t.unlimited}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.fileUploads}</span>
                <span className="text-cyan-400">{t.maxFiles}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.export}</span>
                <span className="text-cyan-400">{t.formats}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN WORKSPACE */}
        <section className="flex-1 space-y-6">
          
          {/* TABS */}
          <div className="flex border-b border-slate-800">
            <Link 
              to="/"
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {t.tab1}
            </Link>
            <Link 
              to={results ? "/matrix" : "#"}
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/matrix' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'} ${!results ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
            >
              {t.tab2}
            </Link>
            <Link 
              to={results ? "/visual" : "#"}
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/visual' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'} ${!results ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
            >
              {t.tab3}
            </Link>
            <Link 
              to="/alignment"
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/alignment' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {t.tab4}
            </Link>
          </div>

          <Routes>
            {/* TAB CONTENT: INGESTION */}
            <Route path="/" element={
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                    <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-300 font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-400" /> {t.inputA}
                      </span>
                      <label className="cursor-pointer text-xs font-mono text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                        <Download className="w-3 h-3 rotate-180" /> UPLOAD ARCHIVE
                        <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, setInputA)} accept=".txt,.md,.csv,.json" />
                      </label>
                    </div>
                  <textarea 
                    value={inputA}
                    onChange={(e) => setInputA(e.target.value)}
                    className="w-full h-64 bg-transparent text-sm p-4 text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-700 resize-none font-mono"
                    placeholder="Paste official medical/legal records here..."
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-300 font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" /> {t.inputB}
                    </span>
                    <label className="cursor-pointer text-xs font-mono text-cyan-500 hover:text-cyan-400 transition-colors flex items-center gap-1">
                      <Download className="w-3 h-3 rotate-180" /> UPLOAD ARCHIVE
                      <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, setInputB)} accept=".txt,.md,.csv,.json" />
                    </label>
                  </div>
                  <textarea 
                    value={inputB}
                    onChange={(e) => setInputB(e.target.value)}
                    className="w-full h-64 bg-transparent text-sm p-4 text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-700 resize-none font-mono"
                    placeholder="Paste subject's testimony or defense narrative here..."
                  />
                </div>
              </div>

              {/* DYNAMIC COMMAND CODEBLOCK */}
              <div className="bg-black border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-400 flex flex-col gap-2 shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-1">
                  <span className="text-slate-500 font-bold tracking-widest">DYNAMIC COMMAND CODEBLOCK</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">v7.0.1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-500">{'>'} SYSTEM.LOOP_CHECK()</span>
                  <span className={syncStatus === 'SYNCED' ? 'text-emerald-500' : 'text-amber-500'}>[{syncStatus}]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cyan-500">{'>'} STORAGE.AUTO_SAVE()</span>
                  <span>LAST_SYNC: {lastSyncTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-500">{'>'} TRANSLATION_FILES.UPDATE()</span>
                  <span className="text-emerald-500">[UPDATED - CLSL MATRIX]</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-500">{'>'} CODE_OF_CONDUCT.APPLY()</span>
                  <span className="text-emerald-500">[TIER 1 Ω ENFORCED]</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-900 p-4 border border-slate-800 rounded-lg gap-4 relative overflow-hidden">
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-cyan-900/20 animate-pulse">
                    <div className="h-1 bg-cyan-500 w-full animate-in slide-in-from-left duration-1000 repeat-infinite"></div>
                  </div>
                )}
                <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-3">
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3 text-amber-400 font-mono text-sm">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        {loopState}
                      </div>
                    ) : (
                      <div className="text-slate-400 font-mono text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" /> System Ready
                      </div>
                    )}
                  </div>
                  
                  <label className="flex items-center cursor-pointer gap-2 ml-4">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={enableSkss} onChange={() => setEnableSkss(!enableSkss)} disabled={isAnalyzing} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${enableSkss ? 'bg-purple-600' : 'bg-slate-700'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${enableSkss ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className={`text-xs font-mono font-bold ${enableSkss ? 'text-purple-400' : 'text-slate-500'}`}>
                      SKSS EVALUATION
                    </span>
                  </label>
                </div>
                <button 
                  onClick={callGeminiAnalysis}
                  disabled={isAnalyzing || !inputA || !inputB}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-md font-mono text-sm transition-colors flex items-center gap-2 disabled:opacity-50 w-full sm:w-auto justify-center relative z-10"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  {t.executeLoop}
                </button>
              </div>
            </div>
            } />

            {/* TAB CONTENT: MATRIX */}
            <Route path="/matrix" element={
              results ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-mono text-slate-100 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-cyan-500" /> LEGAL DISCREPANCY MATRIX
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={exportToCSV}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md font-mono text-xs transition-colors flex items-center gap-2 border border-slate-700"
                      >
                        <Download className="w-4 h-4" /> EXPORT CSV
                      </button>
                      <button
                        onClick={exportToJSON}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md font-mono text-xs transition-colors flex items-center gap-2 border border-slate-700"
                      >
                        <Download className="w-4 h-4" /> EXPORT JSON
                      </button>
                    </div>
              </div>
              
              <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 font-mono text-xs text-slate-400 border-b border-slate-800">
                      <th className="p-4">EVENT ID</th>
                      <th className="p-4">SYSTEM VERSION</th>
                      <th className="p-4">SUBJECT VERSION</th>
                      <th className="p-4">REF_CODE</th>
                      <th className="p-4">DISCREPANCY TYPE</th>
                      <th className="p-4">SEVERITY</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {results.discrepancyMatrix.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono text-cyan-400 align-top">{row.eventId}</td>
                        <td className="p-4 text-slate-300 align-top max-w-xs">{row.systemVersion}</td>
                        <td className="p-4 text-slate-400 italic align-top max-w-xs">{row.subjectVersion}</td>
                        <td className="p-4 align-top">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${
                            (row.refCode || '').includes('VOID') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {row.refCode || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 align-top text-xs leading-relaxed bg-slate-950/30">
                          <div className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                            <span>{row.discrepancyType}</span>
                          </div>
                        </td>
                        <td className="p-4 text-amber-400 align-top text-xs font-mono bg-slate-950/50 border-l border-slate-800/50">
                          {row.severity}/10
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* SKSS DATASHEET */}
              {results.skssDatasheet && results.skssDatasheet.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-mono text-purple-400 flex items-center gap-2">
                      <Database className="w-5 h-5" /> SKSS DATASHEET (CLSL FORMAT)
                    </h2>
                  </div>
                  <div className="overflow-x-auto bg-slate-900 border border-purple-900/50 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/50 font-mono text-[10px] text-slate-400 border-b border-purple-900/50 uppercase tracking-wider">
                          <th className="p-3">Term</th>
                          <th className="p-3">Domain</th>
                          <th className="p-3">Definition</th>
                          <th className="p-3">Importance</th>
                          <th className="p-3">Connections</th>
                          <th className="p-3">Ethical Weight</th>
                          <th className="p-3">Bias Flags</th>
                          <th className="p-3">Decompile Key</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {results.skssDatasheet.map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                            <td className="p-3 font-mono text-purple-400 align-top font-bold">{row.term}</td>
                            <td className="p-3 text-slate-400 align-top">{row.domain}</td>
                            <td className="p-3 text-slate-300 align-top max-w-xs">{row.definition}</td>
                            <td className="p-3 align-top font-mono text-amber-400">{row.importance}</td>
                            <td className="p-3 text-slate-400 align-top max-w-xs">{row.connections}</td>
                            <td className="p-3 text-slate-400 align-top">{row.ethicalWeight}</td>
                            <td className="p-3 text-red-400 align-top">{row.biasFlags}</td>
                            <td className="p-3 font-mono text-cyan-500 align-top text-[10px]">{row.decompileKey}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* LLM GENERATOR FOR DEFENSE */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h3 className="font-mono text-sm text-slate-200 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-500" /> 
                      DEFENSE SYNTHESIS ENGINE
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Generate a formal legal appeal arguing ECHR violations based on the matrix above.</p>
                  </div>
                  <button 
                    onClick={handleDraftAppeal}
                    disabled={isDrafting}
                    className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-md font-mono text-xs transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {isDrafting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    ✨ SYNTHESIZE DEFENSE ARGUMENT
                  </button>
                </div>

                {legalDraft && (
                  <div className="bg-slate-950 border border-slate-800 rounded p-4 font-serif text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in">
                    {legalDraft}
                  </div>
                )}
              </div>
            </div>
            ) : (
              <div className="text-slate-500 font-mono text-sm p-8 text-center border border-slate-800 rounded-lg border-dashed">
                Run the AI Loop Cycle first to generate the evidence matrix.
              </div>
            )
          } />

            {/* TAB CONTENT: VISUAL CONTEXT */}
            <Route path="/visual" element={
              results ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  {/* TOP METRICS */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-red-500">{results.documentationGaps?.length || 0}</span>
                  <span className="text-xs font-mono text-slate-400 mt-1 uppercase">Time Vacuums [REF-AX1]</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-purple-500">{results.auditIntegrity?.semanticDriftDetected ? 1 : 0}</span>
                  <span className="text-xs font-mono text-slate-400 mt-1 uppercase">Semantic Drifts [REF-MOD-SEM]</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-orange-500">{results.researchGrounding?.length || 0}</span>
                  <span className="text-xs font-mono text-slate-400 mt-1 uppercase">Iatrogenic Flags [REF-AX3]</span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-cyan-500">{results.legalMatrix?.length || 0}</span>
                  <span className="text-xs font-mono text-slate-400 mt-1 uppercase">Legal Violations Mapped</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dynamically Generated Threat Density over Time */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
                  <h3 className="text-sm font-mono text-slate-300 mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" /> CHRONOLOGICAL ANOMALY TRACKER
                  </h3>
                  <div className="space-y-4">
                    {results.discrepancyMatrix.map((row, i) => {
                      const isHigh = row.severity >= 7;
                      const color = (row.refCode || '').includes('VOID') ? 'bg-red-500 text-red-500' : 'bg-purple-500 text-purple-400';
                      const bgFill = (row.refCode || '').includes('VOID') ? 'bg-red-500' : 'bg-purple-500';
                      
                      return (
                        <div key={i} className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div className="text-xs font-mono text-slate-400">{row.eventId}</div>
                            <div className={`text-xs font-mono ${color.split(' ')[1]}`}>{row.severity}/10 Anomaly</div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800">
                            <div style={{ width: isHigh ? "85%" : "40%" }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${bgFill}`}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Cognitive Bias Distribution (Static Visual) */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
                  <h3 className="text-sm font-mono text-slate-300 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" /> COGNITIVE BIAS DISTRIBUTION
                  </h3>
                  <div className="flex-1 flex items-end justify-between gap-2 border-b border-slate-800 pb-2 mt-4 relative">
                    <div className="w-1/4 bg-slate-800 rounded-t flex items-end justify-center group relative">
                      <div className="w-full bg-cyan-500/80 rounded-t transition-all" style={{ height: '20%' }}></div>
                      <span className="absolute -bottom-6 text-[10px] font-mono text-slate-500 text-center w-full">TIER 1</span>
                    </div>
                    <div className="w-1/4 bg-slate-800 rounded-t flex items-end justify-center group relative">
                      <div className="w-full bg-orange-500/80 rounded-t transition-all" style={{ height: '40%' }}></div>
                      <span className="absolute -bottom-6 text-[10px] font-mono text-slate-500 text-center w-full">TIER 2</span>
                    </div>
                    <div className="w-1/4 bg-slate-800 rounded-t flex items-end justify-center group relative">
                      <div className="w-full bg-purple-500/80 rounded-t transition-all" style={{ height: `${Math.min((results.auditIntegrity?.semanticDriftDetected ? 1 : 0) * 30, 90)}%` }}></div>
                      <span className="absolute -bottom-6 text-[10px] font-mono text-slate-500 text-center w-full">TIER 3</span>
                    </div>
                    <div className="w-1/4 bg-slate-800 rounded-t flex items-end justify-center group relative">
                      <div className="w-full bg-red-500/80 rounded-t transition-all" style={{ height: `${Math.min((results.documentationGaps?.length || 1) * 40, 95)}%` }}></div>
                      <span className="absolute -bottom-6 text-[10px] font-mono text-slate-500 text-center w-full">VACUUM</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-8 font-mono">
                    High density of Tier 3 (Compliance Framing) overlapping with Time Vacuums indicates severe procedural failure mapping to <span className="text-cyan-400">ECHR Art. 6</span>.
                  </p>
                </div>
              </div>
            </div>
            ) : (
              <div className="text-slate-500 font-mono text-sm p-8 text-center border border-slate-800 rounded-lg border-dashed">
                Run the AI Loop Cycle first to generate the visual context.
              </div>
            )
          } />
            <Route path="/alignment" element={<AlignmentArchitecture lang={lang} />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}