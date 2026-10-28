/**
 * CensusQuote AI - Main Application Entrypoint
 * SME Census-to-Quote Automation | Concept Prototype
 * Cigna "The Quote in Seconds Challenge"
 */

import React, { useState, useEffect } from 'react';
import { PersistentNotice } from './components/PersistentNotice';
import { Header, ActiveTab } from './components/Header';
import { OverviewSection } from './components/OverviewSection';
import { CensusUploadSection } from './components/CensusUploadSection';
import { ValidationResultsSection } from './components/ValidationResultsSection';
import { ExceptionReviewSection } from './components/ExceptionReviewSection';
import { QuoteConfigSection } from './components/QuoteConfigSection';
import { QuoteComparisonSection } from './components/QuoteComparisonSection';
import { QuoteHistorySection } from './components/QuoteHistorySection';
import { ReportsExportSection } from './components/ReportsExportSection';
import { IntegrationArchitectureSection } from './components/IntegrationArchitectureSection';
import { ComplianceChecklistSection } from './components/ComplianceChecklistSection';
import { BenchmarkRunnerModal } from './components/BenchmarkRunnerModal';
import { PrintableQuoteModal } from './components/PrintableQuoteModal';
import { ProveCalculationModal } from './components/ProveCalculationModal';
import { VerificationEvidenceModal } from './components/VerificationEvidenceModal';

