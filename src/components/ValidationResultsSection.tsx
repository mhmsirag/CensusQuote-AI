import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { ValidatedRecord, ValidationSummary, ValidationStatus } from '../types/census';
import { ActiveTab } from './Header';

interface ValidationResultsSectionProps {
  records: ValidatedRecord[];
  summary: ValidationSummary | null;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectRecordForReview: (record: ValidatedRecord) => void;
}

export const ValidationResultsSection: React.FC<ValidationResultsSectionProps> = ({
  records,
  summary,
  setActiveTab,
  onSelectRecordForReview,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | ValidationStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedErrorType, setSelectedErrorType] = useState<string>('all');

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // Status filter
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;

      // Error type filter
      if (selectedErrorType !== 'all') {
        if (!rec.error_types.includes(selectedErrorType as any)) return false;
      }

      // Search term
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
            <h2 className="text-lg font-bold text-slate-900">Step 3: Deterministic Data Validation</h2>
            <p className="text-xs text-slate-500">
              Evaluated against 10 strict enterprise rules. Explains validation criteria for every row.
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

        {/* Error Breakdown Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-700">Filter By Error Category:</span>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <button
              onClick={() => setSelectedErrorType('all')}
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
                  onClick={() => setSelectedErrorType(isSelected ? 'all' : errType)}
                  className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-rose-700 text-white'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {formattedName} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

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

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-12 text-center">Row</th>
                <th className="py-2.5 px-3 font-semibold">Employee ID</th>
                <th className="py-2.5 px-3 font-semibold">Name</th>
                <th className="py-2.5 px-3 font-semibold">Relationship</th>
                <th className="py-2.5 px-3 font-semibold">Date of Birth</th>
                <th className="py-2.5 px-3 font-semibold">Age</th>
                <th className="py-2.5 px-3 font-semibold text-center">Validation Status</th>
                <th className="py-2.5 px-3 font-semibold">Detected Issues & Action</th>
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
                  return (
                    <tr
                      key={item.row_id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        item.status === 'invalid'
                          ? 'bg-rose-50/20'
                          : item.status === 'review_required'
                          ? 'bg-amber-50/20'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">
                        {item.row_id}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900">
                        {r.employee_id || (
                          <span className="text-rose-500 italic">[Missing ID]</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {r.name || <span className="text-rose-500 italic">[Missing Name]</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {r.relationship}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {r.date_of_birth || (
                          <span className="text-rose-500 italic">[Missing DOB]</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {r.age !== null ? `${r.age} yrs` : '—'}
                      </td>
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
                      <td className="py-2.5 px-3 max-w-xs">
                        {item.errors.length > 0 ? (
                          <div className="space-y-0.5">
                            {item.errors.map((err, i) => (
                              <div
                                key={i}
                                className="text-[11px] text-rose-700 font-medium leading-tight"
                              >
                                • {err}
                              </div>
                            ))}
                            <div className="text-[10px] text-slate-500 italic mt-0.5">
                              Next: {item.recommended_action}
                            </div>
                          </div>
                        ) : item.warnings.length > 0 ? (
                          <div className="text-[11px] text-amber-700">
                            {item.warnings.map((w, i) => (
                              <div key={i}>• {w}</div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700">
                            Verified · Eligible for quote
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.status !== 'valid' ? (
                          <button
                            onClick={() => {
                              onSelectRecordForReview(item);
                              setActiveTab('exceptions');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded transition-colors cursor-pointer"
                          >
                            Resolve Issue
                          </button>
                        ) : (
                          <button
                            onClick={() => {
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
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="text-xs text-slate-600">
          Showing <strong>{filteredRecords.length}</strong> of{' '}
          <strong>{records.length}</strong> validated records.
        </div>
        <div className="flex items-center gap-3">
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
