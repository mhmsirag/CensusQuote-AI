/**
 * CensusQuote AI - Bilingual Localization Service (English / Arabic)
 * Provides comprehensive translations for all UI sections, validation rules,
 * disclaimers, report headers, and tariff proofs with full RTL/LTR support.
 */

export type Language = 'en' | 'ar';

export interface TranslationDictionary {
  // Common & Disclaimers
  prototypeNoticeTitle: string;
  prototypeNoticeDesc: string;
  syntheticDataBadge: string;
  illustrativePricingDisclaimer: string;
  currencyLabel: string;
  aedCurrency: string;
  appTitle: string;
  appSubtitle: string;
  cignaChallengeDemo: string;
  sessionMode: string;
  runBenchmarkBtn: string;
  close: string;
  cancel: string;
  apply: string;
  save: string;
  download: string;
  print: string;
  view: string;
  status: string;
  actions: string;

  // Tabs
  tabOverview: string;
  tabUpload: string;
  tabValidation: string;
  tabExceptions: string;
  tabQuoteConfig: string;
  tabQuoteComparison: string;
  tabHistory: string;
  tabReports: string;
  tabArchitecture: string;
  tabCompliance: string;

  // Step 1: Overview
  overviewHeroBadge: string;
  overviewHeroTitle: string;
  overviewHeroDesc: string;
  load105DatasetBtn: string;
  load50CleanBtn: string;
  load30ExceptionsBtn: string;
  workflowPipelineTitle: string;
  currentTelemetryTitle: string;
  verifiedTelemetryBadge: string;
  totalRecordsCard: string;
  validRecordsCard: string;
  exceptionsCard: string;
  correctionsCard: string;
  cleanRateLabel: string;
  passedRulesLabel: string;
  pendingReviewLabel: string;
  recordedInAuditLabel: string;
  validationRuntimeLabel: string;
  pricingRuntimeLabel: string;
  futureHypothesesTitle: string;
  futureHypothesesBadge: string;
  futureHypothesesDesc: string;

  // Step 2: Upload & AI Mapping
  uploadTitle: string;
  uploadDesc: string;
  dragDropTitle: string;
  browseFiles: string;
  uploadLimitsNotice: string;
  preconfiguredDatasetsTitle: string;
  preconfiguredDatasetsDesc: string;
  mapWithAiBtn: string;
  aiMappingModalTitle: string;
  aiMappingSummaryTitle: string;
  aiConfidenceLabel: string;
  standardFieldCol: string;
  mappedCsvCol: string;
  samplePreviewCol: string;
  statusCol: string;
  requiredLabel: string;
  optionalLabel: string;
  confirmMappingsBtn: string;

  // Step 3: Validation
  validationTitle: string;
  validationDesc: string;
  interactiveDiagnosticBadge: string;
  filterByErrorCategory: string;
  allTypes: string;
  statusAll: string;
  statusValid: string;
  statusReview: string;
  statusInvalid: string;
  searchPlaceholder: string;
  colRow: string;
  colEmpId: string;
  colName: string;
  colRelationship: string;
  colDob: string;
  colAge: string;
  colStatus: string;
  colIssues: string;
  colAction: string;
  resolveIssueBtn: string;
  clearHighlightBtn: string;
  proceedToQuotingBtn: string;

  // Step 4: Exception Review
  exceptionReviewTitle: string;
  activeExceptionsLabel: string;
  exceptionReviewDesc: string;
  queueListTitle: string;
  remediationWorkspaceTitle: string;
  remediationWorkspaceDesc: string;
  aiIssueAnalysisBtn: string;
  detectedReasonsTitle: string;
  immutableBaselineTitle: string;
  correctionEntryTitle: string;
  fieldEmpId: string;
  fieldName: string;
  fieldRel: string;
  fieldDob: string;
  fieldJobTitle: string;
  fieldDept: string;
  fieldReviewNotes: string;
  applyRevalidateBtn: string;
  sessionAuditTrailTitle: string;
  auditTimeCol: string;
  auditRowCol: string;
  auditEmpCol: string;
  auditFieldCol: string;
  auditPrevCol: string;
  auditNewCol: string;
  auditRoleCol: string;

