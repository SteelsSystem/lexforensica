import { useState } from 'react';
import type { AuditResponse } from '../types';
import RiskGauge from './RiskGauge';
import DiscrepancyMatrix from './DiscrepancyMatrix';
import LegalMatrix from './LegalMatrix';
import ChronologyTimeline from './ChronologyTimeline';
import DefenseDraft from './DefenseDraft';
import ExportPanel from './ExportPanel';

interface Props {
  audit: AuditResponse;
}

type Tab = 'overview' | 'discrepancies' | 'legal' | 'chronology' | 'defense' | 'export';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'discrepancies', label: 'Discrepancies' },
  { id: 'legal', label: 'Legal Matrix' },
  { id: 'chronology', label: 'Chronology' },
  { id: 'defense', label: 'Defense' },
  { id: 'export', label: 'Export' },
];

export default function Dashboard({ audit }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="space-y-6">
      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="font-mono bg-gray-900 px-2 py-1 rounded">v{audit.meta.version}</span>
        <span>{audit.meta.institutionType}</span>
        <span>{audit.meta.language.toUpperCase()}</span>
        <span>{audit.meta.processingTimeMs}ms</span>
        <span>
          {audit.auditMetrics.totalEntitiesExtracted} entities ·{' '}
          {audit.discrepancyMatrix.length} discrepancies ·{' '}
          {audit.legalMatrix.length} legal findings
        </span>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-400'
                : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.id === 'discrepancies' && audit.discrepancyMatrix.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-900/50 text-red-300 rounded">
                {audit.discrepancyMatrix.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <RiskGauge
              riskAssessment={audit.riskAssessment}
              coherenceScore={audit.auditIntegrity.overallCoherenceScore}
            />

            {/* Immediate Actions */}
            {audit.riskAssessment.immediateActions.length > 0 && (
              <div className="border border-red-900/50 rounded-xl p-4 bg-red-950/20">
                <h4 className="text-xs font-medium text-red-400 mb-2">Immediate Actions Required</h4>
                <ul className="space-y-1.5">
                  {audit.riskAssessment.immediateActions.map((action, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-red-400 shrink-0">!</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Axiomatic Violations Summary */}
            {audit.axiomaticViolations.length > 0 && (
              <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
                <h4 className="text-xs font-medium text-gray-400 mb-3">Axiomatic Violations</h4>
                <div className="space-y-2">
                  {audit.axiomaticViolations.map((v, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="font-mono text-xs text-teal-400 bg-teal-950/50 px-1.5 py-0.5 rounded shrink-0">
                        {v.code}
                      </span>
                      <div>
                        <p className="text-gray-300">{v.finding}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{v.legalArgument}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOOP_CYCLE Log */}
            {audit.auditIntegrity.loopCycleLog.length > 0 && (
              <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
                <h4 className="text-xs font-medium text-gray-400 mb-2">LOOP_CYCLE Validation Log</h4>
                <div className="font-mono text-xs text-gray-500 space-y-0.5 max-h-32 overflow-y-auto">
                  {audit.auditIntegrity.loopCycleLog.map((log, i) => (
                    <p key={i}>{log}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Human Intervention */}
            {audit.humanIntervention.required && (
              <div className="border border-orange-800/50 rounded-xl p-4 bg-orange-950/20">
                <h4 className="text-xs font-medium text-orange-400 mb-1">Human Intervention Required</h4>
                <p className="text-sm text-gray-300">{audit.humanIntervention.reason}</p>
                <p className="text-xs text-gray-500 mt-1">Suggested: {audit.humanIntervention.suggestedExpert}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discrepancies' && (
          <DiscrepancyMatrix entries={audit.discrepancyMatrix} />
        )}

        {activeTab === 'legal' && (
          <LegalMatrix entries={audit.legalMatrix} />
        )}

        {activeTab === 'chronology' && (
          <ChronologyTimeline entries={audit.chronology} />
        )}

        {activeTab === 'defense' && (
          <DefenseDraft defense={audit.defenseSynthesis} />
        )}

        {activeTab === 'export' && (
          <ExportPanel audit={audit} />
        )}
      </div>
    </div>
  );
}
