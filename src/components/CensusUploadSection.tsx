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
} from 'lucide-react';
import { parseCSV, detectColumnMapping, normalizeRows, ColumnMapping } from '../services/dataNormalizer';
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

export const CensusUploadSection: React.FC<CensusUploadSectionProps> = ({
  onDataLoaded,
  currentFilename,
  recordsCount,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [columnMapping, setColumnMapping] = useState<Partial<ColumnMapping>>({});
  const [unmappedRequired, setUnmappedRequired] = useState<(keyof ColumnMapping)[]>([]);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processCSVContent = (content: string, filename: string) => {
    setErrorMsg(null);
    setAiNote(null);

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

    const { mapping, unmappedRequired: missingReq } = detectColumnMapping(headers);
    setColumnMapping(mapping);
    setUnmappedRequired(missingReq);

    if (missingReq.length > 0) {
      setShowMappingModal(true);
    } else {
      // Complete mapping found, normalize directly
      const normalized = normalizeRows(rows, mapping as ColumnMapping);
      onDataLoaded(normalized, filename);
    }
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
      processCSVContent(text, file.name);
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
        processCSVContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const requestAiMapping = async () => {
    if (rawHeaders.length === 0) return;
    setIsAiSuggesting(true);
    setAiNote(null);

    try {
      const res = await fetch('/api/ai/suggest-mapping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headers: rawHeaders }),
      });
      const data = await res.json();
      if (data.mapping) {
        const newMap = { ...columnMapping };
        Object.entries(data.mapping).forEach(([key, val]) => {
          if (val && rawHeaders.includes(val as string)) {
            newMap[key as keyof ColumnMapping] = val as string;
          }
        });
        setColumnMapping(newMap);
        const required: (keyof ColumnMapping)[] = [
          'employee_id',
          'name',
          'relationship',
          'date_of_birth',
        ];
        const stillMissing = required.filter((r) => !newMap[r]);
        setUnmappedRequired(stillMissing);
        setAiNote(data.confidence_notes || 'AI column suggestions applied. Please review.');
      }
    } catch (err: any) {
      setAiNote('Could not connect to AI service. Using manual configuration.');
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const confirmMappingAndProceed = () => {
    if (unmappedRequired.length > 0) {
      setErrorMsg(
        `Please map all required fields: ${unmappedRequired.join(', ')} before proceeding.`
      );
      return;
    }
    const normalized = normalizeRows(rawRows, columnMapping as ColumnMapping);
    onDataLoaded(normalized, currentFilename || 'Uploaded_Census.csv');
    setShowMappingModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 2: SME Census Ingestion</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload raw employee census CSVs or select from standardized pre-packaged synthetic datasets.
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
                ? 'border-teal-500 bg-teal-50/50'
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
            <div className="w-12 h-12 mx-auto rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Drag & Drop your SME Census CSV here, or{' '}
              <span className="text-teal-600 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports UTF-8 CSV with automated header normalization · Max 5MB / 5,000 records
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
              Download or immediately load calibrated test datasets with controlled validation edge cases.
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
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={() => processCSVContent(SAMPLE_CHALLENGE_105_CSV, 'Challenge_105_Records.csv')}
                className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              >
                Load In App
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
                clean end-to-end straight-through quoting.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={() => processCSVContent(SAMPLE_CLEAN_50_CSV, 'Clean_50_Records.csv')}
                className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              >
                Load In App
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
                High-density exception queue stress test: custom column aliases, text dates, duplicate
                keys, and non-standard relations.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center gap-2">
              <button
                onClick={() => processCSVContent(SAMPLE_EXCEPTIONS_30_CSV, 'Exceptions_30_Records.csv')}
                className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              >
                Load In App
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

      {/* Manual / AI Column Mapping Modal */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Census Column Field Mapping</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm or map your CSV column headers to required insurance rating fields.
                </p>
              </div>
              <button
                onClick={requestAiMapping}
                disabled={isAiSuggesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isAiSuggesting ? 'Analyzing...' : 'AI Auto-Suggest Mapping'}</span>
              </button>
            </div>

            {aiNote && (
              <div className="mt-3 p-2.5 rounded bg-indigo-50/70 border border-indigo-200 text-indigo-900 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{aiNote}</span>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {[
                { key: 'employee_id', label: 'Employee / Member ID', req: true },
                { key: 'name', label: 'Full Member Name', req: true },
                { key: 'relationship', label: 'Relationship (Employee / Spouse / Child / Other)', req: true },
                { key: 'date_of_birth', label: 'Date of Birth (DOB)', req: true },
                { key: 'job_title', label: 'Job Title / Occupation', req: false },
                { key: 'department', label: 'Department / Unit', req: false },
                { key: 'location', label: 'Location / Work City', req: false },
              ].map((field) => {
                const currentVal = columnMapping[field.key as keyof ColumnMapping] || '';
                const isMissing = field.req && !currentVal;

                return (
                  <div
                    key={field.key}
                    className={`p-3 rounded-lg border ${
                      isMissing ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200 bg-slate-50/50'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-2`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">{field.label}</span>
                        {field.req ? (
                          <span className="text-[10px] font-bold text-rose-600 uppercase">Required</span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Optional</span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Target field: {field.key}
                      </span>
                    </div>

                    <select
                      value={currentVal}
                      onChange={(e) => {
                        const newMap = { ...columnMapping, [field.key]: e.target.value };
                        setColumnMapping(newMap);
                        const required: (keyof ColumnMapping)[] = [
                          'employee_id',
                          'name',
                          'relationship',
                          'date_of_birth',
                        ];
                        setUnmappedRequired(required.filter((r) => !newMap[r]));
                      }}
                      className="text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-teal-500 min-w-[200px]"
                    >
                      <option value="">-- Select matching CSV header --</option>
                      {rawHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {unmappedRequired.length === 0 ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready for normalization
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold">
                    Missing {unmappedRequired.length} required field(s)
                  </span>
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMappingModal(false)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-medium rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMappingAndProceed}
                  disabled={unmappedRequired.length > 0}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer"
                >
                  Apply & Run Validation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