  // Step 5: Quote Config
  quoteConfigTitle: string;
  quoteConfigDesc: string;
  eligibleForRatingBadge: string;
  planTierSectionTitle: string;
  copaySectionTitle: string;
  maternityAddonTitle: string;
  maternityAddonDesc: string;
  dependantsToggleTitle: string;
  dependantsToggleDesc: string;
  formulaWalkthroughTitle: string;
  calculateCompareBtn: string;

  // Step 6: Quote Comparison & Line Items
  comparisonTitle: string;
  comparisonDesc: string;
  selectedPlanTotal: string;
  ratedMembersCountLabel: string;
  excludedMembersCountLabel: string;
  coPayLevelLabel: string;
  maternityStatusLabel: string;
  tabLineItems: string;
  tabExcluded: string;
  tabAssumptions: string;
  colBaseRate: string;
  colMaternity: string;
  colPlanMult: string;
  colCopayMult: string;
  colAnnualTotal: string;
  colMonthlyTotal: string;

  // Proof & Evidence
  proveCalculationBtn: string;
  proveCalculationModalTitle: string;
  proveCalculationModalDesc: string;
  calculationProofHeader: string;
  evidenceModalTitle: string;
  evidenceModalDesc: string;
  evidenceTabTitle: string;

  // Reports
  reportsTitle: string;
  reportsDesc: string;
  cleanCensusDownloadTitle: string;
  cleanCensusDownloadDesc: string;
  exceptionReportDownloadTitle: string;
  exceptionReportDownloadDesc: string;
  lineItemsDownloadTitle: string;
  lineItemsDownloadDesc: string;
  jsonPackageDownloadTitle: string;
  jsonPackageDownloadDesc: string;
  printableSummaryCardTitle: string;
  printableSummaryCardDesc: string;
  openPrintModalBtn: string;
  aiChecklistTitle: string;
  generateChecklistBtn: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    // Common & Disclaimers
    prototypeNoticeTitle: 'Concept Prototype Notice:',
    prototypeNoticeDesc:
      'This demonstration uses synthetic data and illustrative pricing. It is not an official Cigna service or a real insurance quotation. All premium figures are illustrative demonstration amounts only.',
    syntheticDataBadge: 'Synthetic Data Only',
    illustrativePricingDisclaimer: 'Illustrative demonstration amounts — not an insurer quote.',
    currencyLabel: 'Currency',
    aedCurrency: 'AED',
    appTitle: 'CensusQuote AI',
    appSubtitle: 'SME Census-to-Quote Automation | Concept Prototype',
    cignaChallengeDemo: 'Cigna Challenge Demo',
    sessionMode: 'Session In-Memory Mode',
    runBenchmarkBtn: 'Run Speed Benchmark',
    close: 'Close',
    cancel: 'Cancel',
    apply: 'Apply',
    save: 'Save',
    download: 'Download',
    print: 'Print / Save as PDF',
    view: 'View',
    status: 'Status',
    actions: 'Actions',

    // Tabs
    tabOverview: '1. Overview',
    tabUpload: '2. Census Upload',
    tabValidation: '3. Data Validation',
    tabExceptions: '4. Exception Review',
    tabQuoteConfig: '5. Quote Config',
    tabQuoteComparison: '6. Quote Comparison',
    tabHistory: '7. Quote History',
    tabReports: '8. Reports & Exports',
    tabArchitecture: '9. Integration Roadmap',
    tabCompliance: '10. UAE Compliance',

