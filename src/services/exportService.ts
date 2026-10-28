/**
 * Reports and Export Service
 * Generates RFC-compliant CSVs and structured JSON packages.
 * Enforces synthetic data disclaimers across all outputs.
 */

import { ValidatedRecord, QuoteResult } from '../types/census';

const DISCLAIMER_HEADER =
  '# NOTICE: Illustrative demonstration amounts — not an insurer quote.\n# This report contains synthetic demonstration data only.\n# Not an official Cigna quote, policy, or binding insurance offer.\n';

/**
 * Triggers browser download of text data
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports cleaned, normalized census CSV (valid records only)
 */
export function exportCleanedCensusCSV(records: ValidatedRecord[]): string {
  const validRecords = records.filter((r) => r.status === 'valid');
  const headers = [
    'employee_id',
    'name',
    'relationship',
    'date_of_birth',
    'age',
    'job_title',
    'department',
    'location',
  ];

  const rows = validRecords.map((item) => {
    const r = item.record;
    return [
      escapeCSV(r.employee_id),
      escapeCSV(r.name),
      escapeCSV(r.relationship),
      escapeCSV(r.date_of_birth),
      r.age !== null ? r.age.toString() : '',
      escapeCSV(r.job_title || ''),
      escapeCSV(r.department || ''),
      escapeCSV(r.location || ''),
    ].join(',');
  });

  return `${DISCLAIMER_HEADER}${headers.join(',')}\n${rows.join('\n')}`;
}

/**
 * Exports comprehensive validation exception report CSV
 */
export function exportValidationReportCSV(records: ValidatedRecord[]): string {
  const headers = [
    'row_id',
    'employee_id',
    'name',
    'status',
    'error_count',
    'error_types',
    'errors',
    'warnings',
    'recommended_action',
    'is_eligible_for_quote',
  ];

  const rows = records.map((r) => [
    r.row_id.toString(),
    escapeCSV(r.record.employee_id),
    escapeCSV(r.record.name),
    r.status.toUpperCase(),
    r.errors.length.toString(),
    escapeCSV(r.error_types.join('; ')),
    escapeCSV(r.errors.join('; ')),
    escapeCSV(r.warnings.join('; ')),
    escapeCSV(r.recommended_action),
    r.is_eligible_for_quote ? 'YES' : 'NO',
  ].join(','));

  return `${DISCLAIMER_HEADER}${headers.join(',')}\n${rows.join('\n')}`;
}

/**
 * Exports quote line items CSV
 */
export function exportQuoteLineItemsCSV(quote: QuoteResult): string {
  const headers = [
    'row_id',
    'employee_id',
    'name',
    'relationship',
    'age',
    'base_amount_aed',
    'maternity_addon_aed',
    'plan_multiplier',
    'copay_multiplier',
    'annual_amount_aed',
    'monthly_amount_aed',
    'formula_calculation',
  ];

  const rows = quote.line_items.map((item) => [
    item.row_id.toString(),
    escapeCSV(item.employee_id),
    escapeCSV(item.name),
    item.relationship,
    item.age !== null ? item.age.toString() : '',
    item.base_amount.toFixed(2),
    item.maternity_amount.toFixed(2),
    item.plan_multiplier.toFixed(2),
    item.copay_multiplier.toFixed(2),
    item.calculated_annual_amount.toFixed(2),
    item.calculated_monthly_amount.toFixed(2),
    escapeCSV(item.formula_breakdown),
  ].join(','));

  return `${DISCLAIMER_HEADER}${headers.join(',')}\n${rows.join('\n')}`;
}

/**
 * Exports complete quote package in JSON format
 */
export function exportQuoteSummaryJSON(quote: QuoteResult): string {
  const exportPayload = {
    _disclaimer:
      'Illustrative demonstration amounts — not an insurer quote. Synthetic data only. Not an official Cigna service.',
    quote_metadata: {
      quote_reference: quote.quote_reference,
      quote_version: quote.quote_version,
      created_at: quote.created_at,
      census_reference: quote.census_reference,
      currency: quote.currency,
    },
    configuration: quote.config,
    metrics: {
      rated_members_count: quote.rated_count,
      excluded_members_count: quote.excluded_count,
      total_annual_amount_aed: quote.total_annual_amount,
      total_monthly_amount_aed: quote.total_monthly_amount,
      subtotals_by_relationship: quote.subtotals_by_relationship,
    },
    pricing_assumptions: quote.pricing_assumptions,
    human_review_warnings: quote.human_review_warnings,
    excluded_records_summary: quote.excluded_records.map((e) => ({
      row_id: e.row_id,
      employee_id: e.employee_id,
      name: e.name,
      relationship: e.relationship,
      reason: e.reason,
      errors: e.error_details,
    })),
    line_items: quote.line_items,
  };

  return JSON.stringify(exportPayload, null, 2);
}

function escapeCSV(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
