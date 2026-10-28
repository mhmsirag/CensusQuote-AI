import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Language, TRANSLATIONS } from '../services/i18n';

interface PersistentNoticeProps {
  lang: Language;
}

export const PersistentNotice: React.FC<PersistentNoticeProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="bg-amber-950/20 border-b border-amber-500/30 text-amber-900 px-4 py-2.5 text-xs sm:text-sm font-medium">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{t.prototypeNoticeTitle}</strong> {t.prototypeNoticeDesc}
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-teal-700 shrink-0 font-medium bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t.syntheticDataBadge}</span>
        </div>
      </div>
    </div>
  );
};
