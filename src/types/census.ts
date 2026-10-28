/**
 * CensusQuote AI - Data Types
 * Strict Enterprise Model Definitions
 */

export type RelationshipType = 'employee' | 'spouse' | 'child' | 'other' | 'unknown';

export type ValidationStatus = 'valid' | 'review_required' | 'invalid';

export type ValidationErrorType =
  | 'missing_identifier'
  | 'duplicate_identifier'
  | 'missing_name'
  | 'missing_dob'
  | 'invalid_date'
  | 'future_dob'
  | 'implausible_age'
  | 'unknown_relationship'
  | 'missing_required_fields'
  | 'duplicate_record';

export interface CensusRecord {
  row_id: number;
  employee_id: string;
  name: string;
  relationship: RelationshipType;
  date_of_birth: string;
  age: number | null;
  job_title?: string;
  department?: string;
  location?: string;
  raw_data: Record<string, string>;
}

export interface ValidatedRecord {
  row_id: number;
  record: CensusRecord;
  status: ValidationStatus;
  errors: string[];
  error_types: ValidationErrorType[];
  warnings: string[];
  recommended_action: string;
  is_eligible_for_quote: boolean;
  is_reviewed?: boolean;
  review_notes?: string;
  corrected_fields?: Partial<CensusRecord>;
  correction_history?: Array<{
    timestamp: string;
    field: string;
    from: string;
    to: string;
  }>;
}

export interface ValidationSummary {
  total_records: number;
  valid_records: number;
  review_required_records: number;
  invalid_records: number;
  duplicate_records: number;
  missing_field_errors: number;
  eligible_for_quote: number;
  validation_duration_ms: number;
  error_breakdown: Record<ValidationErrorType, number>;
}

export type PlanTier = 'essential' | 'enhanced' | 'premium';
export type CopayOption = '20' | '10' | '0';

export interface QuoteConfig {
  plan_tier: PlanTier;
  copay_option: CopayOption;
  include_maternity: boolean;
  include_dependants: boolean;
}

export interface RatedLineItem {
  row_id: number;
  employee_id: string;
  name: string;
  relationship: RelationshipType;
  age: number | null;
  base_amount: number;
  maternity_amount: number;
  plan_multiplier: number;
  copay_multiplier: number;
  calculated_annual_amount: number;
  calculated_monthly_amount: number;
  formula_breakdown: string;
}

export interface ExcludedRecordItem {
  row_id: number;
  employee_id: string;
  name: string;
  relationship: string;
  reason: string;
  error_details: string[];
}

export interface QuoteResult {
  quote_reference: string;
  quote_version: number;
  created_at: string;
  census_reference: string;
  config: QuoteConfig;
  rated_count: number;
  excluded_count: number;
  total_annual_amount: number;
  total_monthly_amount: number;
  currency: 'AED';
  subtotals_by_relationship: Record<
    RelationshipType,
    { count: number; annual_subtotal: number }
  >;
  line_items: RatedLineItem[];
  excluded_records: ExcludedRecordItem[];
  pricing_assumptions: string[];
  outstanding_exceptions_count: number;
  human_review_warnings: string[];
  calculation_duration_ms: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  row_id: number;
  employee_id: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  reviewer: string;
}

export interface BenchmarkResult {
  run_timestamp: string;
  row_count: number;
  parse_duration_ms: number;
  validation_duration_ms: number;
  pricing_duration_ms: number;
  total_duration_ms: number;
  errors_detected: number;
  records_eligible: number;
}
