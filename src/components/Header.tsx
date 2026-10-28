import React from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertOctagon,
  Calculator,
  Layers,
  History,
  Download,
  Network,
  ShieldAlert,
  Zap,
  Globe,
  ShieldCheck,
  FileCheck2,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../services/i18n';

export type ActiveTab =
  | 'overview'
  | 'upload'
  | 'validation'
  | 'exceptions'
  | 'quote_config'
  | 'quote_comparison'
  | 'history'
  | 'reports'
  | 'architecture'
  | 'compliance';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  exceptionCount: number;
  totalRecordsCount: number;
  onOpenBenchmark: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenProveCalculation: () => void;
  onOpenEvidence: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  exceptionCount,
  totalRecordsCount,
  onOpenBenchmark,
  lang,
  setLang,
  onOpenProveCalculation,
  onOpenEvidence,
}) => {
  const t = TRANSLATIONS[lang];
  const isAr = lang === 'ar';

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: t.tabOverview, icon: <Layers className="w-4 h-4" /> },
    {
      id: 'upload',
      label: t.tabUpload,
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: totalRecordsCount > 0 ? totalRecordsCount : undefined,
    },
    { id: 'validation', label: t.tabValidation, icon: <CheckCircle2 className="w-4 h-4" /> },
    {
      id: 'exceptions',
      label: t.tabExceptions,
      icon: <AlertOctagon className="w-4 h-4" />,
      badge: exceptionCount > 0 ? exceptionCount : undefined,
    },
    { id: 'quote_config', label: t.tabQuoteConfig, icon: <Calculator className="w-4 h-4" /> },
    { id: 'quote_comparison', label: t.tabQuoteComparison, icon: <Layers className="w-4 h-4" /> },
    { id: 'history', label: t.tabHistory, icon: <History className="w-4 h-4" /> },
    { id: 'reports', label: t.tabReports, icon: <Download className="w-4 h-4" /> },
    { id: 'architecture', label: t.tabArchitecture, icon: <Network className="w-4 h-4" /> },
    { id: 'compliance', label: t.tabCompliance, icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-4 border-b border-slate-800/80 gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center shadow-md shrink-0">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">{t.appTitle}</h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded">
                  {isAr ? 'نموذج أولي' : 'Prototype'}
                </span>
                <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {t.cignaChallengeDemo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Top Actions: Language Switcher, Calculation Proof, Evidence, Benchmark */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors flex items-center gap-1 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to English"
              >
                <span>EN</span>
              </button>
              <button
                onClick={() => setLang('ar')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors flex items-center gap-1 cursor-pointer ${
                  lang === 'ar'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="التبديل إلى اللغة العربية"
              >
                <span>العربية</span>
              </button>
            </div>

            {/* Prove Calculation Action */}
            <button
              onClick={onOpenProveCalculation}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 rounded shadow-sm transition-colors cursor-pointer"
              title={isAr ? 'إثبات الحساب الرياضي ومراجعة التعرفة' : 'Prove the calculation against demo tariff'}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{isAr ? 'إثبات الحساب' : 'Prove Calculation'}</span>
            </button>

            {/* Verification Evidence Action */}
            <button
              onClick={onOpenEvidence}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/40 rounded shadow-sm transition-colors cursor-pointer"
              title={isAr ? 'أدلة التقييم وقائمة التحقق' : 'Verification evidence & checklist'}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">{isAr ? 'أدلة التقييم' : 'Verification Evidence'}</span>
            </button>

            {/* Benchmark Runner Action */}
            <button
              onClick={onOpenBenchmark}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded shadow-sm transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>{t.runBenchmarkBtn}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto py-2.5 no-scrollbar text-xs font-medium">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      tab.id === 'exceptions' && tab.badge > 0
                        ? 'bg-rose-500 text-white'
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
