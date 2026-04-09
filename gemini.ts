import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, FileText, Scale, Activity, RefreshCw, ChevronRight, Database, BrainCircuit, CheckCircle2, Sparkles, MessageSquareWarning, Download, Lock, Key } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useFirebase } from './components/FirebaseProvider';
import { encryptData, decryptData } from './lib/crypto';
import { saveAudit, getAudit, subscribeToUserAudits, AuditRecord, saveEncryptedInput, getEncryptedInput, clearEncryptedInputs, saveFastMetadata } from './lib/db';
import { ForensicEngine } from './services/gemini';
import { AuditResponse, AuditInput } from './types';
import { validateAuditInputs } from './lib/validation';
import { generatePressReport, generateCSVExport } from './services/export';
import { AuditPDF } from './components/AuditPDF';
import { PDFDownloadLink } from '@react-pdf/renderer';
import AlignmentArchitecture from './components/AlignmentArchitecture';
import ForensicValidation from './components/ForensicValidation';
import { DeltaStateDashboard } from './components/DeltaStateDashboard';
import { DeltaEngine } from './services/delta-engine';
import MetaInstructionalEngine from './components/MetaInstructionalEngine';
import ControlRoom from './components/ControlRoom';
import SecretsAlignmentView from './components/SecretsAlignment';
import { DB_LANGUAGES, AppLanguage, UI_DICT } from './lib/translations';

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
  const [validationFlags, setValidationFlags] = useState<string[]>([]);
  
  // New State for LLM drafted appeal
  const [isDrafting, setIsDrafting] = useState(false);
  const [legalDraft, setLegalDraft] = useState("");
  const [enableSkss, setEnableSkss] = useState(false);

  const [inputA, setInputA] = useState("<referenceA>");
  const [inputB, setInputB] = useState("<referenceB>");
  const [institutionType, setInstitutionType] = useState<any>("MEDICAL");
  const [referenceData, setReferenceData] = useState<Record<string, string>>({
    [REF_LABELS.VOID]: "",
    [REF_LABELS.BIAS]: "",
    [REF_LABELS.CHRONO]: "",
    [REF_LABELS.SEM]: "",
    [REF_LABELS.DUAL]: ""
  });

  const [syncStatus, setSyncStatus] = useState('SYNCED');
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  // Load encrypted inputs when vault is unlocked
  useEffect(() => {
    if (user && vaultPassword) {
      const loadInputs = async () => {
        const savedA = await getEncryptedInput(user.uid, 'inputA', vaultPassword);
        const savedB = await getEncryptedInput(user.uid, 'inputB', vaultPassword);
        if (savedA) setInputA(savedA);
        if (savedB) setInputB(savedB);
      };
      loadInputs();
    }
  }, [user, vaultPassword]);

  useEffect(() => {
    if (user && vaultPassword) {
      setSyncStatus('SYNCING...');
      const timer = setTimeout(async () => {
        await saveEncryptedInput(user.uid, 'inputA', inputA, vaultPassword);
        setSyncStatus('SYNCED');
        setLastSyncTime(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [inputA, user, vaultPassword]);

  useEffect(() => {
    if (user && vaultPassword) {
      setSyncStatus('SYNCING...');
      const timer = setTimeout(async () => {
        await saveEncryptedInput(user.uid, 'inputB', inputB, vaultPassword);
        setSyncStatus('SYNCED');
        setLastSyncTime(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [inputB, user, vaultPassword]);

  const callGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    setApiError(null);
    setResults(null);
    setLegalDraft("");
    setLoopState('Initializing DEEP_1 LLM Engine...');

    const validation = validateAuditInputs({ text: inputA, images: [] }, { text: inputB, images: [] });
    setValidationFlags(validation.flags);
    if (!validation.isValid) {
      setApiError(validation.error);
      setIsAnalyzing(false);
      return;
    }

    try {
      setLoopState('reLOOP: Running Axiom Cross-Check with Gemini...');
      
      const engine = ForensicEngine.getInstance();
      const auditResults = await engine.analyzeDeep(
        { 
          text: inputA, 
          images: [],
          institutionType,
          referenceData
        },
        { text: inputB, images: [] },
        { 
          enableSkss,
          mindsetApproach: "Defensive Architect",
          applyMetacognitiveInfluence: true
        }
      );

      // Process Delta State
      const deltaEngine = DeltaEngine.getInstance();
      auditResults.deltaState = deltaEngine.processDeltaState(auditResults);

      setResults(auditResults);
      navigate('/matrix');

      // Save to Firestore if user is logged in and vault password is set
      if (user && vaultPassword) {
        setLoopState('Encrypting and saving to Vault...');
        const encryptedData = await encryptData(JSON.stringify(auditResults), vaultPassword);
        const auditRecord: AuditRecord = {
          id: auditResults.meta.auditId,
          uid: user.uid,
          encryptedData,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await saveAudit(auditRecord);

        // Save fast metadata for indexing
        const fastMeta = await engine.extractFastMetadata(auditResults);
        await saveFastMetadata(user.uid, fastMeta, vaultPassword);
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to generate analysis. Please try again or check API configuration.");
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
    const csvContent = generateCSVExport(results);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lex_forensica_${results.meta.auditId}.csv`);
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
            {results && (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => {
                    const html = generatePressReport(results);
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `LEX_FORENSICA_PRESS_REPORT_${results.meta.auditId}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-colors flex items-center gap-2 shadow-lg shadow-emerald-900/20"
                >
                  <FileText className="w-3 h-3" /> PRESS DOSSIER
                </button>
                <PDFDownloadLink
                  document={<AuditPDF audit={results} />}
                  fileName={`LEX_FORENSICA_AUDIT_${results.meta.auditId}.pdf`}
                  className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded text-[10px] font-mono font-bold transition-colors flex items-center gap-2 shadow-lg shadow-red-900/20"
                >
                  {({ loading }) => (
                    <>
                      <Download className="w-3 h-3" />
                      {loading ? 'PDF...' : 'PDF AUDIT'}
                    </>
                  )}
                </PDFDownloadLink>
              </div>
            )}
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

          {validationFlags.length > 0 && (
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-3 space-y-2 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Validation Flags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {validationFlags.map(flag => (
                  <span key={flag} className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-mono text-amber-400">
                    {flag}
                  </span>
                ))}
              </div>
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
            <Link 
              to={results ? "/delta" : "#"}
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/delta' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'} ${!results ? 'opacity-30 cursor-not-allowed pointer-events-none' : ''}`}
            >
              {t.tab5}
            </Link>
            <Link 
              to="/meta-sim"
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/meta-sim' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {t.tab6}
            </Link>
            <Link 
              to="/control-room"
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/control-room' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {t.tab7}
            </Link>
            <Link 
              to="/secrets"
              className={`px-4 py-2 font-mono text-sm border-b-2 transition-colors ${location.pathname === '/secrets' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {t.tab8}
            </Link>
          </div>

          <Routes>
            {/* TAB CONTENT: INGESTION */}
            <Route path="/" element={
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* INSTITUTION & REFERENCE LABELS INPUTS */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-lg font-mono text-slate-100 flex items-center gap-2">
                        <Database className="w-5 h-5 text-cyan-500" /> SYSTEM CONTEXT & REFERENCE LABELS
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Specify the institution type and provide data for specific forensic reference labels.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400">INSTITUTION TYPE:</span>
                      <select 
                        value={institutionType}
                        onChange={(e) => setInstitutionType(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="MEDICAL">MEDICAL SYSTEMS</option>
                        <option value="GOVERNMENTAL_POLICE">GOVERNMENTAL / POLICE SYSTEMS</option>
                        <option value="FINANCIAL">FINANCIAL SYSTEMS</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(REF_LABELS).map(([key, label]) => (
                      <div key={key} className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-slate-500 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            label.includes('VOID') ? 'bg-red-500' : 
                            label.includes('BIAS') ? 'bg-orange-500' : 
                            label.includes('CHRONO') ? 'bg-cyan-500' : 
                            label.includes('SEM') ? 'bg-purple-500' : 'bg-emerald-500'
                          }`} />
                          {label}
                        </label>
                        <input 
                          type="text"
                          value={referenceData[label] || ""}
                          onChange={(e) => setReferenceData(prev => ({ ...prev, [label]: e.target.value }))}
                          placeholder={`Data for ${label}...`}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                    <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-300 font-bold flex items-center gap-2">
                        <FileText className="w-4 h-4 text-orange-400" /> {t.inputA}
                      </span>
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
                      <FileText className="w-4 h-4 text-emerald-400" /> INPUT_B: SUBJECT VOICE LAYER
                    </span>
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
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">v8.0.0</span>
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
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={exportToCSV}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md font-mono text-xs transition-colors flex items-center gap-2 border border-slate-700"
                    >
                      <Download className="w-4 h-4" /> EXPORT CSV
                    </button>
                    
                    <button
                      onClick={() => {
                        const html = generatePressReport(results);
                        const blob = new Blob([html], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `LEX_FORENSICA_PRESS_REPORT_${results.meta.auditId}.html`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-400 px-4 py-2 rounded-md font-mono text-xs transition-colors flex items-center gap-2 border border-emerald-500/30"
                    >
                      <FileText className="w-4 h-4" /> PRESS REPORT (HTML)
                    </button>

                    <PDFDownloadLink
                      document={<AuditPDF audit={results} />}
                      fileName={`LEX_FORENSICA_AUDIT_${results.meta.auditId}.pdf`}
                      className="bg-red-900/40 hover:bg-red-900/60 text-red-400 px-4 py-2 rounded-md font-mono text-xs transition-colors flex items-center gap-2 border border-red-500/30"
                    >
                      {({ loading }) => (
                        <>
                          <Download className="w-4 h-4" />
                          {loading ? 'GENERATING PDF...' : 'DOWNLOAD PDF AUDIT'}
                        </>
                      )}
                    </PDFDownloadLink>
                  </div>
              </div>
              
              <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 font-mono text-xs text-slate-400 border-b border-slate-800">
                      <th className="p-4">TIME</th>
                      <th className="p-4">INPUT_A (SYSTEM)</th>
                      <th className="p-4">INPUT_B (SUBJECT)</th>
                      <th className="p-4">REF_CODE</th>
                      <th className="p-4">AI GENERATED EVIDENCE</th>
                      <th className="p-4">FOLLOWUP_INTERVENTION</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {results.discrepancyMatrix.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-mono text-cyan-400 align-top">{row.time}</td>
                        <td className="p-4 text-slate-300 align-top max-w-xs">{row.claimA}</td>
                        <td className="p-4 text-slate-400 italic align-top max-w-xs">{row.claimB}</td>
                        <td className="p-4 align-top">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${
                            row.shortLabel?.includes('VOID') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          }`}>
                            {row.shortLabel}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 align-top text-xs leading-relaxed bg-slate-950/30">
                          <div className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                            <span>{row.evidence}</span>
                          </div>
                        </td>
                        <td className="p-4 text-amber-400 align-top text-xs font-mono bg-slate-950/50 border-l border-slate-800/50">
                          {row.followupIntervention || '-'}
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

              {/* EVIDENCE DEMANDS */}
              {results.evidenceDemands && results.evidenceDemands.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-mono text-cyan-400 flex items-center gap-2">
                      <FileText className="w-5 h-5" /> EVIDENCE DEMANDS (FORMAL REQUESTS)
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.evidenceDemands.map((demand, idx) => (
                      <div key={idx} className="bg-slate-900 border border-cyan-900/30 rounded-lg p-4 space-y-3 hover:border-cyan-500/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-cyan-500/10 rounded text-cyan-500">
                            <Scale className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tighter">Formal Demand</h4>
                            <p className="text-sm text-slate-300 font-serif leading-relaxed">{demand.formalDemand}</p>
                          </div>
                        </div>
                        <div className="pl-11 space-y-2">
                          <div className="text-[10px] font-mono text-slate-500">
                            <span className="text-cyan-900 font-bold">LEGAL_BASIS:</span> {demand.legalBasis}
                          </div>
                          <div className="text-[10px] font-mono text-amber-500/80 italic bg-amber-500/5 p-2 rounded border border-amber-500/10">
                            <span className="text-amber-900 font-bold uppercase">Forensic Inference:</span> {demand.absenceInference}
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <div className="space-y-4">
                    <div className="bg-slate-950 border border-slate-800 rounded p-4 font-serif text-slate-300 text-sm leading-relaxed whitespace-pre-wrap animate-in fade-in">
                      {legalDraft}
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const blob = new Blob([legalDraft], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `LEGAL_APPEAL_DRAFT_${results?.meta.auditId}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-[10px] font-mono text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" /> DOWNLOAD DRAFT (.TXT)
                      </button>
                    </div>
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
                <ForensicValidation results={results} lang={lang} />
              ) : (
                <div className="text-slate-500 font-mono text-sm p-8 text-center border border-slate-800 rounded-lg border-dashed">
                  Run the AI Loop Cycle first to generate the evidence matrix.
                </div>
              )
            } />
            <Route path="/delta" element={
              results && results.deltaState ? (
                <DeltaStateDashboard data={results.deltaState} />
              ) : (
                <div className="text-slate-500 font-mono text-sm p-8 text-center border border-slate-800 rounded-lg border-dashed">
                  Run the AI Loop Cycle first to generate the evidence matrix.
                </div>
              )
            } />
            <Route path="/alignment" element={<AlignmentArchitecture lang={lang} />} />
            <Route path="/meta-sim" element={<MetaInstructionalEngine />} />
            <Route path="/control-room" element={<ControlRoom state={DeltaEngine.getInstance().getControlRoomState()} />} />
            <Route path="/secrets" element={<SecretsAlignmentView data={DeltaEngine.getInstance().getSecretsAlignment()} />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}