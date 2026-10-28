import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Info,
  Layers,
  HelpCircle,
  Eye,
  Check,
  BrainCircuit,
  Sliders,
} from 'lucide-react';
import {
  parseCSV,
  detectColumnMapping,
  normalizeRows,
  ColumnMapping,
} from '../services/dataNormalizer';
import { CensusRecord } from '../types/census';
import {
  SAMPLE_CHALLENGE_105_CSV,
  SAMPLE_CLEAN_50_CSV,
  SAMPLE_EXCEPTIONS_30_CSV,
} from '../data/sampleDatasets';
import { downloadFile } from '../services/exportService';

interface CensusUploadSectionProps {
  onDataLoaded: (records: CensusRecord[], sourceName: string) => void;
  currentFilename: string | null;
  recordsCount: number;
}

interface StandardFieldDefinition {
  key: keyof ColumnMapping;
  label: string;
  description: string;
  required: boolean;
  expectedFormat: string;
}

const STANDARD_FIELDS: StandardFieldDefinition[] = [
  {
    key: 'employee_id',
    label: 'Employee / Member ID',
    description: 'Unique identifier for employee, subscriber, or dependent.',
    required: true,
    expectedFormat: 'Alphanumeric ID (e.g. EMP001, CLN102)',
  },
  {
    key: 'name',
    label: 'Full Legal Name',
    description: 'Complete member name for healthcare policy and card issuance.',
    required: true,
    expectedFormat: 'Full Name (e.g. Johnathan Vance)',
  },
  {
    key: 'relationship',
    label: 'Relationship Category',
    description: 'Designation: employee, spouse, child, or other.',
    required: true,
    expectedFormat: 'employee | spouse | child | other',
  },
  {
    key: 'date_of_birth',
    label: 'Date of Birth (DOB)',
    description: 'Member birth date required for actuarial age calculation.',
    required: true,
    expectedFormat: 'YYYY-MM-DD or DD/MM/YYYY (e.g. 1988-05-14)',
  },
  {
    key: 'job_title',
    label: 'Job Title / Occupation',
    description: 'Designation used for corporate underwriting stratification.',
    required: false,
    expectedFormat: 'Role title (e.g. Senior Architect)',
  },
  {
    key: 'department',
    label: 'Department / Business Unit',
    description: 'Employer internal grouping or organizational unit.',
    required: false,
    expectedFormat: 'Department name (e.g. Engineering)',
  },
  {
    key: 'location',
    label: 'Work Location / Emirate',
    description: 'Location for regional regulatory rating (e.g. Dubai, Abu Dhabi).',
    required: false,
    expectedFormat: 'Emirate or City (e.g. Dubai, Abu Dhabi)',
  },
];

