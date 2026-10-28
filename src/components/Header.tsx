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
} from 'lucide-react';

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
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  exceptionCount,
  totalRecordsCount,
  onOpenBenchmark,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: '1. Overview', icon: <Layers className="w-4 h-4" /> },
    {
      id: 'upload',
      label: '2. Census Upload',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      badge: totalRecordsCount > 0 ? totalRecordsCount : undefined,
    },
    { id: 'validation', label: '3. Data Validation', icon: <CheckCircle2 className="w-4 h-4" /> },
    {
      id: 'exceptions',
      label: '4. Exception Review',
      icon: <AlertOctagon className="w-4 h-4" />,
      badge: exceptionCount > 0 ? exceptionCount : undefined,
    },
    { id: 'quote_config', label: '5. Quote Config', icon: <Calculator className="w-4 h-4" /> },
    { id: 'quote_comparison', label: '6. Quote Comparison', icon: <Layers className="w-4 h-4" /> },
    { id: 'history', label: '7. Quote History', icon: <History className="w-4 h-4" /> },
    { id: 'reports', label: '8. Reports & Exports', icon: <Download className="w-4 h-4" /> },
    { id: 'architecture', label: '9. Integration Roadmap', icon: <Network className="w-4 h-4" /> },
    { id: 'compliance', label: '10. UAE Compliance', icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-teal-600 to-sky-500 flex items-center justify-center shadow-md">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">CensusQuote AI</h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded">
                  Prototype
                </span>
                <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Cigna Challenge Demo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                SME Census-to-Quote Automation | Concept Prototype
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenBenchmark}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-500/30 rounded shadow-sm transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>Run Speed Benchmark</span>
            </button>
            <div className="hidden md:flex flex-col text-right text-xs text-slate-400">
              <span className="text-slate-200 font-medium">Session In-Memory Mode</span>
              <span>Synthetic records only</span>
            </div>
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
