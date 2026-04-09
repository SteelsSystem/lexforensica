import React from 'react';
import { DeltaStateAudit } from '../types';
import { Activity, Brain, Shield, Database, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

interface DeltaStateDashboardProps {
  data: DeltaStateAudit;
}

export const DeltaStateDashboard: React.FC<DeltaStateDashboardProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER: STATE OF MEANING */}
      <div className="bg-slate-900 border border-cyan-900/50 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-24 h-24 text-cyan-500" />
        </div>
        <h2 className="text-xl font-mono text-cyan-400 flex items-center gap-3 mb-4">
          <Shield className="w-6 h-6" /> STATE OF MEANING [STAV VÝZNAMU]
        </h2>
        <p className="text-slate-300 font-mono leading-relaxed border-l-2 border-cyan-500 pl-4 py-2 bg-cyan-950/20">
          {data.stateOfMeaning}
        </p>
      </div>

      {/* META-CORRESPONDENCE LOOP VISUALIZATION */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'INPUT (MIND)', icon: Brain, content: data.metaLoop.inputMind, color: 'text-purple-400' },
          { label: 'NLP PARSING', icon: Database, content: data.metaLoop.nlpParsing, color: 'text-blue-400' },
          { label: 'CORRELATION', icon: Activity, content: data.metaLoop.correlation, color: 'text-cyan-400' },
          { label: 'OUTPUT (SCIENCE)', icon: Shield, content: data.metaLoop.outputScience, color: 'text-emerald-400' },
          { label: 'LOOP (RECAL)', icon: RefreshCw, content: data.metaLoop.feedbackLoop, color: 'text-orange-400' },
        ].map((step, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col items-center text-center space-y-3 hover:border-cyan-500/50 transition-colors">
            <step.icon className={`w-8 h-8 ${step.color}`} />
            <h3 className="text-[10px] font-mono font-bold text-slate-500 tracking-widest uppercase">{step.label}</h3>
            <p className="text-[11px] text-slate-400 leading-tight">{step.content}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TABULKA A: MEDICÍNSKÁ LINIE */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" /> TABULKA A: MEDICÍNSKÁ LINIE (INPUT_A)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">INSTITUTIONAL RECORD</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Rok</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Událost</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Label</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Váha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.medicalLine.map((entry, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-cyan-500">{entry.year}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{entry.event}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-400">{entry.institutionalLabel}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        entry.evidenceWeight === 'Vysoká' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                        entry.evidenceWeight === 'Střední' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                        'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                      }`}>
                        {entry.evidenceWeight}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABULKA B: KOGNITIVNÍ LINIE */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-slate-200 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" /> TABULKA B: KOGNITIVNÍ LINIE (INPUT_B)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">SUBJECTIVE CHRONOLOGY</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Rok</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Zkušenost</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Kontext</th>
                  <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Využití</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.cognitiveLine.map((entry, i) => (
                  <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-purple-500">{entry.year}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{entry.experience}</td>
                    <td className="px-4 py-3 text-[11px] font-mono text-slate-400 italic">{entry.scientificContext}</td>
                    <td className="px-4 py-3 text-[10px] font-mono text-slate-500">{entry.usability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TABULKA C: NEUROANALOGY (BIOLOGICAL SECTION) */}
      <div className="bg-slate-900 border border-emerald-900/30 rounded-lg overflow-hidden">
        <div className="bg-emerald-950/20 px-4 py-3 border-b border-emerald-900/30 flex items-center justify-between">
          <h3 className="text-sm font-mono font-bold text-emerald-400 flex items-center gap-2">
            <Activity className="w-4 h-4" /> TABULKA C: NEUROANALOGY (BIOLOGICAL SECTION)
          </h3>
          <span className="text-[10px] font-mono text-emerald-600">ORGANIC ETIOLOGY AUDIT</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-emerald-900/20">
                <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Marker</th>
                <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Mechanism</th>
                <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Institutional Misinterpretation</th>
                <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Forensic Relevance</th>
                <th className="px-4 py-2 text-[10px] font-mono text-slate-500 uppercase">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10">
              {data.neuroAnalogy.map((entry, i) => (
                <tr key={i} className="hover:bg-emerald-900/5 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-emerald-500 font-bold">{entry.marker}</td>
                  <td className="px-4 py-3 text-xs text-slate-300 italic">{entry.biologicalMechanism}</td>
                  <td className="px-4 py-3 text-[11px] font-mono text-red-400/80">{entry.institutionalMisinterpretation}</td>
                  <td className="px-4 py-3 text-[11px] text-slate-400">{entry.forensicRelevance}</td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${entry.impactScore * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROGRAMMATIC CATEGORIZATION (META-PARAPHRASE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-sm font-mono font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-500" /> PROGRAMMATIC CATEGORIZATION [META-PARAFRÁZE]
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'MEDICAL_LINE', platform: 'Soud, ČLK', format: 'PDF/Word', effect: 'Právní váha (Objective Evidence)', icon: Database },
            { title: 'COGNITIVE_LINE', platform: 'Substack, MindTalks', format: 'Article/Video', effect: 'Veřejné svědectví (Subjective Consistency)', icon: Brain },
            { title: 'MERGED_DELTA', platform: 'Advokát, Ombudsman', format: 'Chronology PDF', effect: 'Kompletní obrana (Forensic Synthesis)', icon: Shield },
          ].map((cat, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 p-4 rounded space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-500">{cat.title}</span>
                <cat.icon className="w-3 h-3 text-slate-600" />
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-slate-400"><span className="text-slate-600">Platform:</span> {cat.platform}</p>
                <p className="text-[11px] text-slate-400"><span className="text-slate-600">Format:</span> {cat.format}</p>
                <p className="text-[11px] text-emerald-500/80 font-mono">{cat.effect}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
