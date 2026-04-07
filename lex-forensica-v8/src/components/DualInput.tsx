import { useState } from 'react';
import { InstitutionType } from '../types';
import type { AuditInput } from '../types';

interface DualInputProps {
  onSubmit: (input: AuditInput) => void;
  loading: boolean;
}

type Language = 'cs' | 'en' | 'de';

const LABELS: Record<Language, {
  inputALabel: string;
  inputBLabel: string;
  inputAPlaceholder: string;
  inputBPlaceholder: string;
  institutionLabel: string;
  languageLabel: string;
  submitButton: string;
  languageOptions: { value: Language; label: string }[];
}> = {
  cs: {
    inputALabel: 'Institucionální záznamy',
    inputBLabel: 'Hlas subjektu/svědka',
    inputAPlaceholder: 'Vložte institucionální záznamy, zprávy, rozhodnutí nebo dokumentaci…',
    inputBPlaceholder: 'Vložte výpověď subjektu, svědecké prohlášení nebo osobní záznam…',
    institutionLabel: 'Typ instituce',
    languageLabel: 'Jazyk',
    submitButton: 'Spustit forenzní audit',
    languageOptions: [
      { value: 'cs', label: 'CZ' },
      { value: 'en', label: 'EN' },
      { value: 'de', label: 'DE' },
    ],
  },
  en: {
    inputALabel: 'Institutional Records',
    inputBLabel: 'Subject/Witness Voice',
    inputAPlaceholder: 'Paste institutional records, reports, decisions, or documentation…',
    inputBPlaceholder: 'Paste subject testimony, witness statement, or personal account…',
    institutionLabel: 'Institution Type',
    languageLabel: 'Language',
    submitButton: 'Run Forensic Audit',
    languageOptions: [
      { value: 'cs', label: 'CZ' },
      { value: 'en', label: 'EN' },
      { value: 'de', label: 'DE' },
    ],
  },
  de: {
    inputALabel: 'Institutionelle Aufzeichnungen',
    inputBLabel: 'Stimme des Betroffenen/Zeugen',
    inputAPlaceholder: 'Institutionelle Aufzeichnungen, Berichte, Entscheidungen oder Dokumentation einfügen…',
    inputBPlaceholder: 'Aussage des Betroffenen, Zeugenerklärung oder persönlichen Bericht einfügen…',
    institutionLabel: 'Institutionstyp',
    languageLabel: 'Sprache',
    submitButton: 'Forensische Prüfung starten',
    languageOptions: [
      { value: 'cs', label: 'CZ' },
      { value: 'en', label: 'EN' },
      { value: 'de', label: 'DE' },
    ],
  },
};

const INSTITUTION_TYPE_LABELS: Record<InstitutionType, Record<Language, string>> = {
  [InstitutionType.PSYCHIATRIC]: {
    cs: 'Psychiatrická instituce',
    en: 'Psychiatric Institution',
    de: 'Psychiatrische Einrichtung',
  },
  [InstitutionType.JUDICIAL]: {
    cs: 'Soudní instituce',
    en: 'Judicial Institution',
    de: 'Justizeinrichtung',
  },
  [InstitutionType.ADMINISTRATIVE]: {
    cs: 'Správní instituce',
    en: 'Administrative Institution',
    de: 'Verwaltungseinrichtung',
  },
  [InstitutionType.IMMIGRATION]: {
    cs: 'Imigrační instituce',
    en: 'Immigration Institution',
    de: 'Einwanderungsbehörde',
  },
  [InstitutionType.CUSTODIAL]: {
    cs: 'Vazební instituce',
    en: 'Custodial Institution',
    de: 'Strafvollzugseinrichtung',
  },
  [InstitutionType.REGULATORY]: {
    cs: 'Regulační orgán',
    en: 'Regulatory Body',
    de: 'Regulierungsbehörde',
  },
  [InstitutionType.MEDICAL_GENERAL]: {
    cs: 'Obecná zdravotnická instituce',
    en: 'General Medical Institution',
    de: 'Allgemeine medizinische Einrichtung',
  },
  [InstitutionType.CHILD_PROTECTIVE]: {
    cs: 'Orgán ochrany dětí',
    en: 'Child Protective Services',
    de: 'Jugendschutzeinrichtung',
  },
  [InstitutionType.OTHER]: {
    cs: 'Jiná instituce',
    en: 'Other Institution',
    de: 'Sonstige Einrichtung',
  },
};