import {
  CensusRecord,
  ValidatedRecord,
  ValidationSummary,
  QuoteConfig,
  QuoteResult,
  AuditLogEntry,
  PlanTier,
} from './types/census';
import { validateCensusRecords } from './services/validationEngine';
import {
  calculateIllustrativeQuote,
  calculateComparisonQuotes,
} from './services/pricingEngine';
import { parseCSV, detectColumnMapping, normalizeRows, ColumnMapping } from './services/dataNormalizer';
import {
  SAMPLE_CHALLENGE_105_CSV,
  SAMPLE_CLEAN_50_CSV,
  SAMPLE_EXCEPTIONS_30_CSV,
} from './data/sampleDatasets';
import { Language, TRANSLATIONS } from './services/i18n';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [rawRecords, setRawRecords] = useState<CensusRecord[]>([]);
  const [validatedRecords, setValidatedRecords] = useState<ValidatedRecord[]>([]);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);

  // Quote Configuration State
  const [quoteConfig, setQuoteConfig] = useState<QuoteConfig>({
    plan_tier: 'enhanced',
    copay_option: '10',
    include_maternity: true,
    include_dependants: true,
  });

  const [activeQuote, setActiveQuote] = useState<QuoteResult | null>(null);
  const [quoteComparison, setQuoteComparison] = useState<{
    essential: QuoteResult;
    enhanced: QuoteResult;
    premium: QuoteResult;
  } | null>(null);

  const [quoteHistory, setQuoteHistory] = useState<QuoteResult[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedRecordForReview, setSelectedRecordForReview] = useState<ValidatedRecord | null>(null);

  // Modals
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isProveCalcOpen, setIsProveCalcOpen] = useState(false);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  // Handle document direction (RTL / LTR) on language toggle
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Load default dataset on initial mount for immediate demonstration
  useEffect(() => {
    loadSampleData('challenge_105');
  }, []);

  const loadSampleData = (key: 'challenge_105' | 'clean_50' | 'exceptions_30') => {
    let csv = SAMPLE_CHALLENGE_105_CSV;
    let filename = 'Synthetic_Challenge_105.csv';

    if (key === 'clean_50') {
      csv = SAMPLE_CLEAN_50_CSV;
      filename = 'Synthetic_Clean_50.csv';
    } else if (key === 'exceptions_30') {
      csv = SAMPLE_EXCEPTIONS_30_CSV;
      filename = 'Synthetic_Exceptions_30.csv';
    }

    const { headers, rows } = parseCSV(csv);
    const { mapping } = detectColumnMapping(headers);
    const normalized = normalizeRows(rows, mapping as ColumnMapping);
    handleDataLoaded(normalized, filename);
  };

  const handleDataLoaded = (records: CensusRecord[], filename: string) => {
    setRawRecords(records);
    setCurrentFilename(filename);

    // Validate
    const { validatedRecords: valRecs, summary: sum } = validateCensusRecords(records);
    setValidatedRecords(valRecs);
    setSummary(sum);

    // Calculate initial quote & comparisons
    const quote = calculateIllustrativeQuote(valRecs, quoteConfig, 1, filename);
    const comp = calculateComparisonQuotes(valRecs, quoteConfig, filename);
    setActiveQuote(quote);
    setQuoteComparison(comp);

    setQuoteHistory((prev) => [quote, ...prev.slice(0, 19)]);
  };

  const handleConfigChange = (newConfig: QuoteConfig) => {
    setQuoteConfig(newConfig);
    if (validatedRecords.length > 0) {
      const nextVersion = (activeQuote?.quote_version || 1) + 1;
      const quote = calculateIllustrativeQuote(
        validatedRecords,
        newConfig,
        nextVersion,
        currentFilename || 'CENSUS-DEMO-001'
      );
      const comp = calculateComparisonQuotes(
        validatedRecords,
        newConfig,
        currentFilename || 'CENSUS-DEMO-001'
      );
      setActiveQuote(quote);
      setQuoteComparison(comp);
      setQuoteHistory((prev) => [quote, ...prev.slice(0, 19)]);
    }
  };

  const handleSelectTier = (tier: PlanTier) => {
    handleConfigChange({ ...quoteConfig, plan_tier: tier });
  };

  const handleApplyCorrection = (
    rowId: number,
    updatedFields: Partial<CensusRecord>,
    reviewerNotes: string
  ) => {
    // 1. Update the raw records
    const updatedRaw = rawRecords.map((r) => {
      if (r.row_id === rowId) {
        // Log changes to audit log
        Object.entries(updatedFields).forEach(([field, newVal]) => {
          const oldVal = (r as any)[field];
          if (oldVal !== newVal && newVal !== undefined) {
            const entry: AuditLogEntry = {
              id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toISOString(),
              row_id: rowId,
              employee_id: updatedFields.employee_id || r.employee_id,
              field_changed: field,
              old_value: String(oldVal ?? ''),
              new_value: String(newVal),
              reviewer: lang === 'ar' ? 'مدقق العمليات (تجريبي)' : 'Operations Reviewer (Demo)',
            };
            setAuditLogs((prev) => [entry, ...prev]);
          }
        });

        return {
          ...r,
          ...updatedFields,
        };
      }
      return r;
    });

    setRawRecords(updatedRaw);

    // 2. Re-validate
    const { validatedRecords: newValRecs, summary: newSum } = validateCensusRecords(updatedRaw);
    setValidatedRecords(newValRecs);
    setSummary(newSum);

    // Update selected record for review
    const updatedSelected = newValRecs.find((rec) => rec.row_id === rowId) || null;
    if (updatedSelected) {
      updatedSelected.is_reviewed = true;
      updatedSelected.review_notes = reviewerNotes;
    }
    setSelectedRecordForReview(updatedSelected);

    // 3. Re-calculate quotes
    const nextVersion = (activeQuote?.quote_version || 1) + 1;
    const newQuote = calculateIllustrativeQuote(
      newValRecs,
      quoteConfig,
      nextVersion,
      currentFilename || 'CENSUS-DEMO-001'
    );
    const newComp = calculateComparisonQuotes(
      newValRecs,
      quoteConfig,
      currentFilename || 'CENSUS-DEMO-001'
    );
    setActiveQuote(newQuote);
    setQuoteComparison(newComp);
    setQuoteHistory((prev) => [newQuote, ...prev.slice(0, 19)]);
  };

  const handleSelectHistoricalQuote = (q: QuoteResult) => {
    setActiveQuote(q);
    setQuoteConfig(q.config);
  };

  const totalExceptions = summary
    ? summary.review_required_records + summary.invalid_records
    : 0;

  const t = TRANSLATIONS[lang];

  return (
    <div className={`min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* 1. Mandatory Persistent Safety Notice (Bilingual) */}
      <PersistentNotice lang={lang} />

      {/* 2. Enterprise Header, Navigation & Language Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        exceptionCount={totalExceptions}
        totalRecordsCount={summary?.total_records || 0}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        lang={lang}
        setLang={setLang}
        onOpenProveCalculation={() => setIsProveCalcOpen(true)}
        onOpenEvidence={() => setIsEvidenceOpen(true)}
      />

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewSection
            summary={summary}
            activeQuote={activeQuote}
            correctionsCount={auditLogs.length}
            setActiveTab={setActiveTab}
            onLoadSample={loadSampleData}
            onOpenBenchmark={() => setIsBenchmarkOpen(true)}
          />
        )}

        {activeTab === 'upload' && (
          <CensusUploadSection
            onDataLoaded={handleDataLoaded}
            currentFilename={currentFilename}
            recordsCount={rawRecords.length}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationResultsSection
            records={validatedRecords}
            summary={summary}
            setActiveTab={setActiveTab}
            onSelectRecordForReview={(item) => setSelectedRecordForReview(item)}
          />
        )}

        {activeTab === 'exceptions' && (
          <ExceptionReviewSection
            records={validatedRecords}
            auditLogs={auditLogs}
            selectedRecord={selectedRecordForReview}
            onSelectRecord={(rec) => setSelectedRecordForReview(rec)}
            onApplyCorrection={handleApplyCorrection}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'quote_config' && (
          <QuoteConfigSection
            config={quoteConfig}
            onConfigChange={handleConfigChange}
            validatedRecords={validatedRecords}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'quote_comparison' && (
          <QuoteComparisonSection
            quote={activeQuote}
            comparison={quoteComparison}
            onSelectTier={handleSelectTier}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'history' && (
          <QuoteHistorySection
            quoteHistory={quoteHistory}
            onSelectHistoricalQuote={handleSelectHistoricalQuote}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsExportSection
            records={validatedRecords}
            summary={summary}
            activeQuote={activeQuote}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'architecture' && <IntegrationArchitectureSection />}

        {activeTab === 'compliance' && <ComplianceChecklistSection />}
      </main>

      {/* 4. Speed Benchmark Modal */}
      <BenchmarkRunnerModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* 5. Printable Quote Modal (Bilingual) */}
      <PrintableQuoteModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        quote={activeQuote}
        lang={lang}
      />

      {/* 6. Prove the Calculation (Deterministic Tariff Audit Proof) Modal */}
      <ProveCalculationModal
        isOpen={isProveCalcOpen}
        onClose={() => setIsProveCalcOpen(false)}
        quote={activeQuote}
        lang={lang}
      />

      {/* 7. Verification Evidence & Checklist Dossier Modal */}
      <VerificationEvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        lang={lang}
        summary={summary}
        activeQuote={activeQuote}
        correctionsCount={auditLogs.length}
      />

      {/* 8. Enterprise Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white">{t.appTitle}</span> — {t.appSubtitle}
            <div className="text-[11px] text-slate-500 mt-0.5">
              {lang === 'ar'
                ? 'مشاركة في تحدي سيغنا "التسعير في ثوانٍ" · نموذج أولي مستقل.'
                : 'Designed for Cigna “The Quote in Seconds Challenge” · Independent Concept Prototype.'}
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>{t.syntheticDataBadge} · {t.illustrativePricingDisclaimer}</div>
            <div className="text-slate-500">
              {lang === 'ar' ? 'ليست خدمة رسمية من سيغنا أو عرض تأمين ملزم.' : 'Not an official Cigna service or quote offer.'}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
