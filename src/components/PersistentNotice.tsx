import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const PersistentNotice: React.FC = () => {
  return (
    <div className="bg-amber-950/20 border-b border-amber-500/30 text-amber-900 px-4 py-2.5 text-xs sm:text-sm font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Concept Prototype Notice:</strong> This demonstration uses synthetic data and
            illustrative pricing. It is not an official Cigna service or a real insurance quotation.
            All premium figures are illustrative demonstration amounts only.
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-teal-700 shrink-0 font-medium bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Synthetic Data Only</span>
        </div>
      </div>
    </div>
  );
};
