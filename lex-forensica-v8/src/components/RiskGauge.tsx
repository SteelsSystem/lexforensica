import type { AuditResponse } from '../types';

interface RiskGaugeProps {
  riskAssessment: AuditResponse['riskAssessment'];
  coherenceScore: number;
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-950/50 border-red-800',
  HIGH: 'text-orange-400 bg-orange-950/50 border-orange-800',
  MODERATE: 'text-yellow-400 bg-yellow-950/50 border-yellow-800',
  LOW: 'text-green-400 bg-green-950/50 border-green-800',
};

export default function RiskGauge({ riskAssessment, coherenceScore }: RiskGaugeProps) {
  const riskColor = RISK_COLORS[riskAssessment.overallRiskLevel] ?? RISK_COLORS.MODERATE;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Risk Level */}
      <div className={`border rounded-xl p-4 ${riskColor}`}>
        <p className="text-xs text-gray-400 mb-1">Risk Level</p>
        <p className="text-2xl font-bold">{riskAssessment.overallRiskLevel}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${riskAssessment.riskScore}%`,
                backgroundColor: riskAssessment.riskScore > 75 ? '#f87171' :
                  riskAssessment.riskScore > 50 ? '#fb923c' :
                  riskAssessment.riskScore > 25 ? '#facc15' : '#4ade80',
              }}
            />
          </div>
          <span className="text-sm font-mono">{riskAssessment.riskScore}</span>
        </div>
      </div>

      {/* Coherence */}
      <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
        <p className="text-xs text-gray-400 mb-1">Coherence Score</p>
        <p className="text-2xl font-bold text-teal-400">{(coherenceScore * 100).toFixed(1)}%</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-teal-500 transition-all duration-700"
              style={{ width: `${coherenceScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Concerns */}
      <div className="border border-gray-700 rounded-xl p-4 bg-gray-900/50">
        <p className="text-xs text-gray-400 mb-2">Primary Concerns</p>
        <ul className="space-y-1">
          {riskAssessment.primaryConcerns.slice(0, 3).map((concern, i) => (
            <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
              <span className="text-red-400 mt-0.5">•</span>
              <span className="line-clamp-2">{concern}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
