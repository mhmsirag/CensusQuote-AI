import React from 'react';
import { History, Eye, ArrowRight, Clock, FileText } from 'lucide-react';
import { QuoteResult } from '../types/census';
import { ActiveTab } from './Header';

interface QuoteHistorySectionProps {
  quoteHistory: QuoteResult[];
  onSelectHistoricalQuote: (quote: QuoteResult) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const QuoteHistorySection: React.FC<QuoteHistorySectionProps> = ({
  quoteHistory,
  onSelectHistoricalQuote,
  setActiveTab,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 7: Session Quote Version History</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit log of all illustrative quotes generated during this evaluation session.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
            {quoteHistory.length} Version(s) Recorded
          </span>
        </div>

        {quoteHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Historical Quotes Yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Whenever you change quote configuration or resolve census exceptions, a versioned
              demonstration quote is saved here.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Quote Reference</th>
                  <th className="py-2.5 px-3">Version</th>
                  <th className="py-2.5 px-3">Generated At</th>
                  <th className="py-2.5 px-3">Selected Plan Tier</th>
                  <th className="py-2.5 px-3">Co-Pay</th>
                  <th className="py-2.5 px-3">Add-ons</th>
                  <th className="py-2.5 px-3 text-center">Rated</th>
                  <th className="py-2.5 px-3 text-center">Excluded</th>
                  <th className="py-2.5 px-3 text-right font-bold">Annual Total</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quoteHistory.map((q) => (
                  <tr key={`${q.quote_reference}-${q.quote_version}`} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {q.quote_reference}
                    </td>
                    <td className="py-2.5 px-3 font-mono">v{q.quote_version}.0</td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 capitalize font-semibold text-slate-800">
                      {q.config.plan_tier}
                    </td>
                    <td className="py-2.5 px-3">{q.config.copay_option}%</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {q.config.include_maternity ? 'Maternity (+AED 250)' : 'No Maternity'}
                      {!q.config.include_dependants && ' · Emp Only'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                      {q.rated_count}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-rose-600">
                      {q.excluded_count}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      AED {q.total_annual_amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          onSelectHistoricalQuote(q);
                          setActiveTab('quote_comparison');
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded transition-colors cursor-pointer"
                      >
                        Inspect Quote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