    // Step 1: Overview
    overviewHeroBadge: 'Cigna “Quote in Seconds Challenge” Concept Prototype',
    overviewHeroTitle: 'Automating SME Health Census-to-Quote at Scale',
    overviewHeroDesc:
      'Eliminates spreadsheet friction for brokers and employers. Ingests raw employee censuses, normalizes inconsistent fields, isolates validation exceptions for human review, and instantly generates illustrative premium breakdowns without risky manual re-keying.',
    load105DatasetBtn: 'Load 105-Member Challenge Dataset (Controlled Errors)',
    load50CleanBtn: 'Load 50 Clean Records',
    load30ExceptionsBtn: 'Load 30 Exception-Heavy Records',
    workflowPipelineTitle: 'End-to-End Automated Quoting Pipeline',
    currentTelemetryTitle: 'Current Session Telemetry',
    verifiedTelemetryBadge: 'Verified Measured Telemetry',
    totalRecordsCard: 'Total Census Records',
    validRecordsCard: 'Valid & Eligible Records',
    exceptionsCard: 'Flagged Exceptions',
    correctionsCard: 'Inline Corrections Made',
    cleanRateLabel: 'automated clean rate',
    passedRulesLabel: 'Passed all 10 deterministic rules',
    pendingReviewLabel: 'review required · fatal invalid',
    recordedInAuditLabel: 'Recorded in session audit trail',
    validationRuntimeLabel: 'Validation Engine Runtime',
    pricingRuntimeLabel: 'Pricing Engine Calculation',
    futureHypothesesTitle: 'Proposed Business Hypotheses (Unverified Pilot Targets)',
    futureHypothesesBadge: 'Future Pilot Targets — Not Claims',
    futureHypothesesDesc:
      'In accordance with challenge safety protocols, the figures below represent operational hypotheses to be validated during a prospective Cigna SME pilot programme, rather than achieved historical results:',

    // Step 2: Upload & AI Mapping
    uploadTitle: 'Step 2: SME Census Ingestion',
    uploadDesc:
      'Upload raw employee census CSVs or select from standardized pre-packaged synthetic datasets. Gemini assists with column mapping before deterministic validation.',
    dragDropTitle: 'Drag & Drop your SME Census CSV here, or',
    browseFiles: 'browse files',
    uploadLimitsNotice: 'Supports UTF-8 CSV with automated AI column mapping · Max 5MB / 5,000 records',
    preconfiguredDatasetsTitle: 'Pre-Configured Synthetic Datasets',
    preconfiguredDatasetsDesc:
      'Quickly load test datasets or test the AI column mapping workflow with customized headers.',
    mapWithAiBtn: 'Map with AI & Ingest',
    aiMappingModalTitle: 'AI-Assisted Column Mapping & Field Confirmation',
    aiMappingSummaryTitle: 'Gemini Intelligence Summary:',
    aiConfidenceLabel: 'Confidence',
    standardFieldCol: 'Standard Rating Field',
    mappedCsvCol: 'Mapped CSV Column Header',
    samplePreviewCol: 'Sample Data Preview (First 2 Rows)',
    statusCol: 'Status',
    requiredLabel: 'Required',
    optionalLabel: 'Optional',
    confirmMappingsBtn: 'Confirm Mappings & Run Validation',

    // Step 3: Validation
    validationTitle: 'Step 3: Deterministic Data Validation',
    validationDesc:
      'Evaluated against 10 strict enterprise rules. Explains validation criteria for every row with interactive cell highlighting.',
    interactiveDiagnosticBadge: 'Interactive Cell Diagnostics',
    filterByErrorCategory: 'Filter By Error Category:',
    allTypes: 'All Types',
    statusAll: 'All',
    statusValid: 'Valid',
    statusReview: 'Review Required',
    statusInvalid: 'Invalid',
    searchPlaceholder: 'Search by ID, name, or error...',
    colRow: 'Row',
    colEmpId: 'Employee ID',
    colName: 'Name',
    colRelationship: 'Relationship',
    colDob: 'Date of Birth',
    colAge: 'Age',
    colStatus: 'Validation Status',
    colIssues: 'Detected Issues & Action (Click to Highlight Cell)',
    colAction: 'Review Action',
    resolveIssueBtn: 'Resolve Issue',
    clearHighlightBtn: 'Clear Highlight',
    proceedToQuotingBtn: 'Proceed to Quoting',

