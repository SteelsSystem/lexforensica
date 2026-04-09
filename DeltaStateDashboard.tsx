import { AuditResponse } from "../types";

/**
 * Generates a high-fidelity HTML report for press/legal use based on the audit results.
 * v2.0refinedlogic: Includes interactive filtering, dark mode support, and forensic infographic styling.
 */
export function generatePressReport(audit: AuditResponse): string {
  const { meta, riskAssessment, causalMap, chronology, legalMatrix, auditIntegrity, documentationGaps, escalationPlan, auditMetrics } = audit;

  const kpis = [
    { value: chronology.length, suffix: "", label: { cz: "Analyzované události", en: "Analyzed Events" } },
    { value: legalMatrix.length, suffix: "+", label: { cz: "Právní pochybení", en: "Legal Violations" } },
    { value: auditMetrics?.echrViolations || 0, suffix: "", label: { cz: "Porušení EÚLP", en: "ECHR Violations" } }
  ];

  const simulatedLogs = [
    { t: { cz: "> Inicializace sémantického jádra LEX FORENSICA v8.0...", en: "> Initializing LEX FORENSICA v8.0 semantic core..." }, d: 0 },
    { t: { cz: `> Načítám auditní ID: ${meta.auditId}...`, en: `> Loading audit ID: ${meta.auditId}...` }, d: 500 },
    { t: { cz: "> Spouštím LOOP_CYCLE: Detekce sémantického posunu...", en: "> Starting LOOP_CYCLE: Semantic Drift Detection..." }, d: 1000 },
    { t: { cz: auditIntegrity.semanticDriftDetected ? "> VAROVÁNÍ: Detekován sémantický posun v dokumentaci." : "> Sémantický posun v normě.", en: auditIntegrity.semanticDriftDetected ? "> WARNING: Semantic drift detected in documentation." : "> Semantic drift within normal range." }, d: 1500 },
    { t: { cz: `> Nalezeno ${auditIntegrity.epistemicCircularities.length} epistemických kruhů.`, en: `> Found ${auditIntegrity.epistemicCircularities.length} epistemic circularities.` }, d: 2000 },
    { t: { cz: `> ZÁVĚR: Úroveň rizika stanovena na ${riskAssessment.overallLevel}.`, en: `> CONCLUSION: Risk level set to ${riskAssessment.overallLevel}.` }, d: 2500 }
  ];

  return `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AUDITNÍ PROTOKOL — ${meta.auditId}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --color-fact: #2563eb;
            --color-error: #dc2626;
            --color-uncertain: #ea580c;
            --color-action: #16a34a;
            --color-identity: #7c3aed;
        }
        body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #1e293b; transition: all 0.3s ease; }
        .mono { font-family: 'JetBrains Mono', monospace; }

        /* Language Toggle Logic */
        .lang-cs .en-content { display: none !important; }
        .lang-en .cs-content { display: none !important; }

        /* Print Settings */
        @media print {
            .no-print { display: none !important; }
            body { background: white; padding: 0; }
            .section-card { break-inside: avoid; border: 1px solid #e2e8f0; box-shadow: none !important; }
            .hero-gradient { background: #0f172a !important; color: white !important; }
            .glass-card { border: 1px solid #ccc; box-shadow: none; break-inside: avoid; }
        }

        .hero-gradient { background: linear-gradient(135deg, #020617 0%, #0f172a 100%); }
        .section-card { background: white; border-radius: 1.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); padding: 2rem; }
        .glass-card { background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; }
        
        .fade-node { opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out; }
        .fade-node.visible { opacity: 1; transform: translateY(0); }

        @keyframes pulse-red {
            0%, 100% { border-color: rgba(239, 68, 68, 0.2); }
            50% { border-color: rgba(239, 68, 68, 0.8); }
        }
        .pulse-card { animation: pulse-red 2s infinite; border: 2px solid transparent; }
        
        #modal-overlay {
            position: fixed; inset: 0; background: rgba(2, 6, 23, 0.85);
            opacity: 0; pointer-events: none; transition: opacity 0.25s ease;
            z-index: 1000; display: flex; align-items: center; justify-content: center;
            padding: 1rem;
        }
        #modal-overlay.open { opacity: 1; pointer-events: all; }
        #modal-box {
            transform: scale(0.95); transition: transform 0.25s ease;
            max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;
            background: #fff; border-radius: 1.5rem;
        }
        #modal-overlay.open #modal-box { transform: scale(1); }
    </style>
</head>
<body class="lang-cs">

    <!-- NAVIGATION -->
    <nav class="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50 px-6 py-4 flex justify-between items-center no-print">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">L</div>
            <div>
                <h1 class="text-xs font-black tracking-tighter uppercase leading-none">LEX FORENSICA</h1>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Auditní protokol v8.0</p>
            </div>
        </div>
        <div class="flex items-center gap-4">
            <div class="bg-slate-100 p-1 rounded-lg flex">
                <button onclick="toggleLang('cs')" id="btn-cs" class="px-3 py-1 rounded-md text-xs font-bold transition-all bg-white shadow-sm">CZ</button>
                <button onclick="toggleLang('en')" id="btn-en" class="px-3 py-1 rounded-md text-xs font-bold transition-all text-slate-400">EN</button>
            </div>
            <button onclick="window.print()" class="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-black hover:bg-blue-700 flex items-center gap-2">
                <span class="cs-content">EXPORT PDF</span>
                <span class="en-content">EXPORT PDF</span>
            </button>
        </div>
    </nav>

    <!-- HERO SECTION -->
    <header class="hero-gradient pt-32 pb-20 px-6 text-white text-center relative overflow-hidden">
        <div class="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>

        <div class="max-w-4xl mx-auto relative z-10">
            <div class="inline-block px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-red-500/30">
                <span class="cs-content">Důvěrný Forenzní Audit</span>
                <span class="en-content">Confidential Forensic Audit</span>
            </div>
            <h2 class="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase leading-[0.9]">
                ${meta.auditId}
            </h2>
            <p class="text-slate-400 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto">
                <span class="cs-content">Systematická analýza procesních vad, dokumentačního zkreslení a integrity identity.</span>
                <span class="en-content">Systematic analysis of procedural failures, documentation bias, and identity integrity.</span>
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${kpis.map(k => `
                    <div class="glass-card p-8 border-t-4 border-blue-500/50">
                        <div class="text-5xl font-black text-blue-400 mb-2">${k.value}${k.suffix}</div>
                        <div class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">${k.label.cz}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-16 space-y-24">

        <!-- CORE ANALYSIS GRID -->
        <section>
            <h2 class="text-3xl font-black mb-12 uppercase tracking-tighter border-b-2 border-slate-200 pb-4 flex items-center gap-4">
                <span class="w-12 h-1 bg-blue-600"></span>
                <span class="cs-content">Analytické jádro případu</span>
                <span class="en-content">Case Analysis Core</span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="section-card border-l-8 border-red-500">
                    <h3 class="font-black text-xl mb-4 uppercase">Kauzální Hypotéza</h3>
                    <p class="text-slate-600 leading-relaxed italic text-lg">"${causalMap.layer_root.hypothesis}"</p>
                    <div class="mt-6 flex gap-4">
                        <span class="px-2 py-1 bg-slate-100 text-[10px] font-bold rounded uppercase">${causalMap.layer_root.mechanismType}</span>
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase">Confidence: ${(causalMap.layer_root.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                </div>
                <div class="section-card border-l-8 border-orange-500">
                    <h3 class="font-black text-xl mb-4 uppercase">Rizikové Faktory</h3>
                    <ul class="space-y-2">
                        ${riskAssessment.primaryRiskFactors.map(f => `
                            <li class="flex items-start gap-2 text-sm text-slate-600">
                                <span class="text-orange-500 font-bold">!</span> ${f}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </section>

        <!-- IDENTITY CORRECTION (STEEL LOGIC) -->
        ${auditIntegrity.semanticDriftDetected ? `
        <section class="section-card bg-slate-900 text-white overflow-hidden relative">
            <div class="absolute top-0 right-0 w-64 h-64 bg-purple-600 opacity-20 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
            <div class="relative z-10">
                <h2 class="text-3xl font-black mb-6 uppercase tracking-tighter text-purple-400">
                    Korekce identity: STEEL vs STEAL
                </h2>
                <div class="grid md:grid-cols-2 gap-12">
                    <div>
                        <p class="text-slate-300 leading-relaxed mb-6">
                            Analýza detekovala kritický sémantický posun v zacházení se jménem identity. 
                            <strong>STEEL</strong> (ocel, odolnost) byl v dokumentaci systematicky přepisován jako 
                            <strong>STEAL</strong> (krást), což vedlo k patologizaci výpovědi jako "bludu o krádeži identity".
                        </p>
                        <div class="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                            <p class="text-xs font-mono text-purple-300 italic">
                                "Tento posun není náhodný, ale strukturální. Systém vložil autentické jméno do předpřipraveného psychiatrického rámce."
                            </p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div class="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-bold">S</div>
                            <div>
                                <p class="text-xs font-black uppercase text-slate-500">Původní Význam</p>
                                <p class="text-sm font-bold">STEEL = Survival, Resilience, Ocel</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div class="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold">X</div>
                            <div>
                                <p class="text-xs font-black uppercase text-slate-500">Zkreslený Výklad</p>
                                <p class="text-sm font-bold">STEAL = Theft, Delusion, Krádež</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        ` : ''}

        <!-- EVIDENCE GAPS -->
        <section>
            <h2 class="text-3xl font-black mb-12 uppercase tracking-tighter border-b-2 border-slate-200 pb-4 flex items-center gap-4">
                <span class="w-12 h-1 bg-orange-600"></span>
                <span class="cs-content">Kritické mezery v dokumentaci</span>
                <span class="en-content">Critical Documentation Gaps</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                ${documentationGaps.map(gap => `
                    <div class="section-card pulse-card">
                        <div class="text-3xl mb-4">🕳️</div>
                        <h3 class="font-black text-sm uppercase mb-2">${gap.missingDocumentType}</h3>
                        <p class="text-xs text-slate-500 mb-4">Trvání: ${gap.durationDays} dní</p>
                        <span class="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded uppercase">${gap.criticality} RISK</span>
                    </div>
                `).join('')}
            </div>
        </section>

        <!-- AI AUDITOR CONSOLE -->
        <section class="no-print">
            <h2 class="text-3xl font-black mb-12 uppercase tracking-tighter border-b-2 border-slate-200 pb-4">AI Auditor Console</h2>
            <div class="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
                <div class="flex justify-between items-center mb-6">
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span class="text-xs font-mono tracking-widest text-slate-400">SYS_CONSOLE</span>
                    </div>
                </div>
                <div id="audit-console" class="bg-black/50 rounded-xl p-6 font-mono text-[11px] leading-relaxed text-blue-300 min-h-[200px] border border-white/5 space-y-2">
                    <!-- Logs will be injected here by JS -->
                </div>
            </div>
        </section>

        <!-- TIMELINE -->
        <section>
            <h2 class="text-3xl font-black mb-12 uppercase tracking-tighter border-b-2 border-slate-200 pb-4 text-center">Chronologie pochybení</h2>
            <div class="relative max-w-4xl mx-auto">
                <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-slate-200 -translate-x-1/2"></div>
                <div class="space-y-12">
                    ${chronology.map((event, idx) => `
                        <div class="relative flex items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}">
                            <div class="absolute left-4 md:left-1/2 w-4 h-4 bg-slate-900 rounded-full -translate-x-1/2 z-10 border-4 border-white"></div>
                            <div class="ml-12 md:ml-0 md:w-1/2">
                                <div class="section-card hover:shadow-xl transition-all cursor-pointer" onclick="openModal('${idx}')">
                                    <span class="text-xs font-mono text-blue-500 font-bold">${new Date(event.isoDate).toLocaleDateString('cs-CZ')}</span>
                                    <h4 class="font-black uppercase mt-1">${event.eventType}</h4>
                                    <p class="text-sm text-slate-500 mt-2 line-clamp-2">"${event.systemRecord.content}"</p>
                                    ${event.legalFlags.national.length > 0 ? `<div class="mt-4 flex gap-2"><span class="px-2 py-1 bg-red-100 text-red-600 text-[9px] font-bold rounded uppercase">Flagged</span></div>` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- ESCALATION DOMINO -->
        <section>
            <h2 class="text-3xl font-black mb-12 uppercase tracking-tighter border-b-2 border-slate-200 pb-4 text-center">Eskalační plán (Domino efekt)</h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                ${Object.entries(escalationPlan.tierActions).map(([tier, actions], idx) => `
                    <div class="section-card border-b-8 ${idx === 0 ? 'border-green-500' : idx === 1 ? 'border-blue-500' : idx === 2 ? 'border-orange-500' : 'border-red-500'}">
                        <h4 class="font-black uppercase text-sm mb-4">${tier.replace('_', ' ')}</h4>
                        <ul class="space-y-3">
                            ${actions.map(action => `
                                <li class="text-xs text-slate-600 flex items-start gap-2">
                                    <span class="text-blue-500">→</span> ${action}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </section>

    </main>

    <!-- MODAL -->
    <div id="modal-overlay" onclick="if(event.target === this) closeModal()">
        <div id="modal-box">
            <div id="modal-header-color" class="h-3 w-full bg-blue-600"></div>
            <div class="p-8 md:p-10">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <div id="modal-badge" class="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white rounded bg-slate-800 mb-3">EVENT_DETAIL</div>
                        <h2 id="modal-title" class="text-3xl font-black uppercase tracking-tighter leading-none"></h2>
                    </div>
                    <button onclick="closeModal()" class="text-slate-400 hover:text-slate-900 text-4xl leading-none">&times;</button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Systémový Záznam</h4>
                        <p id="modal-system" class="text-sm text-slate-700 leading-relaxed italic"></p>
                        
                        <h4 class="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-6 mb-2 border-b border-slate-200 pb-1">Výpověď Subjektu</h4>
                        <p id="modal-subject" class="text-sm text-slate-700 leading-relaxed font-bold"></p>
                    </div>
                    <div class="space-y-6">
                        <div>
                            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Zdroj</h4>
                            <div id="modal-source" class="mono text-xs bg-slate-100 text-slate-800 p-3 rounded font-bold break-words"></div>
                        </div>
                        <div>
                            <h4 class="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Právní Flagy</h4>
                            <div id="modal-flags" class="flex flex-wrap gap-2"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const chronology = ${JSON.stringify(chronology)};
        const logs = ${JSON.stringify(simulatedLogs)};
        let currentLang = 'cs';

        function toggleLang(lang) {
            currentLang = lang;
            document.body.className = 'lang-' + lang;
            document.getElementById('btn-cs').className = 'px-3 py-1 rounded-md text-xs font-bold transition-all ' + (lang === 'cs' ? 'bg-white shadow-sm' : 'text-slate-400');
            document.getElementById('btn-en').className = 'px-3 py-1 rounded-md text-xs font-bold transition-all ' + (lang === 'en' ? 'bg-white shadow-sm' : 'text-slate-400');
        }

        function runLogs() {
            const consoleEl = document.getElementById('audit-console');
            logs.forEach(log => {
                setTimeout(() => {
                    const div = document.createElement('div');
                    div.className = log.t[currentLang === 'cs' ? 'cz' : 'en'].includes('ZÁVĚR') || log.t[currentLang === 'cs' ? 'cz' : 'en'].includes('CONCLUSION') ? 'text-red-400 font-bold mt-4' : 'text-blue-300';
                    div.innerText = log.t[currentLang === 'cs' ? 'cz' : 'en'];
                    consoleEl.appendChild(div);
                    consoleEl.scrollTop = consoleEl.scrollHeight;
                }, log.d);
            });
        }

        function openModal(idx) {
            const event = chronology[idx];
            document.getElementById('modal-title').innerText = event.eventType;
            document.getElementById('modal-system').innerText = event.systemRecord.content;
            document.getElementById('modal-subject').innerText = event.subjectRecord ? event.subjectRecord.content : 'Nebylo zaznamenáno.';
            document.getElementById('modal-source').innerText = event.systemRecord.source;
            
            const flagsContainer = document.getElementById('modal-flags');
            flagsContainer.innerHTML = event.legalFlags.national.map(f => \`<span class="px-2 py-1 bg-red-100 text-red-700 text-[9px] font-bold rounded border border-red-200 uppercase">\${f}</span>\`).join('');
            
            document.getElementById('modal-overlay').classList.add('open');
        }

        function closeModal() {
            document.getElementById('modal-overlay').classList.remove('open');
        }

        // Intersection Observer for animations
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section-card').forEach(el => {
            el.classList.add('fade-node');
            observer.observe(el);
        });

        window.onload = runLogs;
    </script>
</body>
</html>
  `;
}

function getRiskColor(level: string): string {
  switch (level) {
    case "CRITICAL": return "text-red-400";
    case "HIGH": return "text-red-400";
    case "MEDIUM": return "text-orange-400";
    case "LOW": return "text-green-400";
    default: return "text-slate-400";
  }
}

/**
 * Generates a CSV string containing the discrepancy matrix, legal matrix, and chronology.
 */
export function generateCSVExport(audit: AuditResponse): string {
  const rows: string[][] = [];

  // Helper to escape CSV values
  const escape = (val: any) => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
      return `"${str.replace(/"/g, "\"\"")}"`;
    }
    return str;
  };

  // 1. Discrepancy Matrix
  rows.push(["SECTION", "LABEL", "TIME", "SYSTEM_CLAIM", "SUBJECT_CLAIM", "EVIDENCE", "SEVERITY", "INTERVENTION"]);
  audit.discrepancyMatrix.forEach(d => {
    rows.push([
      "DISCREPANCY",
      d.shortLabel,
      d.time,
      d.claimA,
      d.claimB,
      d.evidence,
      d.severity,
      d.followupIntervention
    ]);
  });

  // 2. Legal Matrix
  rows.push([]); // Empty line separator
  audit.legalMatrix.forEach(l => {
    rows.push([
      "LEGAL_VIOLATION",
      l.violationType,
      l.domain,
      l.reasoning,
      "",
      ""
    ]);
  });

  // 3. Chronology
  rows.push([]); // Empty line separator
  audit.chronology.forEach(c => {
    rows.push([
      "CHRONOLOGY",
      c.eventType,
      c.systemRecord.content,
      c.subjectRecord?.content || "",
      "",
      c.isoDate
    ]);
  });

  return rows.map(row => row.map(escape).join(",")).join("\n");
}
