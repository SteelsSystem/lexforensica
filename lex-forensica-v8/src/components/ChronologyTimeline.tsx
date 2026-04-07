import type { ChronologicalEntry } from '../types';

interface Props {
  entries: ChronologicalEntry[];
}

const ANOMALY_COLORS: Record<string, string> = {
  TIME_VACUUM: 'border-red-500 bg-red-950/30',
  RETROACTIVE_JUSTIFICATION: 'border-orange-500 bg-orange-950/30',
  TEMPORAL_INVERSION: 'border-purple-500 bg-purple-950/30',
  DOCUMENTATION_DELAY: 'border-yellow-500 bg-yellow-950/30',
  PARALLEL_TIMELINE: 'border-blue-500 bg-blue-950/30',
};

const ANOMALY_LABELS: Record<string, string> = {
  TIME_VACUUM: 'Time Vacuum',
  RETROACTIVE_JUSTIFICATION: 'Retroactive Justification',
  TEMPORAL_INVERSION: 'Temporal Inversion',
  DOCUMENTATION_DELAY: 'Documentation Delay',
  PARALLEL_TIMELINE: 'Parallel Timeline',
};

export default function ChronologyTimeline({ entries }: Props) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-800" />

      <div className="space-y-4">
        {sorted.map((entry, i) => {
          const colorClass = ANOMALY_COLORS[entry.anomalyType] ?? 'border-gray-600 bg-gray-900/30';
          return (
            <div key={i} className="relative pl-10">
              {/* Dot */}
              <div className={`absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 ${colorClass.split(' ')[0]?.replace('border', 'border') ?? ''} bg-gray-950`} />

              <div className={`border rounded-lg p-3 ${colorClass}`}>
                <div className="flex items-center gap-2 mb-1">
                  {entry.date && (
                    <span className="text-xs font-mono text-gray-400">{entry.date}</span>
                  )}
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800/80 text-gray-300">
                    {ANOMALY_LABELS[entry.anomalyType] ?? entry.anomalyType}
                  </span>
                  {entry.gapDays !== undefined && entry.gapDays > 0 && (
                    <span className="text-xs text-red-400 font-mono">{entry.gapDays}d gap</span>
                  )}
                  <span className="text-xs text-gray-600">{entry.source}</span>
                </div>
                <p className="text-sm text-gray-300">{entry.event}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
