import React, { useState, useMemo, useRef } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Copy,
  FileQuestion,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Eye,
  HelpCircle,
  X,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import {
  ValidatedRecord,
  ValidationSummary,
  ValidationStatus,
  ValidationErrorType,
} from '../types/census';
import { ActiveTab } from './Header';

interface ValidationResultsSectionProps {
  records: ValidatedRecord[];
  summary: ValidationSummary | null;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectRecordForReview: (record: ValidatedRecord) => void;
}

type ProblemField = 'employee_id' | 'name' | 'relationship' | 'date_of_birth' | 'age' | 'all';

interface ErrorMetadata {
  title: string;
  ruleCode: string;
  ruleName: string;
  nature: string;
  impact: string;
  recommendedAction: string;
  targetField: ProblemField;
}

const ERROR_METADATA_REGISTRY: Record<string, ErrorMetadata> = {
  missing_identifier: {
    title: 'Missing Member Identifier',
    ruleCode: 'RULE-ID-01',
    ruleName: 'Mandatory Unique Primary / Dependent Key',
    nature: 'The member record lacks an employee ID, subscriber number, or dependent identifier.',
    impact: 'FATAL: Cannot bind to policy administration systems or digital health card registries. Record is excluded from quote rating.',
    recommendedAction: 'Obtain official employee or dependent badge/staff ID from employer HR and assign in Step 4 Exception Review.',
    targetField: 'employee_id',
  },
  duplicate_identifier: {
    title: 'Duplicate Identifier Reused',
    ruleCode: 'RULE-ID-02',
    ruleName: 'Disjoint Member Identification Rule',
    nature: 'This identifier is shared across multiple distinct employee or dependent entries.',
    impact: 'REVIEW REQUIRED: Prevents policy collision and incorrect member overwrites.',
    recommendedAction: 'Verify employee personnel numbers with employer payroll and assign distinct unique IDs.',
    targetField: 'employee_id',
  },
  duplicate_record: {
    title: 'Exact Duplicate Row Ingestion',
    ruleCode: 'RULE-DUP-01',
    ruleName: 'Census Deduplication & Rate Protection',
    nature: 'Identical record (same ID, name, relationship, and birth date) submitted multiple times.',
    impact: 'FATAL: Would artificially inflate group headcount and double-charge corporate premiums.',
    recommendedAction: 'Deduplicate or delete redundant row from the census submission.',
    targetField: 'all',
  },
  missing_name: {
    title: 'Missing Member Full Legal Name',
    ruleCode: 'RULE-NAME-01',
    ruleName: 'Legal Member Identification Standard',
    nature: 'Full legal name is blank or consists only of whitespace characters.',
    impact: 'FATAL: UAE health insurance authorities (DHA/DOH) mandate full legal names for network card issuance.',
    recommendedAction: 'Obtain full legal name from passport or government identity document.',
    targetField: 'name',
  },
  missing_dob: {
    title: 'Missing Date of Birth',
    ruleCode: 'RULE-DOB-01',
    ruleName: 'Actuarial Rating Factor Requirement',
    nature: 'Date of birth field is empty or contains "null".',
    impact: 'FATAL: Actuarial age calculation is impossible; community rating age bands cannot be assigned.',
    recommendedAction: 'Provide verified date of birth in ISO format (YYYY-MM-DD).',
    targetField: 'date_of_birth',
  },
  invalid_date: {
    title: 'Invalid Date of Birth Format',
    ruleCode: 'RULE-DOB-02',
    ruleName: 'Calendar & RFC-3339 Compliance',
    nature: 'Value cannot be parsed as a valid calendar date (e.g. non-existent date like 31/02 or unformatted text).',
    impact: 'FATAL: Rejects unparsed date strings from ingestion into actuarial calculation engines.',
    recommendedAction: 'Reformat date into YYYY-MM-DD or DD/MM/YYYY.',
    targetField: 'date_of_birth',
  },
  future_dob: {
    title: 'Future Date of Birth Anomaly',
    ruleCode: 'RULE-DOB-03',
    ruleName: 'Historical Chronology Rule',
    nature: 'Birth date is in the future relative to the census processing date.',
    impact: 'FATAL: Results in negative age; indicative of century typo or placeholder placeholder date.',
    recommendedAction: 'Correct birth year to member actual historical birth year.',
    targetField: 'date_of_birth',
  },
  implausible_age: {
    title: 'Implausible Actuarial Age',
    ruleCode: 'RULE-AGE-01',
    ruleName: 'Biological Age Boundary Threshold (0–110 years)',
    nature: 'Computed age exceeds 110 years (e.g. 1892) or is below zero.',
    impact: 'REVIEW REQUIRED: Outlier age triggers manual verification to prevent erroneous high-risk surcharge rating.',
    recommendedAction: 'Verify passport or national ID birth year with the employer.',
    targetField: 'age',
  },
  unknown_relationship: {
    title: 'Non-Standard Relationship Category',
    ruleCode: 'RULE-REL-01',
    ruleName: 'Standard Insurance Classification Tier',
    nature: 'Relationship value does not correspond to employee, spouse, child, or other.',
    impact: 'REVIEW REQUIRED: Non-standard dependent categories require classification to determine base rate tier.',
    recommendedAction: 'Re-classify member relationship into employee, spouse, child, or other dependent.',
    targetField: 'relationship',
  },
  missing_required_fields: {
    title: 'Multiple Critical Fields Missing',
    ruleCode: 'RULE-GEN-01',
    ruleName: 'Minimum Viable Record Standard',
    nature: 'Record lacks multiple mandatory demographic fields.',
    impact: 'FATAL: Record cannot be processed through straight-through underwriting.',
    recommendedAction: 'Request complete census row resubmission from the broker.',
    targetField: 'all',
  },
};

