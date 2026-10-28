import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ArrowRight,
  History,
  FileCheck,
  XCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';
import {
  ValidatedRecord,
  CensusRecord,
  AuditLogEntry,
  RelationshipType,
  ValidationErrorType,
} from '../types/census';
import { ActiveTab } from './Header';

interface ExceptionReviewSectionProps {
  records: ValidatedRecord[];
  auditLogs: AuditLogEntry[];
  selectedRecord: ValidatedRecord | null;
  onSelectRecord: (record: ValidatedRecord | null) => void;
  onApplyCorrection: (
    rowId: number,
    updatedFields: Partial<CensusRecord>,
    reviewerNotes: string
  ) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const ExceptionReviewSection: React.FC<ExceptionReviewSectionProps> = ({
  records,
  auditLogs,
  selectedRecord,
  onSelectRecord,
  onApplyCorrection,
  setActiveTab,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Edit Form State
  const [editEmployeeId, setEditEmployeeId] = useState('');
  const [editName, setEditName] = useState('');
  const [editRelationship, setEditRelationship] = useState<RelationshipType>('employee');
  const [editDob, setEditDob] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // When a record is selected, populate form
  React.useEffect(() => {
    if (selectedRecord) {
      const r = selectedRecord.record;
      setEditEmployeeId(r.employee_id || '');
      setEditName(r.name || '');
      setEditRelationship(r.relationship || 'employee');
      setEditDob(r.date_of_birth || '');
      setEditJobTitle(r.job_title || '');
      setEditDept(r.department || '');
      setEditNotes(selectedRecord.review_notes || '');
      setAiExplanation(null);
    }
  }, [selectedRecord]);

  // Exception-only records
  const exceptionRecords = useMemo(() => {
    return records.filter((r) => r.status !== 'valid' || r.is_reviewed);
  }, [records]);

  const filteredExceptions = useMemo(() => {
    return exceptionRecords.filter((item) => {
      if (filterType !== 'all') {
        if (!item.error_types.includes(filterType as ValidationErrorType)) return false;
      }
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const id = item.record.employee_id.toLowerCase();
        const name = item.record.name.toLowerCase();
        const err = item.errors.join(' ').toLowerCase();
        return id.includes(q) || name.includes(q) || err.includes(q);
      }
      return true;
    });
  }, [exceptionRecords, filterType, searchTerm]);

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    onApplyCorrection(
      selectedRecord.row_id,
      {
        employee_id: editEmployeeId.trim(),
        name: editName.trim(),
        relationship: editRelationship,
        date_of_birth: editDob.trim(),
        job_title: editJobTitle.trim() || undefined,
        department: editDept.trim() || undefined,
      },
      editNotes.trim()
    );
  };

