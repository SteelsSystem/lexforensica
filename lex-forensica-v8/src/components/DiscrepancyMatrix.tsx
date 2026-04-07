import type { DiscrepancyEntry, AxiomSeverity } from '../types';

interface Props {
  entries: DiscrepancyEntry[];
}

const SEVERITY_BADGE: Record<AxiomSeverity, string> = {
  CRITICAL: 'bg-red-900/60 text-red-300 border-red-700',
  HIGH: 'bg-orange-900/60 text-orange-300 border-orange-700',
  MEDIUM: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  LOW: 'bg-green-900/60 text-green-300 border-green-700',
  INFO: 'bg-gray-800 text-gray-400 border-gray-600',
};

export default function DiscrepancyMatrix({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <div className="border border-gray-800 rounded-xl p-6 text-center">
        <p className="text-gray-500 text-sm">No discrepancies detected.</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900/80 border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">REF</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Axiom</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Severity</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Finding</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Legal Basis</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Remedy</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-teal-400 whitespace-nowrap">
                  {entry.refCode}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap">
                  {entry.axiom}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded border ${SEVERITY_BADGE[entry.severity]}`}>
                    {entry.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300 max-w-xs">
                  <p className="line-clamp-2">{entry.finding}</p>
                  {entry.evidence && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{entry.evidence}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                  {entry.legalBasis}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 max-w-xs">
                  <p className="line-clamp-2">{entry.remedySuggestion}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
