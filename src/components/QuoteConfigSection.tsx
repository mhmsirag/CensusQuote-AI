import React from 'react';
import {
  Calculator,
  Shield,
  Percent,
  Baby,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  QuoteConfig,
  PlanTier,
  CopayOption,
  ValidatedRecord,
} from '../types/census';
import {
  BASE_RATES,
  PLAN_MULTIPLIERS,
  COPAY_MULTIPLIERS,
  MATERNITY_ADDON_PER_EMPLOYEE,
} from '../services/pricingEngine';
import { ActiveTab } from './Header';

interface QuoteConfigSectionProps {
  config: QuoteConfig;
  onConfigChange: (newConfig: QuoteConfig) => void;
  validatedRecords: ValidatedRecord[];
  setActiveTab: (tab: ActiveTab) => void;
}

export const QuoteConfigSection: React.FC<QuoteConfigSectionProps> = ({
  config,
  onConfigChange,
  validatedRecords,
  setActiveTab,
}) => {
  const eligibleRecords = validatedRecords.filter((r) => r.status === 'valid');
  const employeeCount = eligibleRecords.filter((r) => r.record.relationship === 'employee').length;
  const dependantCount = eligibleRecords.filter((r) => r.record.relationship !== 'employee').length;

  const currentPlanMult = PLAN_MULTIPLIERS[config.plan_tier];
  const currentCopayMult = COPAY_MULTIPLIERS[config.copay_option];

  // Quick illustrative estimate
  const estEmployeeRate =
    (BASE_RATES.employee + (config.include_maternity ? MATERNITY_ADDON_PER_EMPLOYEE : 0)) *
    currentPlanMult *
    currentCopayMult;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Step 5: Quote Configuration Parameters</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select plan tiers, co-pay levels, and coverage add-ons. Recalculates instantly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-teal-50 text-teal-800 border border-teal-200">
              {eligibleRecords.length} Records Eligible for Rating
            </span>
          </div>
        </div>

        {/* Persistent Truth Label */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Mandatory Notice:</strong> Illustrative demonstration amounts — not an insurer quote.
            All rate calculations use deterministic test multipliers solely to demonstrate software
            automation.
          </span>
        </div>

        {/* 1. Plan Tier Selection */}
        <div className="mt-6">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            1. Select Demonstration Plan Tier (Annual Multiplier)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: 'essential' as PlanTier,
                title: 'Essential Tier',
                mult: '1.00x',
                badge: 'Baseline Coverage',
                desc: 'Standard local network coverage for SME staff.',
                color: 'slate',
              },
              {
                id: 'enhanced' as PlanTier,
                title: 'Enhanced Tier',
                mult: '1.25x',
                badge: 'Popular SME Choice',
                desc: 'Comprehensive clinic & hospital network across UAE.',
                color: 'teal',
              },
              {
                id: 'premium' as PlanTier,
                title: 'Premium Tier',
                mult: '1.55x',
                badge: 'Executive & Regional',
                desc: 'Top-tier regional coverage with high benefit caps.',
                color: 'indigo',
              },
            ].map((p) => {
              const isSelected = config.plan_tier === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onConfigChange({ ...config, plan_tier: p.id })}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.title}</span>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {p.mult}
                    </span>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500">
                    {p.badge}
                  </span>
                  <p className="text-[11px] text-slate-600 mt-2">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Co-Pay Level Selection */}
        <div className="mt-6">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            2. Member Co-Pay Option (Illustrative Cost Multiplier)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: '20' as CopayOption,
                label: '20% Member Co-Pay',
                mult: '0.95x',
                sub: '5% Premium Discount applied',
              },
              {
                id: '10' as CopayOption,
                label: '10% Member Co-Pay',
                mult: '1.00x',
                sub: 'Standard Baseline (1.00x)',
              },
              {
                id: '0' as CopayOption,
                label: '0% Co-Pay (Nil Deductible)',
                mult: '1.12x',
                sub: '12% Surcharge for full coverage',
              },
            ].map((copay) => {
              const isSelected = config.copay_option === copay.id;
              return (
                <div
                  key={copay.id}
                  onClick={() => onConfigChange({ ...config, copay_option: copay.id })}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-500 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{copay.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {copay.mult}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{copay.sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Coverage Add-ons and Dependants Toggles */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Maternity Add-on */}
          <div
            onClick={() =>
              onConfigChange({ ...config, include_maternity: !config.include_maternity })
            }
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              config.include_maternity
                ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                config.include_maternity ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Baby className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Maternity Benefit Add-on</span>
                <span className="text-xs font-mono font-bold text-teal-700">+AED 250 / emp</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Adds flat AED 250 to primary employee base amount before plan/copay multipliers.
              </p>
              <span
                className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  config.include_maternity
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {config.include_maternity ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Include Dependants Toggle */}
          <div
            onClick={() =>
              onConfigChange({ ...config, include_dependants: !config.include_dependants })
            }
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
              config.include_dependants
                ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                : 'border-slate-200 bg-slate-50/50'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                config.include_dependants ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Include Dependants</span>
                <span className="text-xs font-semibold text-slate-600">
                  {dependantCount} Dependants
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                When enabled, spouses (AED 1,000), children (AED 600), and others (AED 900) are rated.
              </p>
              <span
                className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  config.include_dependants
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {config.include_dependants ? 'All Members Rated' : 'Employee-Only Coverage'}
              </span>
            </div>
          </div>
        </div>

        {/* Mathematical Formula Walkthrough */}
        <div className="mt-6 p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-teal-400 font-bold uppercase tracking-wider text-[11px]">
            <span>Deterministic Pricing Logic:</span>
            <span>AED (United Arab Emirates Dirham)</span>
          </div>
          <div className="font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-teal-300 text-xs">
            Annual Amount = (Base Amount + Maternity Addon) × Plan Multiplier ({currentPlanMult.toFixed(2)}) × Co-pay Multiplier ({currentCopayMult.toFixed(2)})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-300">
            <div>• Employee Base: AED 1,200.00</div>
            <div>• Spouse Base: AED 1,000.00</div>
            <div>• Child Base: AED 600.00</div>
            <div>• Other Base: AED 900.00</div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Ready to generate illustrative quote for {eligibleRecords.length} valid records.
          </span>
          <button
            onClick={() => setActiveTab('quote_comparison')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Calculate & Compare Tiers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
