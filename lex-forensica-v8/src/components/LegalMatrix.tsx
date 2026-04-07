import type { LegalMatrixEntry } from '../types';

interface Props {
  entries: LegalMatrixEntry[];
}

const STRENGTH_STYLE: Record<string, string> = {
  STRONG: 'text-red-400 bg-red-950/40',
  MODERATE: 'text-orange-400 bg-orange-950/40',
  CIRCUMSTANTIAL: 'text-yellow-400 bg-yellow-950/40',
};

export default function LegalMatrix({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900/80 border-b border-gray-800">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Article</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Provision</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Violation</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Strength</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Evidence Refs</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/40 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-teal-400 whitespace-nowrap">
                  {entry.article}
                </td>
                <td className="px-4 py-3 text-gray-300 text-xs max-w-xs">
                  {entry.provision}
                </td>
                <td className="px-4 py-3 text-gray-300 max-w-sm">
                  <p className="line-clamp-2">{entry.violation}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded ${STRENGTH_STYLE[entry.strength] ?? ''}`}>
                    {entry.strength}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">
                  {entry.evidenceRefs.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
