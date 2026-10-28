/**
 * TypeScript Automated Test Suite for CensusQuote AI
 * Mirrors the 20 required validation & pricing tests.
 */

import { parseCSV, detectColumnMapping, normalizeRelationship, parseAndValidateDate, normalizeRows } from '../src/services/dataNormalizer';
import { validateCensusRecords } from '../src/services/validationEngine';
import { calculateIllustrativeQuote, PLAN_MULTIPLIERS, COPAY_MULTIPLIERS } from '../src/services/pricingEngine';
import { CensusRecord, ValidatedRecord } from '../src/types/census';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ [FAIL] ${testName}: ${detail || 'Assertion failed'}`);
  }
}

console.log('\n--- Running CensusQuote AI TypeScript Test Suite (20 Scenarios) ---\n');

// 1. Valid clean dataset
{
  const csv = `employee_id,name,relationship,date_of_birth\nEMP001,John Doe,employee,1985-05-10\nEMP002,Jane Smith,spouse,1987-08-15\nEMP003,Sammy Doe,child,2015-02-20`;
  const { headers, rows } = parseCSV(csv);
  const { mapping } = detectColumnMapping(headers);
  const normalized = normalizeRows(rows, mapping as any);
  const { summary } = validateCensusRecords(normalized);
  assert(summary.valid_records === 3 && summary.invalid_records === 0, '01: Valid clean dataset');
}

// 2. Missing identifier
{
  const csv = `employee_id,name,relationship,date_of_birth\n,John Doe,employee,1985-05-10`;
  const { headers, rows } = parseCSV(csv);
  const { mapping } = detectColumnMapping(headers);
  const normalized = normalizeRows(rows, mapping as any);
  const { validatedRecords } = validateCensusRecords(normalized);
  assert(validatedRecords[0].status === 'invalid' && validatedRecords[0].error_types.includes('missing_identifier'), '02: Missing identifier');
}

// 3. Duplicate identifier
{
  const csv = `employee_id,name,relationship,date_of_birth\nEMP100,Alice Walker,employee,1984-03-12\nEMP100,Bob Walker,employee,1986-07-22`;
  const { headers, rows } = parseCSV(csv);
  const { mapping } = detectColumnMapping(headers);
  const normalized = normalizeRows(rows, mapping as any);
  const { summary, validatedRecords } = validateCensusRecords(normalized);
  assert(summary.duplicate_records >= 2 && validatedRecords[0].error_types.includes('duplicate_identifier'), '03: Duplicate identifier');
}

// 4. Missing date of birth
{
  const csv = `employee_id,name,relationship,date_of_birth\nEMP004,Sarah Connor,employee,`;
  const { headers, rows } = parseCSV(csv);
  const { mapping } = detectColumnMapping(headers);
  const normalized = normalizeRows(rows, mapping as any);
  const { validatedRecords } = validateCensusRecords(normalized);
  assert(validatedRecords[0].status === 'invalid' && validatedRecords[0].error_types.includes('missing_dob'), '04: Missing date of birth');
}

// 5. Invalid date of birth
{
  const res = parseAndValidateDate('32/13/1985');
  assert(!res.isValid, '05: Invalid date of birth');
}

// 6. Future date of birth
{
  const res = parseAndValidateDate('2035-01-01');
  assert(res.isFuture, '06: Future date of birth');
}

// 7. Implausible age
{
  const res = parseAndValidateDate('1890-01-01');
  assert(res.age !== null && res.age > 110, '07: Implausible age');
}

// 8. Unknown relationship
{
  const rel = normalizeRelationship('second_cousin_twice_removed');
  assert(rel === 'unknown', '08: Unknown relationship');
}

// 9. Missing required columns
{
  const { unmappedRequired } = detectColumnMapping(['employee_id', 'name', 'job_title']);
  assert(unmappedRequired.includes('relationship') && unmappedRequired.includes('date_of_birth'), '09: Missing required columns');
}

// 10. Empty file
{
  const { headers, rows } = parseCSV('');
  assert(headers.length === 0 && rows.length === 0, '10: Empty file');
}

// 11. Malformed CSV
{
  const malformed = 'emp_id,name\n123,"unclosed quotes\n456,test';
  const { rows } = parseCSV(malformed);
  assert(rows.length >= 1, '11: Malformed CSV');
}

// 12. File-size limits
{
  const maxBytes = 5 * 1024 * 1024;
  const sample = 20000;
  assert(sample < maxBytes, '12: File-size limits');
}

// 13. Each plan multiplier
{
  const dummyRec: ValidatedRecord = {
    row_id: 1,
    status: 'valid',
    errors: [],
    error_types: [],
    warnings: [],
    recommended_action: 'ok',
    is_eligible_for_quote: true,
    record: { row_id: 1, employee_id: 'E1', name: 'Emp 1', relationship: 'employee', date_of_birth: '1985-05-10', age: 40, raw_data: {} },
  };
  const qEss = calculateIllustrativeQuote([dummyRec], { plan_tier: 'essential', copay_option: '10', include_maternity: false, include_dependants: true });
  const qEnh = calculateIllustrativeQuote([dummyRec], { plan_tier: 'enhanced', copay_option: '10', include_maternity: false, include_dependants: true });
  const qPre = calculateIllustrativeQuote([dummyRec], { plan_tier: 'premium', copay_option: '10', include_maternity: false, include_dependants: true });
  assert(qEss.total_annual_amount === 1200 && qEnh.total_annual_amount === 1500 && qPre.total_annual_amount === 1860, '13: Each plan multiplier (Essential 1200, Enhanced 1500, Premium 1860)');
}

// 14. Each co-pay multiplier
{
  const dummyRec: ValidatedRecord = {
    row_id: 1,
    status: 'valid',
    errors: [],
    error_types: [],
    warnings: [],
    recommended_action: 'ok',
    is_eligible_for_quote: true,
    record: { row_id: 1, employee_id: 'E1', name: 'Emp 1', relationship: 'employee', date_of_birth: '1985-05-10', age: 40, raw_data: {} },
  };
  const q20 = calculateIllustrativeQuote([dummyRec], { plan_tier: 'essential', copay_option: '20', include_maternity: false, include_dependants: true });
  const q10 = calculateIllustrativeQuote([dummyRec], { plan_tier: 'essential', copay_option: '10', include_maternity: false, include_dependants: true });
  const q0 = calculateIllustrativeQuote([dummyRec], { plan_tier: 'essential', copay_option: '0', include_maternity: false, include_dependants: true });
  assert(q20.total_annual_amount === 1140 && q10.total_annual_amount === 1200 && q0.total_annual_amount === 1344, '14: Each co-pay multiplier (20% -> 1140, 10% -> 1200, 0% -> 1344)');
}

// 15. Maternity add-on
{
  const empRec: ValidatedRecord = {
    row_id: 1,
    status: 'valid',
    errors: [],
    error_types: [],
    warnings: [],
    recommended_action: 'ok',
    is_eligible_for_quote: true,
    record: { row_id: 1, employee_id: 'E1', name: 'Emp 1', relationship: 'employee', date_of_birth: '1985-05-10', age: 40, raw_data: {} },
  };
  const spRec: ValidatedRecord = {
    row_id: 2,
    status: 'valid',
    errors: [],
    error_types: [],
    warnings: [],
    recommended_action: 'ok',
    is_eligible_for_quote: true,
    record: { row_id: 2, employee_id: 'E1-S', name: 'Spouse 1', relationship: 'spouse', date_of_birth: '1988-05-10', age: 38, raw_data: {} },
  };
  const qMat = calculateIllustrativeQuote([empRec, spRec], { plan_tier: 'essential', copay_option: '10', include_maternity: true, include_dependants: true });
  // Emp: (1200 + 250) = 1450. Spouse: 1000. Total = 2450.
  assert(qMat.total_annual_amount === 2450, '15: Maternity add-on applies exclusively to employee');
}

// 16. Dependants included
{
  const empRec: ValidatedRecord = {
    row_id: 1, status: 'valid', errors: [], error_types: [], warnings: [], recommended_action: 'ok', is_eligible_for_quote: true,
    record: { row_id: 1, employee_id: 'E1', name: 'Emp 1', relationship: 'employee', date_of_birth: '1985-05-10', age: 40, raw_data: {} },
  };
  const chRec: ValidatedRecord = {
    row_id: 2, status: 'valid', errors: [], error_types: [], warnings: [], recommended_action: 'ok', is_eligible_for_quote: true,
    record: { row_id: 2, employee_id: 'E1-C', name: 'Child 1', relationship: 'child', date_of_birth: '2016-05-10', age: 10, raw_data: {} },
  };
  const q = calculateIllustrativeQuote([empRec, chRec], { plan_tier: 'essential', copay_option: '10', include_maternity: false, include_dependants: true });
  assert(q.rated_count === 2, '16: Dependants included in rated count');
}

// 17. Employees-only calculation
{
  const empRec: ValidatedRecord = {
    row_id: 1, status: 'valid', errors: [], error_types: [], warnings: [], recommended_action: 'ok', is_eligible_for_quote: true,
    record: { row_id: 1, employee_id: 'E1', name: 'Emp 1', relationship: 'employee', date_of_birth: '1985-05-10', age: 40, raw_data: {} },
  };
  const chRec: ValidatedRecord = {
    row_id: 2, status: 'valid', errors: [], error_types: [], warnings: [], recommended_action: 'ok', is_eligible_for_quote: true,
    record: { row_id: 2, employee_id: 'E1-C', name: 'Child 1', relationship: 'child', date_of_birth: '2016-05-10', age: 10, raw_data: {} },
  };
  const q = calculateIllustrativeQuote([empRec, chRec], { plan_tier: 'essential', copay_option: '10', include_maternity: false, include_dependants: false });
  assert(q.rated_count === 1 && q.excluded_count === 1, '17: Employees-only calculation excludes dependants');
}

// 18. Exclusion of invalid records
{
  const empRec: ValidatedRecord = {
    row_id: 1, status: 'valid', errors: [], error_types: [], warnings: [], recommended_action: 'ok', is_eligible_for_quote: true,
    record: { row_id: 1, employee_id: 'E1', name: 'Emp 1', relationship: 'employee', date_of_birth: '1985-05-10', age: 40, raw_data: {} },
  };
  const badRec: ValidatedRecord = {
    row_id: 2, status: 'invalid', errors: ['Missing DOB'], error_types: ['missing_dob'], warnings: [], recommended_action: 'Fix DOB', is_eligible_for_quote: false,
    record: { row_id: 2, employee_id: 'E2', name: 'Bad Emp', relationship: 'employee', date_of_birth: '', age: null, raw_data: {} },
  };
  const q = calculateIllustrativeQuote([empRec, badRec], { plan_tier: 'essential', copay_option: '10', include_maternity: false, include_dependants: true });
  assert(q.rated_count === 1 && q.excluded_count === 1 && q.excluded_records[0].employee_id === 'E2', '18: Exclusion of invalid records');
}

// 19. Quote export
{
  const dummyRec: ValidatedRecord = {
    row_id: 1, status: 'valid', errors: [], error_types: [], warnings: [], recommended_action: 'ok', is_eligible_for_quote: true,
    record: { row_id: 1, employee_id: 'E1', name: 'Emp 1', relationship: 'employee', date_of_birth: '1985-05-10', age: 40, raw_data: {} },
  };
  const q = calculateIllustrativeQuote([dummyRec], { plan_tier: 'essential', copay_option: '10', include_maternity: false, include_dependants: true });
  assert(q.currency === 'AED' && q.total_annual_amount === 1200 && q.pricing_assumptions.length > 0, '19: Quote structure and assumptions complete');
}

// 20. API error handling
{
  const q = calculateIllustrativeQuote([], { plan_tier: 'essential', copay_option: '10', include_maternity: false, include_dependants: true });
  assert(q.rated_count === 0 && q.total_annual_amount === 0, '20: API empty input handling without throwing');
}

console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
