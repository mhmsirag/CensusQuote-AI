/**
 * Deterministic Illustrative Pricing Engine
 * Strictly adheres to configurable demonstration business rules.
 * Never uses AI models to compute quotes or financial values.
 */

import {
  ValidatedRecord,
  QuoteConfig,
  QuoteResult,
  RatedLineItem,
  ExcludedRecordItem,
  RelationshipType,
  PlanTier,
  CopayOption,
} from '../types/census';

export const BASE_RATES: Record<RelationshipType, number> = {
  employee: 1200.0,
  spouse: 1000.0,
  child: 600.0,
  other: 900.0,
  unknown: 0.0,
};

export const PLAN_MULTIPLIERS: Record<PlanTier, number> = {
  essential: 1.0,
  enhanced: 1.25,
  premium: 1.55,
};

export const COPAY_MULTIPLIERS: Record<CopayOption, number> = {
  '20': 0.95,
  '10': 1.0,
  '0': 1.12,
};

export const MATERNITY_ADDON_PER_EMPLOYEE = 250.0;

function round2(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calculateIllustrativeQuote(
  validatedRecords: ValidatedRecord[],
  config: QuoteConfig,
  quoteVersion: number = 1,
  censusReference: string = 'CENSUS-DEMO-001'
): QuoteResult {
  const startTime = performance.now();

  const planMult = PLAN_MULTIPLIERS[config.plan_tier];
  const copayMult = COPAY_MULTIPLIERS[config.copay_option];

  const lineItems: RatedLineItem[] = [];
  const excludedRecords: ExcludedRecordItem[] = [];

  const subtotals: Record<
    RelationshipType,
    { count: number; annual_subtotal: number }
  > = {
    employee: { count: 0, annual_subtotal: 0 },
    spouse: { count: 0, annual_subtotal: 0 },
    child: { count: 0, annual_subtotal: 0 },
    other: { count: 0, annual_subtotal: 0 },
    unknown: { count: 0, annual_subtotal: 0 },
  };

  let totalAnnual = 0;
  const humanReviewWarnings: string[] = [];
  let outstandingExceptions = 0;

  for (const item of validatedRecords) {
    const rec = item.record;

    // Check if record is valid
    if (item.status !== 'valid') {
      outstandingExceptions++;
      excludedRecords.push({
        row_id: item.row_id,
        employee_id: rec.employee_id || `[ROW-${item.row_id}]`,
        name: rec.name || '[Unnamed]',
        relationship: rec.relationship,
        reason:
          item.status === 'invalid'
            ? 'Failed required validation: Record has fatal errors.'
            : 'Pending human exception review: Record flagged with ambiguous fields.',
        error_details: item.errors,
      });
      continue;
    }

    // Check dependants toggle
    if (!config.include_dependants && rec.relationship !== 'employee') {
      excludedRecords.push({
        row_id: item.row_id,
        employee_id: rec.employee_id,
        name: rec.name,
        relationship: rec.relationship,
        reason: 'Dependants excluded from quotation as per SME configuration toggle.',
        error_details: ['Configuration: Dependants not covered in this quote.'],
      });
      continue;
    }

    // Base rate by relationship
    const baseAmount = BASE_RATES[rec.relationship] || 0;

    // Maternity add-on applies ONLY to employees
    const maternityAmount =
      config.include_maternity && rec.relationship === 'employee'
        ? MATERNITY_ADDON_PER_EMPLOYEE
        : 0;

    // Formula: (baseAmount + maternityAmount) * planMult * copayMult
    const subSum = baseAmount + maternityAmount;
    const annualAmount = round2(subSum * planMult * copayMult);
    const monthlyAmount = round2(annualAmount / 12);

    totalAnnual = round2(totalAnnual + annualAmount);

    // Track subtotals
    subtotals[rec.relationship].count++;
    subtotals[rec.relationship].annual_subtotal = round2(
      subtotals[rec.relationship].annual_subtotal + annualAmount
    );

    // Add warnings if record has warnings
    if (item.warnings.length > 0) {
      item.warnings.forEach((w) => {
        if (!humanReviewWarnings.includes(w)) {
          humanReviewWarnings.push(`${rec.employee_id} (${rec.name}): ${w}`);
        }
      });
    }

    const formulaBreakdown = `(Base AED ${baseAmount.toFixed(2)}${
      maternityAmount > 0 ? ` + Mat AED ${maternityAmount.toFixed(2)}` : ''
    }) × ${planMult.toFixed(2)} (${config.plan_tier}) × ${copayMult.toFixed(
      2
    )} (${config.copay_option}% co-pay) = AED ${annualAmount.toFixed(2)}`;

    lineItems.push({
      row_id: item.row_id,
      employee_id: rec.employee_id,
      name: rec.name,
      relationship: rec.relationship,
      age: rec.age,
      base_amount: baseAmount,
      maternity_amount: maternityAmount,
      plan_multiplier: planMult,
      copay_multiplier: copayMult,
      calculated_annual_amount: annualAmount,
      calculated_monthly_amount: monthlyAmount,
      formula_breakdown: formulaBreakdown,
    });
  }

  const calculationDuration = Math.round(performance.now() - startTime);
  const now = new Date();
  const quoteRef = `CQ-${now.getFullYear()}-${Math.random()
    .toString(36)
    .substring(2, 7)
    .toUpperCase()}`;

  const pricingAssumptions = [
    `Annual base rates: Employee AED 1,200 | Spouse AED 1,000 | Child AED 600 | Other AED 900`,
    `Plan tier multiplier: ${config.plan_tier.toUpperCase()} (${planMult.toFixed(2)}x)`,
    `Co-pay multiplier: ${config.copay_option}% co-pay (${copayMult.toFixed(2)}x)`,
    config.include_maternity
      ? `Demonstration maternity add-on included: AED ${MATERNITY_ADDON_PER_EMPLOYEE.toFixed(
          2
        )} per active employee record`
      : `Maternity add-on excluded`,
    config.include_dependants
      ? `Eligible spouse, child, and other dependants included in quotation`
      : `Dependants excluded; employee-only coverage selected`,
    `All amounts rounded to 2 decimal places. Illustrative demonstration only.`,
  ];

  return {
    quote_reference: quoteRef,
    quote_version: quoteVersion,
    created_at: now.toISOString(),
    census_reference: censusReference,
    config,
    rated_count: lineItems.length,
    excluded_count: excludedRecords.length,
    total_annual_amount: totalAnnual,
    total_monthly_amount: round2(totalAnnual / 12),
    currency: 'AED',
    subtotals_by_relationship: subtotals,
    line_items: lineItems,
    excluded_records: excludedRecords,
    pricing_assumptions: pricingAssumptions,
    outstanding_exceptions_count: outstandingExceptions,
    human_review_warnings: humanReviewWarnings,
    calculation_duration_ms: calculationDuration,
  };
}

/**
 * Calculates quotes across all three plan tiers side-by-side for rapid SME comparison
 */
export function calculateComparisonQuotes(
  validatedRecords: ValidatedRecord[],
  baseConfig: Omit<QuoteConfig, 'plan_tier'>,
  censusReference: string = 'CENSUS-DEMO-001'
): {
  essential: QuoteResult;
  enhanced: QuoteResult;
  premium: QuoteResult;
} {
  const essential = calculateIllustrativeQuote(
    validatedRecords,
    { ...baseConfig, plan_tier: 'essential' },
    1,
    censusReference
  );
  const enhanced = calculateIllustrativeQuote(
    validatedRecords,
    { ...baseConfig, plan_tier: 'enhanced' },
    1,
    censusReference
  );
  const premium = calculateIllustrativeQuote(
    validatedRecords,
    { ...baseConfig, plan_tier: 'premium' },
    1,
    censusReference
  );

  return { essential, enhanced, premium };
}