export const ValidationResultsSection: React.FC<ValidationResultsSectionProps> = ({
  records,
  summary,
  setActiveTab,
  onSelectRecordForReview,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ValidationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedErrorType, setSelectedErrorType] = useState<string>('all');

  // Interactive Highlighting State
  const [highlightedRowId, setHighlightedRowId] = useState<number | null>(null);
  const [highlightedField, setHighlightedField] = useState<ProblemField | null>(null);
  const [activeIssueMeta, setActiveIssueMeta] = useState<ErrorMetadata | null>(null);

  // Tooltip Hover State
  const [activeTooltip, setActiveTooltip] = useState<{
    text: string;
    title?: string;
    ruleCode?: string;
    impact?: string;
    remedy?: string;
    x: number;
    y: number;
  } | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
      if (selectedErrorType !== 'all') {
        if (!rec.error_types.includes(selectedErrorType as any)) return false;
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const empId = rec.record.employee_id.toLowerCase();
        const name = rec.record.name.toLowerCase();
        const errors = rec.errors.join(' ').toLowerCase();
        return empId.includes(term) || name.includes(term) || errors.includes(term);
      }
      return true;
    });
  }, [records, statusFilter, selectedErrorType, searchTerm]);

  // Determine which field corresponds to an error text
  const detectFieldFromErrorText = (errorText: string): ProblemField => {
    const lower = errorText.toLowerCase();
    if (lower.includes('identifier') || lower.includes('employee id') || lower.includes('duplicate employee')) {
      return 'employee_id';
    }
    if (lower.includes('name')) return 'name';
    if (lower.includes('relationship')) return 'relationship';
    if (lower.includes('date of birth') || lower.includes('birth date') || lower.includes('future')) {
      return 'date_of_birth';
    }
    if (lower.includes('age')) return 'age';
    return 'all';
  };

  // Find metadata for an error string or type
  const getMetadataForError = (errorText: string, errorTypes: ValidationErrorType[]): ErrorMetadata => {
    for (const type of errorTypes) {
      if (ERROR_METADATA_REGISTRY[type]) {
        return ERROR_METADATA_REGISTRY[type];
      }
    }
    const lower = errorText.toLowerCase();
    if (lower.includes('identifier')) return ERROR_METADATA_REGISTRY['missing_identifier'];
    if (lower.includes('duplicate')) return ERROR_METADATA_REGISTRY['duplicate_identifier'];
    if (lower.includes('name')) return ERROR_METADATA_REGISTRY['missing_name'];
    if (lower.includes('future')) return ERROR_METADATA_REGISTRY['future_dob'];
    if (lower.includes('date')) return ERROR_METADATA_REGISTRY['invalid_date'];
    if (lower.includes('age')) return ERROR_METADATA_REGISTRY['implausible_age'];
    if (lower.includes('relationship')) return ERROR_METADATA_REGISTRY['unknown_relationship'];

    return {
      title: 'Validation Finding',
      ruleCode: 'RULE-CHECK-GEN',
      ruleName: 'SME Census Quality Criterion',
      nature: errorText,
      impact: 'Record requires underwriter review before illustrative quoting.',
      recommendedAction: 'Verify official member documentation with employer HR.',
      targetField: detectFieldFromErrorText(errorText),
    };
  };

  // Handle clicking on an error badge or row
  const handleSelectError = (
    rowId: number,
    field: ProblemField,
    errorText: string,
    errorTypes: ValidationErrorType[]
  ) => {
    const meta = getMetadataForError(errorText, errorTypes);
    setHighlightedRowId(rowId);
    setHighlightedField(field);
    setActiveIssueMeta(meta);

    // Scroll row into view smoothly within the table container
    const targetElement = document.getElementById(`census-row-${rowId}`);
    if (targetElement && tableContainerRef.current) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const clearHighlight = () => {
    setHighlightedRowId(null);
    setHighlightedField(null);
    setActiveIssueMeta(null);
  };

  if (!summary || records.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
        <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Census Data Validated</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please upload an employee census CSV or load one of the pre-configured synthetic datasets
          in Step 2 to generate automated validation results.
        </p>
        <button
          onClick={() => setActiveTab('upload')}
          className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer"
        >
          Go to Census Upload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Step 3: Deterministic Data Validation</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Interactive Cell Diagnostics
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any validation error or row below to pinpoint the exact problematic cell with
              interactive diagnostic tooltips.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>
              Validation Time: <strong>{summary.validation_duration_ms} ms</strong>
            </span>
          </div>
        </div>

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Total Ingested</span>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">
              {summary.total_records}
            </div>
            <span className="text-[10px] text-slate-400">100% processed</span>
          </div>

          <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-center">
            <span className="text-[11px] text-emerald-800 font-medium">Valid & Ready</span>
            <div className="text-xl font-extrabold text-emerald-700 mt-0.5">
              {summary.valid_records}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              {Math.round((summary.valid_records / summary.total_records) * 100)}% clean
            </span>
          </div>

          <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-center">
            <span className="text-[11px] text-amber-800 font-medium">Review Required</span>
            <div className="text-xl font-extrabold text-amber-700 mt-0.5">
              {summary.review_required_records}
            </div>
            <span className="text-[10px] text-amber-600">Pending review</span>
          </div>

          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200 text-center">
            <span className="text-[11px] text-rose-800 font-medium">Fatal Invalid</span>
            <div className="text-xl font-extrabold text-rose-700 mt-0.5">
              {summary.invalid_records}
            </div>
            <span className="text-[10px] text-rose-600">Missing/bad fields</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Duplicates Flagged</span>
            <div className="text-xl font-extrabold text-slate-700 mt-0.5">
              {summary.duplicate_records}
            </div>
            <span className="text-[10px] text-slate-400">ID / Row dupes</span>
          </div>

          <div className="p-3 bg-teal-50/80 rounded-lg border border-teal-200 text-center">
            <span className="text-[11px] text-teal-800 font-medium">Quote Eligible</span>
            <div className="text-xl font-extrabold text-teal-700 mt-0.5">
              {summary.eligible_for_quote}
            </div>
            <span className="text-[10px] text-teal-600 font-semibold">Auto-rated</span>
          </div>
        </div>

        {/* Error Breakdown Filter Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Filter By Error Category:</span>
            <span className="text-[11px] text-slate-400">
              Click an error type to isolate records in queue
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              onClick={() => {
                setSelectedErrorType('all');
                clearHighlight();
              }}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                selectedErrorType === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Types ({records.length})
            </button>
            {Object.entries(summary.error_breakdown).map(([errType, count]) => {
              if (count === 0) return null;
              const isSelected = selectedErrorType === errType;
              const formattedName = errType.replace(/_/g, ' ');

              return (
                <button
                  key={errType}
                  onClick={() => {
                    const nextVal = isSelected ? 'all' : errType;
                    setSelectedErrorType(nextVal);
                    // Automatically highlight first record of this error type
                    if (nextVal !== 'all') {
                      const firstMatch = records.find((r) =>
                        r.error_types.includes(nextVal as ValidationErrorType)
                      );
                      if (firstMatch) {
                        const meta = ERROR_METADATA_REGISTRY[nextVal] || getMetadataForError(firstMatch.errors[0] || '', firstMatch.error_types);
                        handleSelectError(
                          firstMatch.row_id,
                          meta.targetField,
                          firstMatch.errors[0] || '',
                          firstMatch.error_types
                        );
                      }
                    } else {
                      clearHighlight();
                    }
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-rose-700 text-white font-semibold'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span>{formattedName}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white/20' : 'bg-rose-200 text-rose-900'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Active Issue Inspector Bar */}
      {activeIssueMeta && highlightedRowId && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-4 shadow-md border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {activeIssueMeta.ruleCode}
              </span>
              <span className="text-xs font-bold text-teal-300">
                Active Diagnostic: Row #{highlightedRowId}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-white">
                Target Column: <span className="uppercase text-amber-300 font-mono">[{highlightedField}]</span>
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">{activeIssueMeta.title}</h4>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              <strong>Nature:</strong> {activeIssueMeta.nature} <br />
              <strong>Underwriting Impact:</strong> {activeIssueMeta.impact}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const targetRecord = records.find((r) => r.row_id === highlightedRowId);
                if (targetRecord) {
                  onSelectRecordForReview(targetRecord);
                  setActiveTab('exceptions');
                }
              }}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Fix in Exception Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={clearHighlight}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              title="Clear Highlight"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'valid', 'review_required', 'invalid'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by ID, name, or error..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-500"
          />
        </div>
      </div>

      {/* Interactive Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div ref={tableContainerRef} className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-12 text-center">Row</th>
                <th className="py-2.5 px-3 font-semibold">Employee ID</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Relationship</th>
                <th className="py-2.5 px-3 font-semibold">Date of Birth</th>
                <th className="py-2.5 px-3 font-semibold">Age</th>
                <th className="py-2.5 px-3 font-semibold text-center">Validation Status</th>
                <th className="py-2.5 px-3 font-semibold">Detected Issues & Action (Click to Highlight Cell)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No census records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const r = item.record;
                  const isRowHighlighted = highlightedRowId === item.row_id;

                  // Determine problematic cells for this specific record
                  const isIdProblem =
                    item.error_types.includes('missing_identifier') ||
                    item.error_types.includes('duplicate_identifier');

                  const isNameProblem = item.error_types.includes('missing_name');

                  const isRelProblem = item.error_types.includes('unknown_relationship');

                  const isDobProblem =
                    item.error_types.includes('missing_dob') ||
                    item.error_types.includes('invalid_date') ||
                    item.error_types.includes('future_dob');

                  const isAgeProblem =
                    item.error_types.includes('implausible_age') ||
                    item.warnings.some((w) => w.toLowerCase().includes('age'));

                  const isAllProblem = item.error_types.includes('duplicate_record');

                  // Cell highlight styles
                  const getCellHighlightClass = (field: ProblemField, isProblem: boolean) => {
                    const isActiveTarget =
                      isRowHighlighted && (highlightedField === field || highlightedField === 'all');

                    if (isActiveTarget) {
                      return 'ring-2 ring-rose-500 bg-rose-100/90 font-bold text-rose-950 transition-all rounded';
                    }
                    if (isProblem || (isAllProblem && isRowHighlighted)) {
                      return 'bg-rose-50/80 text-rose-900 border border-rose-200/80 rounded';
                    }
                    return '';
                  };

                  return (
                    <tr
                      id={`census-row-${item.row_id}`}
                      key={item.row_id}
                      onClick={() => {
                        if (item.errors.length > 0) {
                          const targetField = detectFieldFromErrorText(item.errors[0]);
                          handleSelectError(item.row_id, targetField, item.errors[0], item.error_types);
                        } else {
                          setHighlightedRowId(item.row_id);
                          setHighlightedField(null);
                          setActiveIssueMeta(null);
                        }
                      }}
                      className={`transition-colors cursor-pointer ${
                        isRowHighlighted
                          ? 'bg-amber-50/70 border-l-4 border-l-amber-500 ring-1 ring-amber-400/50'
                          : item.status === 'invalid'
                          ? 'bg-rose-50/15 hover:bg-rose-50/30'
                          : item.status === 'review_required'
                          ? 'bg-amber-50/15 hover:bg-amber-50/30'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Row Reference */}
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {item.row_id}
                      </td>

                      {/* Employee ID Cell */}
                      <td className={`py-2.5 px-3 font-mono font-medium ${getCellHighlightClass('employee_id', isIdProblem)}`}>
                        <div
                          className="flex items-center gap-1 group relative"
                          title={
                            isIdProblem
                              ? 'Identifier Issue: Member ID is missing or duplicate. Click to inspect rule.'
                              : undefined
                          }
                        >
                          <span>{r.employee_id || <span className="text-rose-600 font-bold italic">[Missing ID]</span>}</span>
                          {isIdProblem && (
                            <span className="p-0.5 rounded bg-rose-200 text-rose-800 text-[10px]" title="ID error">
                              !
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Name Cell */}
                      <td className={`py-2.5 px-3 font-medium text-slate-800 ${getCellHighlightClass('name', isNameProblem)}`}>
                        <div className="flex items-center gap-1">
                          <span>{r.name || <span className="text-rose-600 font-bold italic">[Missing Name]</span>}</span>
                          {isNameProblem && (
                            <span className="p-0.5 rounded bg-rose-200 text-rose-800 text-[10px]" title="Name error">
                              !
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Relationship Cell */}
                      <td className={`py-2.5 px-3 ${getCellHighlightClass('relationship', isRelProblem)}`}>
                        <div className="flex items-center gap-1">
                          <span
                            className={`capitalize px-2 py-0.5 rounded text-[11px] font-medium ${
                              isRelProblem
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {r.relationship}
                          </span>
                          {isRelProblem && (
                            <span className="p-0.5 rounded bg-amber-200 text-amber-800 text-[10px]" title="Relationship issue">
                              !
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date of Birth Cell */}
                      <td className={`py-2.5 px-3 font-mono text-slate-600 ${getCellHighlightClass('date_of_birth', isDobProblem)}`}>
                        <div className="flex items-center gap-1">
                          <span>
                            {r.date_of_birth || <span className="text-rose-600 font-bold italic">[Missing DOB]</span>}
                          </span>
                          {isDobProblem && (
                            <span className="p-0.5 rounded bg-rose-200 text-rose-800 text-[10px]" title="Date of Birth error">
                              !
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Age Cell */}
                      <td className={`py-2.5 px-3 font-mono text-slate-600 ${getCellHighlightClass('age', isAgeProblem)}`}>
                        <div className="flex items-center gap-1">
                          <span>{r.age !== null ? `${r.age} yrs` : '—'}</span>
                          {isAgeProblem && (
                            <span className="p-0.5 rounded bg-amber-200 text-amber-800 text-[10px]" title="Age advisory flag">
                              !
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Validation Status Badge */}
                      <td className="py-2.5 px-3 text-center">
                        {item.status === 'valid' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Valid
                          </span>
                        )}
                        {item.status === 'review_required' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" /> Review
                          </span>
                        )}
                        {item.status === 'invalid' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                            <XCircle className="w-3 h-3" /> Invalid
                          </span>
                        )}
                      </td>

                      {/* Detected Issues & Interactive Pills */}
                      <td className="py-2.5 px-3 max-w-sm">
                        {item.errors.length > 0 ? (
                          <div className="space-y-1">
                            {item.errors.map((err, i) => {
                              const targetField = detectFieldFromErrorText(err);
                              const isThisPillActive =
                                isRowHighlighted && highlightedField === targetField;
                              const meta = getMetadataForError(err, item.error_types);

                              return (
                                <button
                                  key={i}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectError(item.row_id, targetField, err, item.error_types);
                                  }}
                                  className={`text-[11px] text-left block w-full px-2 py-1 rounded transition-all cursor-pointer ${
                                    isThisPillActive
                                      ? 'bg-rose-600 text-white font-bold shadow-xs'
                                      : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/70'
                                  }`}
                                  title={`Click to highlight cell [${targetField}] and view full diagnostic explanation`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span>• {err}</span>
                                    <span className="text-[10px] font-mono opacity-80 underline">
                                      [{targetField}]
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                            <div className="text-[10px] text-slate-500 italic mt-0.5 pl-1">
                              Action: {item.recommended_action}
                            </div>
                          </div>
                        ) : item.warnings.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.warnings.map((w, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectError(item.row_id, 'age', w, item.error_types);
                                }}
                                className="text-[11px] text-left block w-full px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer"
                                title="Click to highlight cell and view advisory explanation"
                              >
                                • {w}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Verified · Eligible for quote rating</span>
                          </span>
                        )}
                      </td>

                      {/* Review Action */}
                      <td className="py-2.5 px-3 text-right">
                        {item.status !== 'valid' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRecordForReview(item);
                              setActiveTab('exceptions');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded transition-colors cursor-pointer"
                          >
                            Resolve Issue
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectRecordForReview(item);
                              setActiveTab('exceptions');
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
        <div className="text-xs text-slate-600">
          Showing <strong>{filteredRecords.length}</strong> of{' '}
          <strong>{records.length}</strong> validated records.{' '}
          {highlightedRowId && (
            <span className="text-amber-800 font-semibold ml-2">
              Row #{highlightedRowId} highlighted.
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {highlightedRowId && (
            <button
              onClick={clearHighlight}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              Clear Highlight
            </button>
          )}
          <button
            onClick={() => setActiveTab('exceptions')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Open Exception Review Queue ({summary.review_required_records + summary.invalid_records})</span>
          </button>
          <button
            onClick={() => setActiveTab('quote_config')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Proceed to Quoting ({summary.eligible_for_quote} Eligible)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