    // Step 4: Exception Review
    exceptionReviewTitle: 'Step 4: Human Exception Review Queue',
    activeExceptionsLabel: 'Active Exceptions',
    exceptionReviewDesc:
      'Human-in-the-loop governance. Unresolved records never enter rating silently. Corrections are tracked in an immutable demo session audit log.',
    queueListTitle: 'Exception Queue',
    remediationWorkspaceTitle: 'Exception Remediation Workspace',
    remediationWorkspaceDesc: 'Apply demonstration-only corrections to re-validate this record in real-time.',
    aiIssueAnalysisBtn: 'AI Issue Analysis',
    detectedReasonsTitle: 'Validation Reason(s) Detected:',
    immutableBaselineTitle: 'Original Source Ingestion (Immutable Baseline):',
    correctionEntryTitle: 'Demonstration Correction Entry:',
    fieldEmpId: 'Employee / Member ID',
    fieldName: 'Full Legal Name',
    fieldRel: 'Relationship Category',
    fieldDob: 'Date of Birth (YYYY-MM-DD)',
    fieldJobTitle: 'Job Title (Optional)',
    fieldDept: 'Department (Optional)',
    fieldReviewNotes: 'Reviewer Audit Notes / Reason for Adjustment',
    applyRevalidateBtn: 'Apply & Revalidate Record',
    sessionAuditTrailTitle: 'Session Exception Audit Trail',
    auditTimeCol: 'Timestamp',
    auditRowCol: 'Row',
    auditEmpCol: 'Employee ID',
    auditFieldCol: 'Field Adjusted',
    auditPrevCol: 'Previous Baseline',
    auditNewCol: 'Corrected Value',
    auditRoleCol: 'Reviewer Role',

    // Step 5: Quote Config
    quoteConfigTitle: 'Step 5: Quote Configuration Parameters',
    quoteConfigDesc: 'Select plan tiers, co-pay levels, and coverage add-ons. Recalculates instantly.',
    eligibleForRatingBadge: 'Records Eligible for Rating',
    planTierSectionTitle: '1. Select Demonstration Plan Tier (Annual Multiplier)',
    copaySectionTitle: '2. Member Co-Pay Option (Illustrative Cost Multiplier)',
    maternityAddonTitle: 'Maternity Benefit Add-on',
    maternityAddonDesc: 'Adds flat AED 250 to primary employee base amount before plan/copay multipliers.',
    dependantsToggleTitle: 'Include Dependants',
    dependantsToggleDesc: 'When enabled, spouses (AED 1,000), children (AED 600), and others (AED 900) are rated.',
    formulaWalkthroughTitle: 'Deterministic Pricing Logic:',
    calculateCompareBtn: 'Calculate & Compare Tiers',

    // Step 6: Quote Comparison & Line Items
    comparisonTitle: 'Side-by-Side SME Plan Comparison',
    comparisonDesc:
      'Instant multi-tier pricing enables SME decision-makers to evaluate coverage levels instantly.',
    selectedPlanTotal: 'Selected Plan Total',
    ratedMembersCountLabel: 'Rated Members',
    excludedMembersCountLabel: 'Excluded Members',
    coPayLevelLabel: 'Co-Pay Level',
    maternityStatusLabel: 'Maternity Add-on',
    tabLineItems: 'Rated Line Items',
    tabExcluded: 'Excluded Records',
    tabAssumptions: 'Pricing Assumptions & Governance',
    colBaseRate: 'Base AED',
    colMaternity: 'Maternity',
    colPlanMult: 'Plan Mult',
    colCopayMult: 'Co-Pay',
    colAnnualTotal: 'Annual (AED)',
    colMonthlyTotal: 'Monthly (AED)',

    // Proof & Evidence
    proveCalculationBtn: 'Prove the Calculation (Demo Tariff)',
    proveCalculationModalTitle: 'Deterministic Calculation Proof & Tariff Audit',
    proveCalculationModalDesc:
      'Demonstrates mathematical repeatability. Manual verification of formula components proves that identical inputs yield identical outputs without model hallucinations.',
    calculationProofHeader: 'Formula: (Base + Maternity) × Plan Multiplier × Co-Pay Multiplier',
    evidenceModalTitle: 'Workflow Verification & Evaluation Evidence',
    evidenceModalDesc:
      'Comprehensive verification checklist and audit logs supporting the Cigna "Quote in Seconds Challenge".',
    evidenceTabTitle: 'Verification Evidence',