export const CensusUploadSection: React.FC<CensusUploadSectionProps> = ({
  onDataLoaded,
  currentFilename,
  recordsCount,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Raw file parsing state
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [activeFileName, setActiveFileName] = useState<string>('');

  // AI Mapping & Confirmation Modal State
  const [showMappingConfirmationModal, setShowMappingConfirmationModal] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [columnMapping, setColumnMapping] = useState<Partial<ColumnMapping>>({});
  const [aiReasoning, setAiReasoning] = useState<Record<string, string>>({});
  const [aiConfidence, setAiConfidence] = useState<string>('high');
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const [unmappedRequired, setUnmappedRequired] = useState<(keyof ColumnMapping)[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract sample values from raw rows for a header
  const getSampleValuesForHeader = (headerName?: string): string[] => {
    if (!headerName || rawRows.length === 0) return [];
    const samples: string[] = [];
    for (let i = 0; i < Math.min(3, rawRows.length); i++) {
      const val = rawRows[i][headerName];
      if (val !== undefined && val !== null && val.trim() !== '') {
        samples.push(val.trim());
      }
    }
    return samples;
  };

  // Trigger Gemini AI mapping via server endpoint
  const queryAiMapping = async (
    headers: string[],
    sampleRows: Record<string, string>[],
    initialHeuristicMapping: Partial<ColumnMapping>
  ) => {
    setIsAiAnalyzing(true);
    setAiNotes(null);

    try {
      const res = await fetch('/api/ai/suggest-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers,
          sample_rows: sampleRows.slice(0, 5),
        }),
      });

      const data = await res.json();

      const suggestedMap: Partial<ColumnMapping> = { ...initialHeuristicMapping };
      const reasons: Record<string, string> = data.reasoning || {};

      if (data.mapping) {
        Object.entries(data.mapping).forEach(([stdKey, mappedHeader]) => {
          if (mappedHeader && headers.includes(mappedHeader as string)) {
            suggestedMap[stdKey as keyof ColumnMapping] = mappedHeader as string;
          }
        });
      }

      setColumnMapping(suggestedMap);
      setAiReasoning(reasons);
      setAiConfidence(data.confidence || 'high');
      setAiNotes(
        data.confidence_notes ||
          'Gemini analyzed CSV headers and sample data patterns to propose optimal mapping.'
      );

      // Check for missing required fields
      const required: (keyof ColumnMapping)[] = [
        'employee_id',
        'name',
        'relationship',
        'date_of_birth',
      ];
      const missing = required.filter((r) => !suggestedMap[r]);
      setUnmappedRequired(missing);
    } catch (err: any) {
      console.warn('AI mapping call failed, using heuristic mapping:', err);
      setAiNotes('Heuristic alias analysis applied (AI service unreachable).');
      const required: (keyof ColumnMapping)[] = [
        'employee_id',
        'name',
        'relationship',
        'date_of_birth',
      ];
      setUnmappedRequired(required.filter((r) => !initialHeuristicMapping[r]));
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const processCSVContent = async (content: string, filename: string, forceAiModal: boolean = true) => {
    setErrorMsg(null);
    setSuccessBanner(null);

    // Validate size limit (5MB)
    if (content.length > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds the 5MB demonstration upload limit.');
      return;
    }

    const { headers, rows } = parseCSV(content);

    if (headers.length === 0 || rows.length === 0) {
      setErrorMsg('The uploaded file is empty or does not contain a valid CSV header row.');
      return;
    }

    if (rows.length > 5000) {
      setErrorMsg('Demonstration limit is 5,000 records. Please upload a smaller census.');
      return;
    }

    setRawHeaders(headers);
    setRawRows(rows);
    setActiveFileName(filename);

    const { mapping: heuristicMapping, unmappedRequired: missingReq } = detectColumnMapping(headers);
    setColumnMapping(heuristicMapping);
    setUnmappedRequired(missingReq);

    // Always launch the AI-assisted column mapping confirmation modal upon upload
    setShowMappingConfirmationModal(true);
    await queryAiMapping(headers, rows, heuristicMapping);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a standard CSV file (.csv format).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processCSVContent(text, file.name, true);
    };
    reader.onerror = () => {
      setErrorMsg('Error reading the selected file. Please verify it is a valid UTF-8 text file.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        setErrorMsg('Please upload a standard CSV file (.csv format).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processCSVContent(text, file.name, true);
      };
      reader.readAsText(file);
    }
  };

  const confirmMappingAndProceed = () => {
    if (unmappedRequired.length > 0) {
      setErrorMsg(
        `Please map all required fields: ${unmappedRequired.join(', ')} before proceeding.`
      );
      return;
    }

    // Execute deterministic normalization
    const normalized = normalizeRows(rawRows, columnMapping as ColumnMapping);
    onDataLoaded(normalized, activeFileName || 'Uploaded_Census.csv');
    setShowMappingConfirmationModal(false);
    setSuccessBanner(
      `AI-Assisted mapping confirmed for ${activeFileName || 'census'}. Processed ${normalized.length} records deterministically.`
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Step 2: SME Census Ingestion</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>Gemini Column Mapping Enabled</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload raw employee census CSVs. Gemini automatically analyzes headers and sample data
              to propose verified column mappings before deterministic rating.
            </p>
          </div>
          {currentFilename && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>
                Active: {currentFilename} ({recordsCount} records)
              </span>
            </div>
          )}
        </div>

        {successBanner && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-xs text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Dropzone */}
        <div className="mt-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & Drop your SME Census CSV here, or{' '}
              <span className="text-indigo-600 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports UTF-8 CSV with automated AI column mapping · Max 5MB / 5,000 records
            </p>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Packaged Synthetic Datasets Section */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Pre-Configured Synthetic Datasets</h3>
            <p className="text-xs text-slate-500">
              Quickly load test datasets or test the AI column mapping workflow with customized headers.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
            Fictional Synthetic Data
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dataset 1: Challenge 105 */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  Recommended for Evaluation
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">105 Rows</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Challenge Dataset (105 Records)</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Contains deliberate test errors: missing DOB, duplicate ID, invalid dates, future DOB,
                implausible age, unknown relationship, missing name, duplicate row.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => processCSVContent(SAMPLE_CHALLENGE_105_CSV, 'Synthetic_Challenge_105.csv', true)}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Map with AI & Ingest</span>
                </button>
                <button
                  onClick={() =>
                    downloadFile(SAMPLE_CHALLENGE_105_CSV, 'Synthetic_Challenge_105.csv', 'text/csv')
                  }
                  title="Download CSV"
                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dataset 2: Clean 50 */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  100% Clean Benchmark
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">50 Rows</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Clean SME Census (50 Records)</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pristine dataset with valid identifiers, ISO dates, and standard relationships. Tests
                straight-through clean quoting.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => processCSVContent(SAMPLE_CLEAN_50_CSV, 'Synthetic_Clean_50.csv', true)}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Map with AI & Ingest</span>
                </button>
                <button
                  onClick={() =>
                    downloadFile(SAMPLE_CLEAN_50_CSV, 'Synthetic_Clean_50.csv', 'text/csv')
                  }
                  title="Download CSV"
                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Dataset 3: Exceptions 30 */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  Stress Test Queue
                </span>
                <span className="text-xs text-slate-500 font-mono font-semibold">30 Rows</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">Exception-Heavy Census (30 Records)</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Custom non-standard headers (`member_id`, `full_name`, `relation`, `birth_date`, `unit`),
                text dates, and duplicate keys.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => processCSVContent(SAMPLE_EXCEPTIONS_30_CSV, 'Synthetic_Exceptions_30.csv', true)}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Map with AI & Ingest</span>
                </button>
                <button
                  onClick={() =>
                    downloadFile(SAMPLE_EXCEPTIONS_30_CSV, 'Synthetic_Exceptions_30.csv', 'text/csv')
                  }
                  title="Download CSV"
                  className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Assisted Column Mapping & Field Confirmation Modal */}
      {showMappingConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 sm:p-8 border border-slate-200 max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      AI-Assisted Column Mapping & Confirmation
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      File: <strong className="text-slate-800 font-mono">{activeFileName}</strong> ({rawRows.length} rows detected)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => queryAiMapping(rawHeaders, rawRows, columnMapping)}
                  disabled={isAiAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAiAnalyzing ? 'Re-analyzing...' : 'Re-Run Gemini AI Suggest'}</span>
                </button>
              </div>
            </div>

            {/* AI Reasoning & Confidence Summary Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/90 to-sky-50/70 border border-indigo-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  <span>Gemini Intelligence Summary:</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-200 text-indigo-900">
                  Confidence: {aiConfidence}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {aiNotes ||
                  'Gemini analyzed column headers and verified sample cell contents to automatically assign insurance census fields.'}
              </p>
              <div className="text-[11px] text-slate-500 italic">
                * Review or adjust any mapping using the dropdowns below. Once confirmed, deterministic
                validation and rating will execute immediately.
              </div>
            </div>

            {/* Mapping & Confirmation Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 w-1/4">Standard Rating Field</th>
                    <th className="py-2.5 px-4 w-1/3">Mapped CSV Column Header</th>
                    <th className="py-2.5 px-4">Sample Data Preview (First 2 Rows)</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {STANDARD_FIELDS.map((field) => {
                    const currentMappedHeader = columnMapping[field.key] || '';
                    const isMapped = Boolean(currentMappedHeader);
                    const sampleValues = getSampleValuesForHeader(currentMappedHeader);
                    const reasoningText = aiReasoning[field.key];

                    return (
                      <tr
                        key={field.key}
                        className={`hover:bg-slate-50/60 ${
                          field.required && !isMapped ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        {/* Standard Field Info */}
                        <td className="py-3 px-4 align-top">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{field.label}</span>
                            {field.required ? (
                              <span className="text-[10px] font-bold text-rose-600 uppercase px-1.5 py-0.2 bg-rose-50 rounded border border-rose-200">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Optional</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {field.description}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-1">
                            Key: {field.key}
                          </div>
                        </td>

                        {/* Mapped CSV Column Dropdown & AI Reason */}
                        <td className="py-3 px-4 align-top">
                          <select
                            value={currentMappedHeader}
                            onChange={(e) => {
                              const newMap = { ...columnMapping, [field.key]: e.target.value };
                              setColumnMapping(newMap);
                              const reqKeys: (keyof ColumnMapping)[] = [
                                'employee_id',
                                'name',
                                'relationship',
                                'date_of_birth',
                              ];
                              setUnmappedRequired(reqKeys.filter((k) => !newMap[k]));
                            }}
                            className={`w-full text-xs font-medium px-3 py-2 bg-white border rounded-lg focus:outline-indigo-500 ${
                              isMapped
                                ? 'border-teal-400 bg-teal-50/20 text-slate-900 font-semibold'
                                : field.required
                                ? 'border-amber-400 bg-amber-50/30 text-amber-900'
                                : 'border-slate-300 text-slate-700'
                            }`}
                          >
                            <option value="">-- Unmapped / Not present in CSV --</option>
                            {rawHeaders.map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>

                          {reasoningText && (
                            <div className="mt-1 text-[11px] text-indigo-700 font-medium flex items-start gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-500 shrink-0 mt-0.5" />
                              <span>{reasoningText}</span>
                            </div>
                          )}
                        </td>

                        {/* Sample Data Preview */}
                        <td className="py-3 px-4 align-top">
                          {isMapped ? (
                            sampleValues.length > 0 ? (
                              <div className="space-y-1">
                                {sampleValues.map((val, idx) => (
                                  <div
                                    key={idx}
                                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 inline-block mr-1 max-w-[200px] truncate"
                                    title={val}
                                  >
                                    {val}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">No values in sample rows</span>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Select a CSV column to preview values
                            </span>
                          )}
                        </td>

                        {/* Status Icon */}
                        <td className="py-3 px-4 align-top text-right">
                          {isMapped ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              <Check className="w-3.5 h-3.5" />
                              <span>Mapped</span>
                            </span>
                          ) : field.required ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Action Needed</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Omitted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs">
                {unmappedRequired.length === 0 ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>All mandatory fields mapped successfully. Ready for deterministic processing.</span>
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>
                      Missing {unmappedRequired.length} required field(s): {unmappedRequired.join(', ')}
                    </span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setShowMappingConfirmationModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMappingAndProceed}
                  disabled={unmappedRequired.length > 0}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Confirm Mappings & Run Validation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
