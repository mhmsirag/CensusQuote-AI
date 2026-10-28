import React, { useState } from 'react';
import {
  Layers,
  Calculator,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { QuoteResult, QuoteConfig, PlanTier } from '../types/census';
import { ActiveTab } from './Header';

interface QuoteComparisonSectionProps {
  quote: QuoteResult | null;
  comparison: {
    essential: QuoteResult;
    enhanced: QuoteResult;
    premium: QuoteResult;
  } | null;
  onSelectTier: (tier: PlanTier) => void;
  onOpenPrintModal: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const QuoteComparisonSection: React.FC<QuoteComparisonSectionProps> = ({
  quote,
  comparison,
  onSelectTier,
  onOpenPrintModal,
  setActiveTab,
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'line_items' | 'excluded' | 'assumptions'>('line_items');
  const [searchLineItem, setSearchLineItem] = useState('');

  if (!quote || !comparison) {
    return (
      <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
        <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Quote Generated</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please upload and validate census records first, then configure your plan options to view
          the illustrative quote comparison.
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

  const filteredLineItems = quote.line_items.filter((item) => {
    if (!searchLineItem) return true;
    const q = searchLineItem.toLowerCase();
    return (
      item.employee_id.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.relationship.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Illustrative Demonstration Amounts — Not an Insurer Quote:</strong> This calculation
            is produced by an independent prototype to demonstrate SME quoting automation. It does
            not represent official Cigna pricing, underwriting approval, or a binding policy offer.
          </span>
        </div>
        <button
          onClick={onOpenPrintModal}
          className="shrink-0 px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/60 rounded text-amber-900 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF Summary</span>
        </button>
      </div>

      {/* Quote Summary Metadata Bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-teal-300">
                {quote.quote_reference}
              </span>
              <span className="text-xs text-slate-500">Version {quote.quote_version}.0</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">
                Created: {new Date(quote.created_at).toLocaleString()}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              SME Group Illustrative Quotation Package
            </h2>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <div className="text-xs text-slate-500">Selected Plan Total</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                AED {quote.total_annual_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-teal-700 font-semibold font-mono">
                AED {quote.total_monthly_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
              </div>
            </div>
          </div>
        </div>

        {/* 4 Summary Stat Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Rated Members:</span>
            <div className="text-sm font-bold text-slate-800">{quote.rated_count} individuals</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Excluded Members:</span>
            <div className="text-sm font-bold text-rose-700">{quote.excluded_count} individuals</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Co-Pay Level:</span>
            <div className="text-sm font-bold text-slate-800">{quote.config.copay_option}% Member Co-Pay</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px]">Maternity Add-on:</span>
            <div className="text-sm font-bold text-slate-800">
              {quote.config.include_maternity ? 'Included (+AED 250)' : 'Excluded'}
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Tier Comparison (Essential vs Enhanced vs Premium) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Side-by-Side SME Plan Comparison</h3>
            <p className="text-xs text-slate-500">
              Instant multi-tier pricing enables SME decision-makers to evaluate coverage levels instantly.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Currency: AED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              tier: 'essential' as PlanTier,
              title: 'Essential Tier',
              mult: '1.00x Base',
              data: comparison.essential,
              badge: 'Cost Optimized',
              border: 'border-slate-300',
              activeRing: 'ring-slate-700',
            },
            {
              tier: 'enhanced' as PlanTier,
              title: 'Enhanced Tier',
              mult: '1.25x Base',
              data: comparison.enhanced,
              badge: 'Recommended',
              border: 'border-teal-400',
              activeRing: 'ring-teal-600',
            },
            {
              tier: 'premium' as PlanTier,
              title: 'Premium Tier',
              mult: '1.55x Base',
              data: comparison.premium,
              badge: 'Comprehensive',
              border: 'border-indigo-300',
              activeRing: 'ring-indigo-600',
            },
          ].map((card) => {
            const isCurrent = quote.config.plan_tier === card.tier;
            const diffFromEssential =
              card.data.total_annual_amount - comparison.essential.total_annual_amount;

            return (
              <div
                key={card.tier}
                className={`bg-white rounded-xl p-5 border ${
                  isCurrent ? `${card.border} ring-2 ${card.activeRing} shadow-md` : 'border-slate-200'
                } flex flex-col justify-between transition-all`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{card.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCurrent
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {card.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">{card.mult}</div>

                  <div className="mt-4 pb-4 border-b border-slate-100">
                    <div className="text-2xl font-extrabold text-slate-900 font-mono">
                      AED {card.data.total_annual_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      AED {card.data.total_monthly_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
                    </div>
                    {card.tier !== 'essential' && (
                      <div className="text-[10px] text-teal-700 font-semibold mt-1">
                        +AED {diffFromEssential.toLocaleString(undefined, { minimumFractionDigits: 2 })} vs Essential
                      </div>
                    )}
                  </div>

                  {/* Subtotals breakdown by relationship */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Employees ({card.data.subtotals_by_relationship.employee.count}):</span>
                      <span className="font-mono font-medium">
                        AED {card.data.subtotals_by_relationship.employee.annual_subtotal.toFixed(2)}
                      </span>
                    </div>
                    {quote.config.include_dependants && (
                      <>
                        <div className="flex justify-between">
                          <span>Spouses ({card.data.subtotals_by_relationship.spouse.count}):</span>
                          <span className="font-mono font-medium">
                            AED {card.data.subtotals_by_relationship.spouse.annual_subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Children ({card.data.subtotals_by_relationship.child.count}):</span>
                          <span className="font-mono font-medium">
                            AED {card.data.subtotals_by_relationship.child.annual_subtotal.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => onSelectTier(card.tier)}
                    className={`w-full py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white cursor-default'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {isCurrent ? 'Active Selection' : `Select ${card.title}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs: Detailed Line Items | Excluded Records | Pricing Assumptions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 pt-4 flex items-center justify-between gap-4">
          <div className="flex space-x-4 text-xs font-bold">
            <button
              onClick={() => setActiveTabSub('line_items')}
              className={`pb-3 border-b-2 cursor-pointer ${
                activeTabSub === 'line_items'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Rated Line Items ({quote.line_items.length})
            </button>
            <button
              onClick={() => setActiveTabSub('excluded')}
              className={`pb-3 border-b-2 cursor-pointer ${
                activeTabSub === 'excluded'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Excluded Records ({quote.excluded_records.length})
            </button>
            <button
              onClick={() => setActiveTabSub('assumptions')}
              className={`pb-3 border-b-2 cursor-pointer ${
                activeTabSub === 'assumptions'
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Pricing Assumptions & Governance
            </button>
          </div>

          {activeTabSub === 'line_items' && (
            <input
              type="text"
              placeholder="Search rated members..."
              value={searchLineItem}
              onChange={(e) => setSearchLineItem(e.target.value)}
              className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-slate-800 mb-2 w-48"
            />
          )}
        </div>

        {/* Tab 1: Line Items Table */}
        {activeTabSub === 'line_items' && (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Member Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Age</th>
                  <th className="py-2.5 px-3 text-right">Base AED</th>
                  <th className="py-2.5 px-3 text-right">Maternity</th>
                  <th className="py-2.5 px-3 text-right">Plan Mult</th>
                  <th className="py-2.5 px-3 text-right">Co-Pay</th>
                  <th className="py-2.5 px-3 text-right font-bold">Annual (AED)</th>
                  <th className="py-2.5 px-3 text-right">Monthly (AED)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLineItems.map((item) => (
                  <tr key={item.row_id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-400">#{item.row_id}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{item.employee_id}</td>
                    <td className="py-2 px-3 font-sans text-slate-800">{item.name}</td>
                    <td className="py-2 px-3 font-sans capitalize">{item.relationship}</td>
                    <td className="py-2 px-3">{item.age !== null ? `${item.age}y` : '—'}</td>
                    <td className="py-2 px-3 text-right text-slate-600">{item.base_amount.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-slate-600">
                      {item.maternity_amount > 0 ? `+${item.maternity_amount.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600">{item.plan_multiplier.toFixed(2)}x</td>
                    <td className="py-2 px-3 text-right text-slate-600">{item.copay_multiplier.toFixed(2)}x</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      AED {item.calculated_annual_amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-teal-700">
                      AED {item.calculated_monthly_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Excluded Records */}
        {activeTabSub === 'excluded' && (
          <div className="p-4">
            {quote.excluded_records.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No records were excluded from this calculation.
              </div>
            ) : (
              <div className="space-y-2">
                {quote.excluded_records.map((exc, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-rose-50/40 border border-rose-200 text-xs flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          Row #{exc.row_id} · {exc.employee_id}
                        </span>
                        <span className="font-semibold text-slate-700">{exc.name}</span>
                        <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 text-[10px] text-slate-600">
                          {exc.relationship}
                        </span>
                      </div>
                      <div className="text-rose-700 font-medium mt-1">{exc.reason}</div>
                      {exc.error_details && exc.error_details.length > 0 && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Errors: {exc.error_details.join('; ')}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setActiveTab('exceptions')}
                      className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-white border border-rose-300 text-rose-800 rounded hover:bg-rose-100/50 cursor-pointer"
                    >
                      Fix in Review Queue
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Assumptions */}
        {activeTabSub === 'assumptions' && (
          <div className="p-6 space-y-4 text-xs text-slate-700">
            <div className="font-bold text-slate-900">Configured Pricing Assumptions:</div>
            <ul className="list-disc list-inside space-y-1.5">
              {quote.pricing_assumptions.map((asm, i) => (
                <li key={i}>{asm}</li>
              ))}
            </ul>

            {quote.human_review_warnings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Human Oversight Advisory Flags ({quote.human_review_warnings.length}):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {quote.human_review_warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
