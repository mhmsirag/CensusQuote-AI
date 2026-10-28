import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileCode,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
} from 'lucide-react';
import { ValidatedRecord, QuoteResult, ValidationSummary } from '../types/census';
import {
  exportCleanedCensusCSV,
  exportValidationReportCSV,
  exportQuoteLineItemsCSV,
  exportQuoteSummaryJSON,
  downloadFile,
} from '../services/exportService';

interface ReportsExportSectionProps {
  records: ValidatedRecord[];
  summary: ValidationSummary | null;
  activeQuote: QuoteResult | null;
  onOpenPrintModal: () => void;
}

export const ReportsExportSection: React.FC<ReportsExportSectionProps> = ({
  records,
  summary,
  activeQuote,
  onOpenPrintModal,
}) => {
  const [checklist, setChecklist] = useState<string | null>(null);
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadCleanCensus = () => {
    const csv = exportCleanedCensusCSV(records);
    downloadFile(csv, 'CensusQuote_Cleaned_Census.csv', 'text/csv');
  };

  const handleDownloadValidationReport = () => {
    const csv = exportValidationReportCSV(records);
    downloadFile(csv, 'CensusQuote_Validation_Exceptions_Report.csv', 'text/csv');
  };

  const handleDownloadLineItems = () => {
    if (!activeQuote) return;
    const csv = exportQuoteLineItemsCSV(activeQuote);
    downloadFile(csv, `CensusQuote_LineItems_${activeQuote.quote_reference}.csv`, 'text/csv');
  };

  const handleDownloadSummaryJSON = () => {
    if (!activeQuote) return;
    const json = exportQuoteSummaryJSON(activeQuote);
    downloadFile(json, `CensusQuote_Summary_${activeQuote.quote_reference}.json`, 'application/json');
  };

  const handleGenerateChecklist = async () => {
    setIsGeneratingChecklist(true);
    setChecklist(null);
    try {
      const res = await fetch('/api/ai/follow-up-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exceptions_summary: {
            total_records: summary?.total_records || 0,
            exceptions_count: (summary?.review_required_records || 0) + (summary?.invalid_records || 0),
            error_breakdown: summary?.error_breakdown || {},
          },
        }),
      });
      const data = await res.json();
      setChecklist(data.checklist || 'No checklist returned.');
    } catch (e: any) {
      setChecklist(
        '1. Request updated census sheet resolving duplicated employee IDs.\n2. Obtain verified date of birth for records with invalid or missing date formats.\n3. Clarify non-standard relationship definitions.\n4. Resubmit corrected batch for automated re-validation.'
      );
    } finally {
      setIsGeneratingChecklist(false);
    }
  };

  const copyChecklist = () => {
    if (!checklist) return;
    navigator.clipboard.writeText(checklist);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Step 8: Reports & Exports Package</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download certified audit packages in RFC-compliant CSV and structured JSON format.
          </p>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Export Truth & Safety Notice:</strong> All exported artifacts contain synthetic data
            only and include permanent banner disclaimers stating: “Illustrative demonstration amounts —
            not an insurer quote.”
          </span>
        </div>

        {/* 4 Download Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Export 1: Cleaned Census */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Cleaned Census CSV</h3>
              <p className="text-xs text-slate-600 mt-1">
                Standardized census file containing only verified, rating-eligible records with corrected
                fields and normalized headers.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                {records.filter((r) => r.status === 'valid').length} valid rows
              </span>
              <button
                onClick={handleDownloadCleanCensus}
                disabled={records.length === 0}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Clean CSV</span>
              </button>
            </div>
          </div>

          {/* Export 2: Validation & Exception Report */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Validation Exception Report CSV</h3>
              <p className="text-xs text-slate-600 mt-1">
                Comprehensive row-by-row audit breakdown detailing every error code, warning, and
                recommended remediation action.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                {records.length} evaluated rows
              </span>
              <button
                onClick={handleDownloadValidationReport}
                disabled={records.length === 0}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Exception Report</span>
              </button>
            </div>
          </div>

          {/* Export 3: Quote Line Items */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center text-sky-700 mb-2">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Quote Line-Items CSV</h3>
              <p className="text-xs text-slate-600 mt-1">
                Rated employee-by-employee itemization with base rates, maternity additions, multipliers,
                and monthly/annual totals.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                {activeQuote ? `${activeQuote.rated_count} rated items` : 'No active quote'}
              </span>
              <button
                onClick={handleDownloadLineItems}
                disabled={!activeQuote}
                className="px-3.5 py-1.5 bg-sky-700 hover:bg-sky-600 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Line Items</span>
              </button>
            </div>
          </div>

          {/* Export 4: Quote Summary Package JSON */}
          <div className="p-4 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50/50 transition-all flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 mb-2">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Structured Quote Summary JSON</h3>
              <p className="text-xs text-slate-600 mt-1">
                Machine-readable API-ready JSON bundle containing pricing configuration, subtotals,
                assumptions, and exclusions.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                JSON API Payload
              </span>
              <button
                onClick={handleDownloadSummaryJSON}
                disabled={!activeQuote}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download JSON Package</span>
              </button>
            </div>
          </div>
        </div>

        {/* Printable Quote Sheet Trigger */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold">Printable Executive Quotation Summary</h4>
            <p className="text-xs text-slate-300">
              Formatted print-ready layout suitable for browser PDF generation and broker presentations.
            </p>
          </div>
          <button
            onClick={onOpenPrintModal}
            disabled={!activeQuote}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Open Print / PDF Preview</span>
          </button>
        </div>
      </div>

      {/* AI Broker Follow-up Checklist Assistant */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              AI Broker Follow-Up Checklist Generator
            </h3>
          </div>
          <button
            onClick={handleGenerateChecklist}
            disabled={isGeneratingChecklist || records.length === 0}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
          >
            {isGeneratingChecklist ? 'Drafting Checklist...' : 'Generate Client Checklist'}
          </button>
        </div>

        {checklist ? (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Actionable Follow-up List for Client / Employer HR:
              </span>
              <button
                onClick={copyChecklist}
                className="text-xs text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
            <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-white p-3 rounded-lg border border-slate-200">
              {checklist}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-2">
            Click &ldquo;Generate Client Checklist&rdquo; to synthesize outstanding census exceptions into a
            structured communication email for the broker or employer HR team.
          </p>
        )}
      </div>
    </div>
  );
};
