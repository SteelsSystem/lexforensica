import type { DefenseSynthesis } from '../types';

interface Props {
  defense: DefenseSynthesis;
}

export default function DefenseDraft({ defense }: Props) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="border border-teal-800/50 rounded-xl p-4 bg-teal-950/20">
        <h4 className="text-xs font-medium text-teal-400 mb-2">Defense Summary</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{defense.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ECHR Articles */}
        <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
          <h4 className="text-xs font-medium text-gray-400 mb-2">ECHR Articles</h4>
          <div className="flex flex-wrap gap-2">
            {defense.echrArticles.map((art, i) => (
              <span key={i} className="px-2 py-1 bg-teal-950/50 border border-teal-800 rounded text-xs text-teal-300 font-mono">
                {art}
              </span>
            ))}
          </div>
        </div>

        {/* CRPD Provisions */}
        {defense.crpdProvisions.length > 0 && (
          <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
            <h4 className="text-xs font-medium text-gray-400 mb-2">CRPD Provisions</h4>
            <div className="flex flex-wrap gap-2">
              {defense.crpdProvisions.map((prov, i) => (
                <span key={i} className="px-2 py-1 bg-purple-950/50 border border-purple-800 rounded text-xs text-purple-300 font-mono">
                  {prov}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Counter-Arguments */}
      <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
        <h4 className="text-xs font-medium text-gray-400 mb-3">Counter-Arguments</h4>
        <ul className="space-y-2">
          {defense.counterArguments.map((arg, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-teal-500 mt-0.5 shrink-0">{i + 1}.</span>
              <span>{arg}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended Actions */}
      <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
        <h4 className="text-xs font-medium text-gray-400 mb-3">Recommended Actions</h4>
        <ul className="space-y-2">
          {defense.recommendedActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-orange-400 mt-0.5 shrink-0">→</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Legal Brief Draft */}
      {defense.legalBriefDraft && (
        <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Legal Brief Draft</h4>
          <div className="bg-gray-800/50 rounded-lg p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {defense.legalBriefDraft}
          </div>
        </div>
      )}
    </div>
  );
}
