import { useState } from 'react';
import type { AuditResponse } from '../types';

interface Props {
  audit: AuditResponse;
}

function redactPII(text: string): string {
  // Redact names (Dr. / MUDr. / Prof. + Surname)
  let redacted = text.replace(
    /(?:Dr\.|MUDr\.|PhDr\.|JUDr\.|Prof\.|Mgr\.|Dipl\.-Psych\.)\s+[A-ZÁ-Ža-zá-ž]+(?:\s+[A-ZÁ-Ž][a-zá-ž]+)?/g,
    '[REDACTED_NAME]'
  );
  // Redact dates of birth (DD.MM.YYYY, DD/MM/YYYY)
  redacted = redacted.replace(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/g, '[REDACTED_DOB]');
  // Redact Czech birth numbers (rodné číslo: YYMMDD/XXXX)
  redacted = redacted.replace(/\b\d{6}\/\d{3,4}\b/g, '[REDACTED_ID]');
  // Redact email addresses
  redacted = redacted.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  return redacted;
}

function generateCSV(audit: AuditResponse, withPIIRedaction: boolean): string {
  const headers = ['RefCode', 'Axiom', 'Severity', 'Finding', 'Evidence', 'Source A', 'Source B', 'Legal Basis', 'ECHR Articles', 'Remedy Suggestion'];
  const rows = audit.discrepancyMatrix.map(entry => {
    const process = (text: string) => withPIIRedaction ? redactPII(text) : text;
    const legalArticles = audit.legalMatrix
      .filter(l => l.evidenceRefs.includes(entry.refCode))
      .map(l => l.article)
      .join('; ');
    return [
      entry.refCode,
      entry.axiom,
      entry.severity,
      process(entry.finding),
      process(entry.evidence),
      process(entry.sourceA),
      process(entry.sourceB),
      entry.legalBasis,
      legalArticles,
      process(entry.remedySuggestion),
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

function generateJSON(audit: AuditResponse, withPIIRedaction: boolean): string {
  if (!withPIIRedaction) return JSON.stringify(audit, null, 2);

  const serialized = JSON.stringify(audit);
  return JSON.stringify(JSON.parse(redactPII(serialized)), null, 2);
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportPanel({ audit }: Props) {
  const [redactPII_toggle, setRedactPII] = useState(true);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  return (
    <div className="border border-gray-800 rounded-xl p-4 bg-gray-900/50">
      <h4 className="text-sm font-medium text-gray-200 mb-3">Export Audit Data</h4>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={redactPII_toggle}
          onChange={() => setRedactPII(!redactPII_toggle)}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500"
        />
        <span className="text-sm text-gray-400">Redact PII before export</span>
        <span className="text-xs text-gray-600">(names, DOB, IDs, emails)</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => downloadBlob(
            generateCSV(audit, redactPII_toggle),
            `lex-forensica-discrepancies-${timestamp}.csv`,
            'text/csv'
          )}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300
                     hover:bg-gray-700 hover:border-teal-700 transition-colors"
        >
          CSV — Discrepancy Matrix
        </button>
        <button
          onClick={() => downloadBlob(
            generateJSON(audit, redactPII_toggle),
            `lex-forensica-full-audit-${timestamp}.json`,
            'application/json'
          )}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300
                     hover:bg-gray-700 hover:border-teal-700 transition-colors"
        >
          JSON — Full Audit
        </button>
      </div>

      {redactPII_toggle && (
        <p className="text-xs text-teal-600 mt-3">
          PII redaction active: names, dates of birth, IDs, and emails will be masked in exports.
        </p>
      )}
    </div>
  );
}