    // Reports
    reportsTitle: 'Step 8: Reports & Exports Package',
    reportsDesc: 'Download certified audit packages in RFC-compliant CSV and structured JSON format.',
    cleanCensusDownloadTitle: 'Cleaned Census CSV',
    cleanCensusDownloadDesc:
      'Standardized census file containing only verified, rating-eligible records with corrected fields and normalized headers.',
    exceptionReportDownloadTitle: 'Validation Exception Report CSV',
    exceptionReportDownloadDesc:
      'Comprehensive row-by-row audit breakdown detailing every error code, warning, and recommended remediation action.',
    lineItemsDownloadTitle: 'Quote Line-Items CSV',
    lineItemsDownloadDesc:
      'Rated employee-by-employee itemization with base rates, maternity additions, multipliers, and monthly/annual totals.',
    jsonPackageDownloadTitle: 'Structured Quote Summary JSON',
    jsonPackageDownloadDesc:
      'Machine-readable API-ready JSON bundle containing pricing configuration, subtotals, assumptions, and exclusions.',
    printableSummaryCardTitle: 'Printable Executive Quotation Summary',
    printableSummaryCardDesc:
      'Formatted print-ready layout suitable for browser PDF generation and broker presentations.',
    openPrintModalBtn: 'Open Print / PDF Preview',
    aiChecklistTitle: 'AI Broker Follow-Up Checklist Generator',
    generateChecklistBtn: 'Generate Client Checklist',
  },
  ar: {
    // Common & Disclaimers
    prototypeNoticeTitle: 'إشعار النموذج الأولي للمفهوم:',
    prototypeNoticeDesc:
      'يستخدم هذا العرض التوضيحي بيانات اصطناعية وتسعيراً توضيحياً. هذه ليست خدمة رسمية من سيغنا أو عرض تأمين حقيقي. جميع مبالغ الأقساط هي مبالغ توضيحية تجريبية فقط.',
    syntheticDataBadge: 'بيانات اصطناعية فقط',
    illustrativePricingDisclaimer: 'مبالغ توضيحية تجريبية — وليست عرض أسعار تأمين رسمي.',
    currencyLabel: 'العملة',
    aedCurrency: 'درهم إماراتي',
    appTitle: 'CensusQuote AI',
    appSubtitle: 'أتمتة تسعير بيانات موظفي الشركات الصغيرة والمتوسطة | نموذج أولي',
    cignaChallengeDemo: 'عرض تحدي سيغنا',
    sessionMode: 'وضع الجلسة في الذاكرة',
    runBenchmarkBtn: 'تشغيل اختبار سرعة المعالجة',
    close: 'إغلاق',
    cancel: 'إلغاء',
    apply: 'تطبيق',
    save: 'حفظ',
    download: 'تنزيل',
    print: 'طباعة / حفظ كـ PDF',
    view: 'عرض',
    status: 'الحالة',
    actions: 'الإجراءات',

    // Tabs
    tabOverview: '١. نظرة عامة',
    tabUpload: '٢. تحميل التعداد',
    tabValidation: '٣. تدقيق البيانات',
    tabExceptions: '٤. مراجعة الاستثناءات',
    tabQuoteConfig: '٥. إعدادات التسعير',
    tabQuoteComparison: '٦. مقارنة العروض',
    tabHistory: '٧. سجل التسعير',
    tabReports: '٨. التقارير والتصدير',
    tabArchitecture: '٩. خارطة التكامل',
    tabCompliance: '١٠. الامتثال الإماراتي',

    // Step 1: Overview
    overviewHeroBadge: 'نموذج أولي لتحدي سيغنا "التسعير في ثوانٍ"',
    overviewHeroTitle: 'أتمتة تسعير التأمين الصحي للشركات الصغيرة والمتوسطة على نطاق واسع',
    overviewHeroDesc:
      'القضاء على تعقيدات الجداول اليدوية للوسطاء وأصحاب العمل. معالجة سريعة لبيانات التعداد، وتوحيد الحقول غير المتسقة، وعزل استثناءات التدقيق للمراجعة البشرية، وحساب الأقساط التوضيحية فوراً دون إعادة إدخال يدوية.',
    load105DatasetBtn: 'تحميل بيانات التحدي (١٠٥ سجلات مع أخطاء اختبارية)',
    load50CleanBtn: 'تحميل ٥٠ سجلاً سليماً بالكامل',
    load30ExceptionsBtn: 'تحميل ٣٠ سجلاً عالي الاستثناءات',
    workflowPipelineTitle: 'مسار التسعير المؤتمت الشامل (من البداية إلى النهاية)',
    currentTelemetryTitle: 'قياسات أداء الجلسة الحالية',
    verifiedTelemetryBadge: 'قياسات فعلية موثقة',
    totalRecordsCard: 'إجمالي السجلات المستلمة',
    validRecordsCard: 'السجلات السليمة والمؤهلة',
    exceptionsCard: 'الاستثناءات المرصودة',
    correctionsCard: 'التصحيحات اليدوية المطبقة',
    cleanRateLabel: 'نسبة السجلات السليمة مؤتمتاً',
    passedRulesLabel: 'مطابقة لكافة قواعد التدقيق العشر الحتمية',
    pendingReviewLabel: 'مطلوب مراجعتها · أخطاء مانعة',
    recordedInAuditLabel: 'مسجلة في سجل تدقيق الجلسة',
    validationRuntimeLabel: 'زمن تشغيل محرك التدقيق',
    pricingRuntimeLabel: 'زمن حساب محرك التسعير',
    futureHypothesesTitle: 'الفرضيات التشغيلية المقترحة (أهداف تجريبية مستقبلية)',
    futureHypothesesBadge: 'أهداف تجريبية مستقبلية — وليست نتائج نهائية',
    futureHypothesesDesc:
      'وفقاً لمتطلبات السلامة والمصداقية، تمثل هذه الأرقام فرضيات تشغيلية يُقترح التحقق منها خلال برنامج تجريبي مع سيغنا، وليست إنجازات تاريخية:',

    // Step 2: Upload & AI Mapping
    uploadTitle: 'الخطوة ٢: استيعاب تعداد موظفي الشركات',
    uploadDesc:
      'قم بتحميل ملفات التعداد بتنسيق CSV أو اختر من مجموعات البيانات الاصطناعية المجهزة مسبقاً. يساعد نموذج Gemini في مطابقة الأعمدة قبل التدقيق الحتمي.',
    dragDropTitle: 'اسحب وأفلت ملف CSV هنا، أو',
    browseFiles: 'تصفح الملفات',
    uploadLimitsNotice: 'يدعم ترميز UTF-8 CSV ومطابقة الأعمدة بالذكاء الاصطناعي · الحد الأقصى ٥ ميجابايت / ٥٠٠٠ سجل',
    preconfiguredDatasetsTitle: 'مجموعات بيانات اصطناعية جاهزة للاختبار',
    preconfiguredDatasetsDesc:
      'تحميل سريع لمجموعات اختبارية لمعاينة آليات التدقيق والتعامل مع الأخطاء غير المتوقعة.',
    mapWithAiBtn: 'مطابقة بالذكاء الاصطناعي واستيعاب',
    aiMappingModalTitle: 'مطابقة الأعمدة بالذكاء الاصطناعي وتأكيد الحقول',
    aiMappingSummaryTitle: 'ملخص تحليل نموذج Gemini الذكي:',
    aiConfidenceLabel: 'مستوى الثقة',
    standardFieldCol: 'الحقل التأميني القياسي',
    mappedCsvCol: 'اسم العمود المطابق في الملف',
    samplePreviewCol: 'معاينة عينة البيانات (أول صفين)',
    statusCol: 'الحالة',
    requiredLabel: 'مطلوب',
    optionalLabel: 'اختياري',
    confirmMappingsBtn: 'تأكيد المطابقة والبدء بالتدقيق',

    // Step 3: Validation
    validationTitle: 'الخطوة ٣: التدقيق الحتمي للبيانات',
    validationDesc:
      'تقييم فوري بالاستناد إلى ١٠ قواعد مؤسسية صارمة. توضيح معايير التدقيق لكل سجل مع ميزة تمييز الخلية المعيبة تفاعلياً.',
    interactiveDiagnosticBadge: 'تشخيص تفاعلي على مستوى الخلية',
    filterByErrorCategory: 'تصفية حسب نوع الخطأ:',
    allTypes: 'كافة الأنواع',
    statusAll: 'الكل',
    statusValid: 'سليم',
    statusReview: 'مطلوب مراجعة',
    statusInvalid: 'غير صالح',
    searchPlaceholder: 'بحث بالرقم التعريفي، الاسم، أو الخطأ...',
    colRow: 'الصف',
    colEmpId: 'الرقم التعريفي',
    colName: 'الاسم الكامل',
    colRelationship: 'صلة القرابة',
    colDob: 'تاريخ الميلاد',
    colAge: 'العمر',
    colStatus: 'حالة التدقيق',
    colIssues: 'الملاحظات والإجراء المطلوب (انقر لتحديد الخلية)',
    colAction: 'إجراء المراجعة',
    resolveIssueBtn: 'معالجة الخطأ',
    clearHighlightBtn: 'إلغاء التحديد',
    proceedToQuotingBtn: 'المتابعة إلى التسعير',

    // Step 4: Exception Review
    exceptionReviewTitle: 'الخطوة ٤: قائمة مراجعة الاستثناءات البشرية',
    activeExceptionsLabel: 'استثناءات نشطة',
    exceptionReviewDesc:
      'إشراف بشري محكم. لا يتم احتساب أي سجل غير مؤكد بشكل صامت. تُوثق التصحيحات في سجل تدقيق لا يمكن التلاعب به أثناء الجلسة.',
    queueListTitle: 'طابور الاستثناءات',
    remediationWorkspaceTitle: 'مساحة تصحيح الاستثناء',
    remediationWorkspaceDesc: 'تطبيق تصحيحات تجريبية لإعادة تدقيق السجل فورياً في الوقت الفعلي.',
    aiIssueAnalysisBtn: 'تحليل المشكلة بالذكاء الاصطناعي',
    detectedReasonsTitle: 'أسباب عدم الصحة المرصودة:',
    immutableBaselineTitle: 'البيانات الأصلية المدخلة (مرجع غير قابل للتعديل):',
    correctionEntryTitle: 'إدخال التصحيح التجريبي:',
    fieldEmpId: 'الرقم التعريفي للموظف/التابع',
    fieldName: 'الاسم القانوني الكامل',
    fieldRel: 'فئة صلة القرابة',
    fieldDob: 'تاريخ الميلاد (YYYY-MM-DD)',
    fieldJobTitle: 'المسمى الوظيفي (اختياري)',
    fieldDept: 'القسم / الإدارة (اختياري)',
    fieldReviewNotes: 'ملاحظات المدقق / سبب التعديل',
    applyRevalidateBtn: 'تطبيق وإعادة تدقيق السجل',
    sessionAuditTrailTitle: 'سجل تدقيق تصحيحات الجلسة',
    auditTimeCol: 'الوقت',
    auditRowCol: 'الصف',
    auditEmpCol: 'الرقم التعريفي',
    auditFieldCol: 'الحقل المعدل',
    auditPrevCol: 'القيمة السابقة',
    auditNewCol: 'القيمة المصححة',
    auditRoleCol: 'صفة المدقق',

    // Step 5: Quote Config
    quoteConfigTitle: 'الخطوة ٥: معايير وإعدادات عرض الأسعار',
    quoteConfigDesc: 'تحديد فئات التغطية ونسب التحمل والمزايا الإضافية، مع إعادة احتساب فورية.',
    eligibleForRatingBadge: 'سجلات مؤهلة للتسعير',
    planTierSectionTitle: '١. اختيار فئة التأمين التوضيحية (مضاعف الخطة السنوي)',
    copaySectionTitle: '٢. نسبة تحمل العضو (مضاعف التكلفة التوضيحي)',
    maternityAddonTitle: 'إضافة تغطية الأمومة',
    maternityAddonDesc: 'إضافة مبلغ مقطوع بقيمة ٢٥٠ درهم لموظفي الفئة الأساسية قبل احتساب المضاعفات.',
    dependantsToggleTitle: 'شمول التابعين (الزوج/الأبناء/الآخرين)',
    dependantsToggleDesc: 'عند التفعيل، يتم احتساب تسعير الزوجة (١٠٠٠ درهم) والأبناء (٦٠٠ درهم) والآخرين (٩٠٠ درهم).',
    formulaWalkthroughTitle: 'معادلة التسعير الحتمية المعتمدة:',
    calculateCompareBtn: 'احتساب ومقارنة الفئات',

    // Step 6: Quote Comparison & Line Items
    comparisonTitle: 'مقارنة فئات التغطية للشركات الصغيرة جنباً إلى جنب',
    comparisonDesc:
      'تسعير فوري متعدد الفئات يتيح لأصحاب القرار في الشركات تقييم البدائل في ثوانٍ.',
    selectedPlanTotal: 'إجمالي الخطة المختارة',
    ratedMembersCountLabel: 'الأعضاء المسعرون',
    excludedMembersCountLabel: 'الأعضاء المستبعدون',
    coPayLevelLabel: 'نسبة التحمل',
    maternityStatusLabel: 'تغطية الأمومة',
    tabLineItems: 'جدول البنود المسعرة',
    tabExcluded: 'السجلات المستبعدة وأسبابها',
    tabAssumptions: 'افتراضات التسعير والحوكمة',
    colBaseRate: 'الأساس (درهم)',
    colMaternity: 'الأمومة',
    colPlanMult: 'مضاعف الخطة',
    colCopayMult: 'مضاعف التحمل',
    colAnnualTotal: 'السنوي (درهم)',
    colMonthlyTotal: 'الشهري (درهم)',

    // Proof & Evidence
    proveCalculationBtn: 'إثبات الحساب الرياضي (التعرفة التجريبية)',
    proveCalculationModalTitle: 'إثبات الحساب الحتمي ومراجعة التعرفة الرياضية',
    proveCalculationModalDesc:
      'إثبات التكرار الرياضي الدقيق. التحقق اليدوي من مكونات المعادلة يثبت أن نفس المدخلات تنتج نفس المخرجات دون أي تخمين أو أخطاء ذكاء اصطناعي.',
    calculationProofHeader: 'المعادلة: (الأساس + الأمومة) × مضاعف الخطة × مضاعف نسبة التحمل',
    evidenceModalTitle: 'أدلة التحقق ومطابقة المتطلبات',
    evidenceModalDesc:
      'سجل التحقق الشامل وقائمة الفحص الداعمة لتحدي سيغنا "التسعير في ثوانٍ".',
    evidenceTabTitle: 'أدلة التحقق',

    // Reports
    reportsTitle: 'الخطوة ٨: حزمة التقارير وتصدير المستندات',
    reportsDesc: 'تنزيل ملفات التدقيق المعتمدة بتنسيق CSV القياسي وحزم JSON البرمجية المهيكلة.',
    cleanCensusDownloadTitle: 'ملف التعداد المنقح والموثق (Clean CSV)',
    cleanCensusDownloadDesc:
      'ملف التعداد الموحد مشتملاً فقط على السجلات المعتمدة والمؤهلة للتسعير بعد تصحيح الحقول.',
    exceptionReportDownloadTitle: 'تقرير استثناءات التدقيق (Exceptions CSV)',
    exceptionReportDownloadDesc:
      'تقرير تدقيق شامل لكل صف يوضح كل رمز خطأ وتوصيات المعالجة المطلوبة.',
    lineItemsDownloadTitle: 'جدول بنود التسعير التفصيلي (Line-Items CSV)',
    lineItemsDownloadDesc:
      'تفصيل قسط كل موظف وتابع بمعدلات الأساس والمضاعفات والإجماليات الشهرية والسنوية.',
    jsonPackageDownloadTitle: 'حزمة ملخص العرض المهيكلة (JSON Package)',
    jsonPackageDownloadDesc:
      'حزمة برمجية جاهزة للربط عبر API تتضمن إعدادات التسعير والمجاميع الفرعية والاستثناءات.',
    printableSummaryCardTitle: 'الملخص التنفيذي الجاهز للطباعة',
    printableSummaryCardDesc:
      'تنسيق رسمي أنيق ومصمم للطباعة المباشرة وحفظ ملفات PDF لعرضها على الوسطاء والعملاء.',
    openPrintModalBtn: 'فتح معاينة الطباعة / PDF',
    aiChecklistTitle: 'مولد قائمة متابعة الوسيط بالذكاء الاصطناعي',
    generateChecklistBtn: 'توليد قائمة متابعة العميل',
  },
};
