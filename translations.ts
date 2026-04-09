import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { Shield, AlertTriangle, Scale, Activity, MessageSquare, Check, X, Minus, Info } from 'lucide-react';
import { AuditResponse } from '../types';
import { UI_DICT, AppLanguage } from '../lib/translations';

interface ForensicValidationProps {
  results: AuditResponse;
  lang: AppLanguage;
  onUpdateResults?: (updatedResults: AuditResponse) => void;
}

export default function ForensicValidation({ results, lang, onUpdateResults }: ForensicValidationProps) {
  const t = UI_DICT[lang];
  const [clarificationNotes, setClarificationNotes] = useState<Record<number, string>>({});
  const [verificationStatus, setVerificationStatus] = useState<Record<number, 'YES' | 'NO' | 'DISMISS'>>({});
  const [activeClarification, setActiveClarification] = useState<number | null>(null);

  // --- DATA PREPARATION FOR CHARTS ---

  // 1. Anomaly Distribution (Průkazná distribuce procesních vad v čase)
  const anomalyData = results.discrepancyMatrix.reduce((acc: any[], curr) => {
    const existing = acc.find(d => d.time === curr.time);
    if (existing) {
      existing[curr.shortLabel] = (existing[curr.shortLabel] || 0) + 1;
    } else {
      acc.push({ time: curr.time, [curr.shortLabel]: 1 });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // 2. Risk Factors Over Time (Chronologická analýza eskalace systémového rizika)
  const severityMap: Record<string, number> = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
  const riskData = results.chronology.map(event => {
    const findings = results.discrepancyMatrix.filter(d => d.time === event.isoDate);
    const maxSeverity = findings.length > 0 
      ? Math.max(...findings.map(f => severityMap[f.severity.toUpperCase()] || 1))
      : 1;
    return {
      time: event.isoDate,
      riskLevel: maxSeverity,
      label: event.eventType
    };
  }).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // 3. Semantic Drift (Forenzní audit sémantické integrity a detekce kognitivního zkreslení)
  const semanticData = results.skssDatasheet?.map((item, idx) => ({
    x: idx,
    y: parseInt(item.importance) || 5,
    z: item.ethicalWeight.length,
    term: item.term,
    bias: item.biasFlags
  })) || [];

  const handleVerify = (id: number, status: 'YES' | 'NO' | 'DISMISS') => {
    setVerificationStatus(prev => ({ ...prev, [id]: status }));
    // In a real app, we would update the results object and call onUpdateResults
  };

  const handleClarify = (id: number, note: string) => {
    setClarificationNotes(prev => ({ ...prev, [id]: note }));
    setActiveClarification(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER: FORMAL LEGAL DISCLOSURE */}
      <div className="bg-slate-900 border-l-4 border-cyan-500 p-6 rounded-r-lg shadow-xl">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3 font-mono tracking-tight">
          <Shield className="w-6 h-6 text-cyan-500" />
          FORENZNÍ VALIDACE A LIDSKÁ KONTROLA (HUMAN-IN-THE-LOOP)
        </h2>
        <p className="text-sm text-slate-400 mt-2 font-serif leading-relaxed">
          Následující sekce slouží k autoritativnímu přezkumu AI generovaných zjištění. Každý bod diskrepancí musí být podroben lidskému posouzení z hlediska důkazní síly (burden of proof) a souladu s procesními standardy. Validace je nezbytná pro transformaci analytických uzlů v právně závazné argumenty.
        </p>
      </div>

      {/* VISUALIZATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Anomaly Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Activity className="w-4 h-4 text-red-500" />
            Průkazná distribuce procesních vad v čase (Anomaly Distribution)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={anomalyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px' }}
                  itemStyle={{ fontSize: '10px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="[REF-AX1-VOID]" fill="#ef4444" radius={[2, 2, 0, 0]} name="Time Vacuum" />
                <Bar dataKey="[REF-MOD-SEM]" fill="#a855f7" radius={[2, 2, 0, 0]} name="Semantic Drift" />
                <Bar dataKey="[REF-AX2-BIAS]" fill="#f97316" radius={[2, 2, 0, 0]} name="Institutional Bias" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 font-mono italic">
            * Analýza hustoty výskytu anomálií indikuje kritické body selhání v institucionálním řetězci.
          </p>
        </div>

        {/* 2. Risk Factors Over Time */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Chronologická analýza eskalace systémového rizika (Risk Escalation)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                <YAxis stroke="#64748b" fontSize={10} domain={[1, 4]} ticks={[1, 2, 3, 4]} tickFormatter={(val) => ['LOW', 'MED', 'HIGH', 'CRIT'][val-1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '4px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '10px' }}
                />
                <Line type="monotone" dataKey="riskLevel" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 font-mono italic">
            * Křivka rizika mapuje kumulativní dopad procesních vad na integritu právního postavení subjektu.
          </p>
        </div>

        {/* 3. Semantic Drift */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Scale className="w-4 h-4 text-purple-500" />
            Forenzní audit sémantické integrity a detekce kognitivního zkreslení (Semantic Drift)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Sequence" hide />
                <YAxis type="number" dataKey="y" name="Importance" stroke="#64748b" fontSize={10} label={{ value: 'Importance', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Ethical Weight" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-950 border border-slate-800 p-2 rounded shadow-xl font-mono text-[10px]">
                        <p className="text-cyan-400 font-bold">{data.term}</p>
                        <p className="text-slate-400 mt-1">Bias: {data.bias}</p>
                        <p className="text-slate-400">Weight: {data.y}</p>
                      </div>
                    );
                  }
                  return null;
                }} />
                <Scatter name="Terms" data={semanticData}>
                  {semanticData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.bias.includes('DETEKVÁN') ? '#a855f7' : '#06b6d4'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 font-mono italic">
            * Vizualizace sémantického pole odhaluje účelovou manipulaci s pojmy (Semantic Drift) napříč dokumentací.
          </p>
        </div>
      </div>

      {/* HUMAN-IN-THE-LOOP VALIDATION TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500" />
            PROTOKOL LIDSKÉ VERIFIKACE (VALIDATION PROTOCOL)
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            PENDING: {results.discrepancyMatrix.length - Object.keys(verificationStatus).length} | VERIFIED: {Object.values(verificationStatus).filter(v => v === 'YES').length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 font-mono text-[10px] text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <th className="p-4">ID / Čas</th>
                <th className="p-4">Zjištění (AI Evidence)</th>
                <th className="p-4">Právní Kvalifikace</th>
                <th className="p-4">Status Verifikace</th>
                <th className="p-4">Akce</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {results.discrepancyMatrix.map((row) => (
                <React.Fragment key={row.id}>
                  <tr className={`border-b border-slate-800/50 transition-colors ${verificationStatus[row.id] === 'YES' ? 'bg-emerald-900/10' : verificationStatus[row.id] === 'NO' ? 'bg-red-900/10' : 'hover:bg-slate-800/30'}`}>
                    <td className="p-4 align-top">
                      <div className="font-mono text-cyan-500 font-bold">#{row.id}</div>
                      <div className="text-slate-500 mt-1">{row.time}</div>
                    </td>
                    <td className="p-4 align-top max-w-md">
                      <p className="text-slate-300 leading-relaxed">{row.evidence}</p>
                      {clarificationNotes[row.id] && (
                        <div className="mt-2 p-2 bg-slate-950 border border-slate-800 rounded text-[10px] text-amber-400 font-mono italic flex items-start gap-2">
                          <Info className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>Lidská poznámka: {clarificationNotes[row.id]}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-mono font-bold ${
                        row.shortLabel?.includes('VOID') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {row.shortLabel}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-2 font-mono">{row.severity} SEVERITY</div>
                    </td>
                    <td className="p-4 align-top">
                      {verificationStatus[row.id] ? (
                        <span className={`font-mono font-bold text-[10px] px-2 py-1 rounded ${
                          verificationStatus[row.id] === 'YES' ? 'bg-emerald-500 text-white' : 
                          verificationStatus[row.id] === 'NO' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {verificationStatus[row.id]}
                        </span>
                      ) : (
                        <span className="text-slate-600 font-mono italic">Awaiting review...</span>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleVerify(row.id, 'YES')}
                          className={`p-2 rounded transition-colors ${verificationStatus[row.id] === 'YES' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-emerald-900/50 hover:text-emerald-400'}`}
                          title="Potvrdit (YES)"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleVerify(row.id, 'NO')}
                          className={`p-2 rounded transition-colors ${verificationStatus[row.id] === 'NO' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-red-900/50 hover:text-red-400'}`}
                          title="Odmítnout (NO)"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleVerify(row.id, 'DISMISS')}
                          className={`p-2 rounded transition-colors ${verificationStatus[row.id] === 'DISMISS' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                          title="Ignorovat (DISMISS)"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setActiveClarification(activeClarification === row.id ? null : row.id)}
                          className={`p-2 rounded transition-colors ${activeClarification === row.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-cyan-900/50 hover:text-cyan-400'}`}
                          title="Doplnit vyjasnění (Clarification)"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {activeClarification === row.id && (
                    <tr className="bg-slate-950/50">
                      <td colSpan={5} className="p-4 border-b border-slate-800">
                        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                          <label className="text-[10px] font-mono text-cyan-500 font-bold uppercase tracking-widest">
                            Doplnění argumentace a vyjasnění případu (Legal Reasoning)
                          </label>
                          <textarea 
                            className="w-full bg-slate-900 border border-slate-800 rounded p-3 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500 h-24"
                            placeholder="Zadejte podrobné zdůvodnění pro posílení právní argumentace..."
                            defaultValue={clarificationNotes[row.id] || ''}
                            onBlur={(e) => handleClarify(row.id, e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setActiveClarification(null)}
                              className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
                            >
                              ZAVŘÍT
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLARIFICATION QUESTIONS FROM AI */}
      {results.humanIntervention?.clarificationQuestions?.length > 0 && (
        <div className="bg-amber-900/10 border border-amber-900/30 rounded-lg p-6 shadow-lg">
          <h3 className="text-sm font-bold text-amber-400 font-mono flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" />
            AI DOPORUČENÍ K VYJASNĚNÍ (CLARIFICATION QUESTIONS)
          </h3>
          <ul className="space-y-3">
            {results.humanIntervention.clarificationQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-3 text-xs text-slate-300 font-serif leading-relaxed bg-slate-900/50 p-3 rounded border border-amber-900/20">
                <span className="text-amber-500 font-bold font-mono">Q{i+1}:</span>
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