  const requestAiExplanation = async () => {
    if (!selectedRecord) return;
    setIsAiLoading(true);
    setAiExplanation(null);

    try {
      const res = await fetch('/api/ai/explain-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          record: selectedRecord.record,
          errors: selectedRecord.errors,
          warnings: selectedRecord.warnings,
        }),
      });
      const data = await res.json();
      setAiExplanation(data.explanation || 'No explanation returned.');
    } catch (e: any) {
      setAiExplanation('AI Assistant offline. Please verify fields manually against official HR census records.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Step 4: Human Exception Review Queue</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                {exceptionRecords.length} Active Exceptions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Human-in-the-loop governance. Unresolved records never enter rating silently. Corrections
              are tracked in an immutable demo session audit log.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('quote_config')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Proceed to Quoting</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-700 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            {[
              { id: 'all', label: 'All Issues' },
              { id: 'missing_identifier', label: 'Missing ID' },
              { id: 'duplicate_identifier', label: 'Duplicate ID' },
              { id: 'missing_dob', label: 'Missing DOB' },
              { id: 'invalid_date', label: 'Invalid Date' },
              { id: 'future_dob', label: 'Future DOB' },
              { id: 'implausible_age', label: 'Implausible Age' },
              { id: 'unknown_relationship', label: 'Unknown Rel' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  filterType === f.id
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by ID or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Main Review Grid: Left Queue List, Right Side-by-Side Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Exceptions Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Exception Queue ({filteredExceptions.length})
              </h3>
              <span className="text-[11px] text-slate-400">Click item to edit</span>
            </div>

            <div className="space-y-2 mt-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredExceptions.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No Outstanding Exceptions</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    All records in this filter view have been validated or resolved.
                  </p>
                </div>
              ) : (
                filteredExceptions.map((item) => {
                  const isSelected = selectedRecord?.row_id === item.row_id;
                  const r = item.record;

                  return (
                    <div
                      key={item.row_id}
                      onClick={() => onSelectRecord(item)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-400 font-bold">#{item.row_id}</span>
                          <span className="font-mono font-bold text-slate-900">
                            {r.employee_id || '[MISSING ID]'}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'valid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'review_required'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="font-medium text-slate-800 mt-1">
                        {r.name || '[Unnamed Record]'} · <span className="capitalize">{r.relationship}</span>
                      </div>

                      <div className="mt-2 space-y-1">
                        {item.errors.map((err, i) => (
                          <div key={i} className="text-[11px] text-rose-700 font-medium">
                            • {err}
                          </div>
                        ))}
                      </div>

                      {item.is_reviewed && (
                        <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1 text-[10px] text-teal-700 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Inline correction recorded</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Demonstration Correction Workspace (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedRecord ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Exception Remediation Workspace
                    </h3>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      Row #{selectedRecord.row_id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Apply demonstration-only corrections to re-validate this record in real-time.
                  </p>
                </div>
                <button
                  onClick={requestAiExplanation}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAiLoading ? 'Analyzing...' : 'AI Issue Analysis'}</span>
                </button>
              </div>

              {/* AI Guidance Box */}
              {aiExplanation && (
                <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200 text-indigo-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Operations Guidance:</span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">{aiExplanation}</p>
                </div>
              )}

              {/* Validation Errors Box */}
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-rose-800 mb-1">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Validation Reason(s) Detected:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1">
                  {selectedRecord.errors.map((e, idx) => (
                    <li key={idx} className="font-medium text-rose-800">
                      {e}
                    </li>
                  ))}
                </ul>
                <div className="mt-2 text-[11px] text-slate-600 font-normal">
                  <strong>Recommended Action:</strong> {selectedRecord.recommended_action}
                </div>
              </div>

              {/* Original Raw Ingestion Snapshot */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Original Source Ingestion (Immutable Baseline):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 text-[10px]">Raw ID:</span>
                    <div className="font-mono">{selectedRecord.record.raw_data.employee_id || selectedRecord.record.raw_data.member_id || '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Raw Name:</span>
                    <div>{selectedRecord.record.raw_data.name || selectedRecord.record.raw_data.full_name || '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Raw Relationship:</span>
                    <div>{selectedRecord.record.raw_data.relationship || selectedRecord.record.raw_data.relation || '—'}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Raw DOB:</span>
                    <div className="font-mono">{selectedRecord.record.raw_data.date_of_birth || selectedRecord.record.raw_data.birth_date || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Interactive Correction Form */}
              <form onSubmit={handleSaveCorrection} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Demonstration Correction Entry:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Employee / Member ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editEmployeeId}
                      onChange={(e) => setEditEmployeeId(e.target.value)}
                      placeholder="e.g. EMP101"
                      required
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Johnathan Vance"
                      required
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Relationship Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editRelationship}
                      onChange={(e) => setEditRelationship(e.target.value as RelationshipType)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-500"
                    >
                      <option value="employee">Employee (Primary Subscriber)</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child (Dependent)</option>
                      <option value="other">Other Dependent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Date of Birth (YYYY-MM-DD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      placeholder="YYYY-MM-DD (e.g. 1988-05-14)"
                      required
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Job Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={editJobTitle}
                      onChange={(e) => setEditJobTitle(e.target.value)}
                      placeholder="e.g. Senior Architect"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department (Optional)
                    </label>
                    <input
                      type="text"
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reviewer Audit Notes / Reason for Adjustment
                  </label>
                  <input
                    type="text"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="e.g. Confirmed passport copy with HR; corrected typo in birth year."
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-teal-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Saves correction & immediately triggers deterministic re-validation.
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Apply & Revalidate Record</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No Record Selected</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select an exception from the queue on the left to inspect its validation reasons, view
                original data, and enter demonstration-only corrections.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Session Audit Trail Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Session Exception Audit Trail ({auditLogs.length} Entries)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Records all manual interventions during current demo session
          </span>
        </div>

        <div className="mt-3 overflow-x-auto max-h-48 overflow-y-auto">
          {auditLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 italic">
              No manual corrections have been applied in this session yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Row</th>
                  <th className="py-2 px-3">Employee ID</th>
                  <th className="py-2 px-3">Field Adjusted</th>
                  <th className="py-2 px-3">Previous Baseline</th>
                  <th className="py-2 px-3">Corrected Value</th>
                  <th className="py-2 px-3">Reviewer Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-3 text-slate-500">{log.timestamp.split('T')[1].slice(0, 8)}</td>
                    <td className="py-1.5 px-3 text-slate-500 font-bold">#{log.row_id}</td>
                    <td className="py-1.5 px-3 text-slate-800 font-bold">{log.employee_id}</td>
                    <td className="py-1.5 px-3 font-sans font-semibold text-slate-700">{log.field_changed}</td>
                    <td className="py-1.5 px-3 text-rose-600 line-through">{log.old_value || '[empty]'}</td>
                    <td className="py-1.5 px-3 text-emerald-600 font-bold">{log.new_value}</td>
                    <td className="py-1.5 px-3 font-sans text-slate-500">{log.reviewer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