const INSTITUTION_TYPE_ORDER: InstitutionType[] = [
  InstitutionType.PSYCHIATRIC,
  InstitutionType.JUDICIAL,
  InstitutionType.ADMINISTRATIVE,
  InstitutionType.IMMIGRATION,
  InstitutionType.CUSTODIAL,
  InstitutionType.REGULATORY,
  InstitutionType.MEDICAL_GENERAL,
  InstitutionType.CHILD_PROTECTIVE,
  InstitutionType.OTHER,
];

export function DualInput({ onSubmit, loading }: DualInputProps) {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [institutionType, setInstitutionType] = useState<InstitutionType>(InstitutionType.PSYCHIATRIC);

  const labels = LABELS[language];
  const canSubmit = inputA.trim().length > 0 && inputB.trim().length > 0 && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const auditInput: AuditInput = {
      inputA: inputA.trim(),
      inputB: inputB.trim(),
      language,
      institutionType,
    };
    onSubmit(auditInput);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full bg-gray-950 text-gray-100 p-4 sm:p-6 rounded-xl"
    >
      {/* Top bar: language selector + institution type dropdown */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
        {/* Language selector */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {labels.languageLabel}
          </span>
          <div className="flex gap-1" role="radiogroup" aria-label={labels.languageLabel}>
            {labels.languageOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={language === opt.value}
                onClick={() => setLanguage(opt.value)}
                className={[
                  'px-3 py-1.5 rounded text-sm font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500',
                  language === opt.value
                    ? 'bg-teal-600 border-teal-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-teal-600 hover:text-teal-400',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Institution type dropdown */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label
            htmlFor="institution-type"
            className="text-xs font-semibold text-gray-400 uppercase tracking-widest"
          >
            {labels.institutionLabel}
          </label>
          <select
            id="institution-type"
            value={institutionType}
            onChange={(e) => setInstitutionType(e.target.value as InstitutionType)}
            className="bg-gray-900 border border-gray-700 text-gray-100 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-150 cursor-pointer"
          >
            {INSTITUTION_TYPE_ORDER.map((type) => (
              <option key={type} value={type}>
                {INSTITUTION_TYPE_LABELS[type][language]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-side text areas — stack on mobile */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* INPUT_A */}
        <div className="flex flex-col gap-2 flex-1">
          <label
            htmlFor="input-a"
            className="flex items-center gap-2 text-sm font-semibold text-gray-200"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-teal-700 text-teal-100 text-xs font-bold select-none">
              A
            </span>
            {labels.inputALabel}
          </label>
          <textarea
            id="input-a"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            placeholder={labels.inputAPlaceholder}
            disabled={loading}
            rows={14}
            className={[
              'w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-100',
              'placeholder-gray-600 resize-y leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              'transition-colors duration-150',
              loading ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          />
        </div>

        {/* INPUT_B */}
        <div className="flex flex-col gap-2 flex-1">
          <label
            htmlFor="input-b"
            className="flex items-center gap-2 text-sm font-semibold text-gray-200"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-indigo-700 text-indigo-100 text-xs font-bold select-none">
              B
            </span>
            {labels.inputBLabel}
          </label>
          <textarea
            id="input-b"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            placeholder={labels.inputBPlaceholder}
            disabled={loading}
            rows={14}
            className={[
              'w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-100',
              'placeholder-gray-600 resize-y leading-relaxed',
              'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
              'transition-colors duration-150',
              loading ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          />
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit}
          className={[
            'px-6 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-950',
            canSubmit
              ? 'bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white cursor-pointer shadow-lg shadow-teal-900/40'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700',
          ].join(' ')}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-teal-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {labels.submitButton}
            </span>
          ) : (
            labels.submitButton
          )}
        </button>
      </div>
    </form>
  );
}
