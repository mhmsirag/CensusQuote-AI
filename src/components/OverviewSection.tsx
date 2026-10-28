import React from 'react';
import {
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  ShieldCheck,
  TrendingUp,
  FileText,
  UserCheck,
  Calculator,
} from 'lucide-react';
import { ValidationSummary, QuoteResult } from '../types/census';
import { ActiveTab } from './Header';

interface OverviewSectionProps {
  summary: ValidationSummary | null;
  activeQuote: QuoteResult | null;
  correctionsCount: number;
  setActiveTab: (tab: ActiveTab) => void;
  onLoadSample: (key: 'challenge_105' | 'clean_50' | 'exceptions_30') => void;
  onOpenBenchmark: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  summary,
  activeQuote,
  correctionsCount,
  setActiveTab,
  onLoadSample,
  onOpenBenchmark,
}) => {
  const steps = [
    { num: '01', title: 'Upload Census', desc: 'Ingest raw CSV with alias detection' },
    { num: '02', title: 'Normalize Fields', desc: 'Standardize names, IDs, DOB, roles' },
    { num: '03', title: 'Validate Records', desc: 'Deterministic 10-point rule checks' },
    { num: '04', title: 'Route Exceptions', desc: 'Human-in-the-loop review & edit' },
    { num: '05', title: 'Calculate Quote', desc: 'Deterministic illustrative rates' },
    { num: '06', title: 'Compare Tiers', desc: 'Side-by-side Essential vs Premium' },
    { num: '07', title: 'Export Package', desc: 'Clean CSV, exceptions, quote report' },
  ];

  const total = summary ? summary.total_records : 0;
  const valid = summary ? summary.valid_records : 0;
  const review = summary ? summary.review_required_records : 0;
  const invalid = summary ? summary.invalid_records : 0;
  const cleanRate = total > 0 ? Math.round((valid / total) * 100) : 0;
  const exceptionRate = total > 0 ? Math.round(((review + invalid) / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-xl p-6 sm:p-8 text-white shadow-md border border-slate-700/60">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Cigna “Quote in Seconds Challenge” Concept Prototype</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Automating SME Health Census-to-Quote at Scale
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Eliminates spreadsheet friction for brokers and employers. Ingests raw employee censuses,
            normalizes inconsistent fields, isolates validation exceptions for human review, and
            instantly generates illustrative premium breakdowns without risky manual re-keying.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onLoadSample('challenge_105')}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-md shadow transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Load 105-Member Challenge Dataset (Controlled Errors)</span>
            </button>
            <button
              onClick={() => onLoadSample('clean_50')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-medium text-xs rounded-md shadow-sm transition-colors cursor-pointer"
            >
              <span>Load 50 Clean Records</span>
            </button>
            <button
              onClick={onOpenBenchmark}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/40 font-medium text-xs rounded-md shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Run Live Speed Benchmark</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7-Step Workflow Visualization */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          End-to-End Automated Quoting Pipeline
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {steps.map((st, i) => (
            <div
              key={st.num}
              className="p-3.5 rounded-lg border border-slate-200/90 bg-slate-50/70 hover:bg-teal-50/50 hover:border-teal-300 transition-all text-left"
            >
              <span className="text-xs font-bold text-teal-600 font-mono">{st.num}</span>
              <h4 className="text-xs font-bold text-slate-900 mt-1">{st.title}</h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Measured Prototype Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Current Session Telemetry</h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded">
              Verified Measured Telemetry
            </span>
          </div>
          <span className="text-xs text-slate-500">Live in-memory state</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Total Census Records</span>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {total.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {total > 0 ? `${cleanRate}% automated clean rate` : 'No file loaded yet'}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Valid & Eligible Records</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700 mt-2">
              {valid.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Passed all 10 deterministic rules
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Flagged Exceptions</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-2">
              {(review + invalid).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {review} review required · {invalid} fatal invalid
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Inline Corrections Made</span>
              <UserCheck className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-extrabold text-teal-700 mt-2">
              {correctionsCount}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Recorded in session audit trail
            </div>
          </div>
        </div>

        {/* Timing Metrics Bar */}
        {summary && (
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>
                Validation Engine Runtime: <strong>{summary.validation_duration_ms} ms</strong>
              </span>
            </div>
            {activeQuote && (
              <div className="flex items-center gap-2 text-slate-700">
                <Calculator className="w-4 h-4 text-sky-600" />
                <span>
                  Pricing Engine Calculation: <strong>{activeQuote.calculation_duration_ms} ms</strong>
                </span>
              </div>
            )}
            <div className="text-slate-500 italic">
              All processing executed deterministically with local memory safety.
            </div>
          </div>
        )}
      </div>

      {/* Section 18 Mandatory Separation: Business Hypotheses for Future Pilots */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Proposed Business Hypotheses (Unverified Pilot Targets)
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded uppercase">
                Future Pilot Targets — Not Claims
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              In accordance with challenge safety protocols, the figures below represent operational
              hypotheses to be validated during a prospective Cigna SME pilot programme, rather than
              achieved historical results:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-lg font-bold text-slate-800">90%</span>
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5">Turnaround Time Reduction</p>
                <p className="text-[10px] text-slate-500">Target hypothesis: hours down to seconds</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-lg font-bold text-slate-800">90%+</span>
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5">Automated Clean Record Ingestion</p>
                <p className="text-[10px] text-slate-500">Target on standard SME broker census forms</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-lg font-bold text-slate-800">50%</span>
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5">Fewer Manual Underwriter Referrals</p>
                <p className="text-[10px] text-slate-500">By catching census ambiguities before rating</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-lg font-bold text-slate-800">+18%</span>
                <p className="text-[11px] font-semibold text-slate-700 mt-0.5">SME Quote Conversion Rate</p>
                <p className="text-[10px] text-slate-500">Through immediate comparison packages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
