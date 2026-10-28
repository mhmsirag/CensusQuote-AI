/**
 * Deterministic Data Validation Engine
 * Implements strict, explainable validation rules for SME census processing.
 */

import {
  CensusRecord,
  ValidatedRecord,
  ValidationSummary,
  ValidationErrorType,
} from '../types/census';
import { parseAndValidateDate } from './dataNormalizer';

export function validateCensusRecords(
  records: CensusRecord[],
  referenceDate: Date = new Date()
): {
  validatedRecords: ValidatedRecord[];
  summary: ValidationSummary;
} {
  const startTime = performance.now();

  // Step 1: Track ID occurrences and exact record occurrences for duplicate detection
  const idCounts = new Map<string, number[]>(); // id -> array of row_ids
  const recordFingerprints = new Map<string, number[]>(); // fingerprint -> array of row_ids

  records.forEach((rec) => {
    if (rec.employee_id && rec.employee_id.trim() !== '') {
      const cleanId = rec.employee_id.trim().toUpperCase();
      const existing = idCounts.get(cleanId) || [];
      existing.push(rec.row_id);
      idCounts.set(cleanId, existing);
    }

    const fingerprint = `${(rec.employee_id || '').trim()}|${(rec.name || '').trim()}|${rec.relationship}|${(rec.date_of_birth || '').trim()}`.toLowerCase();
    const fpExisting = recordFingerprints.get(fingerprint) || [];
    fpExisting.push(rec.row_id);
    recordFingerprints.set(fingerprint, fpExisting);
  });

  const errorCounts: Record<ValidationErrorType, number> = {
    missing_identifier: 0,
    duplicate_identifier: 0,
    missing_name: 0,
    missing_dob: 0,
    invalid_date: 0,
    future_dob: 0,
    implausible_age: 0,
    unknown_relationship: 0,
    missing_required_fields: 0,
    duplicate_record: 0,
  };

  let validCount = 0;
  let reviewCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let missingFieldCount = 0;
  let eligibleCount = 0;

  const validatedRecords: ValidatedRecord[] = records.map((rec) => {
    const errors: string[] = [];
    const errorTypes: ValidationErrorType[] = [];
    const warnings: string[] = [];

    // Rule 1: Check Employee/Member Identifier
    if (!rec.employee_id || rec.employee_id.trim() === '') {
      errors.push('Missing member/employee identifier');
      errorTypes.push('missing_identifier');
      missingFieldCount++;
    } else {
      const cleanId = rec.employee_id.trim().toUpperCase();
      const duplicateRowIds = idCounts.get(cleanId) || [];
      if (duplicateRowIds.length > 1) {
        const otherRows = duplicateRowIds.filter((r) => r !== rec.row_id);
        const fingerprint = `${(rec.employee_id || '').trim()}|${(rec.name || '').trim()}|${rec.relationship}|${(rec.date_of_birth || '').trim()}`.toLowerCase();
        const identicalRows = recordFingerprints.get(fingerprint) || [];

        if (identicalRows.length > 1) {
          errors.push(
            `Exact duplicate record found (matches row ${identicalRows.filter((r) => r !== rec.row_id).join(', ')})`
          );
          errorTypes.push('duplicate_record');
          duplicateCount++;
        } else {
          errors.push(
            `Duplicate employee identifier reused in row ${otherRows.join(', ')}`
          );
          errorTypes.push('duplicate_identifier');
          duplicateCount++;
        }
      }
    }

    // Rule 2: Check Name
    if (!rec.name || rec.name.trim() === '') {
      errors.push('Missing member full name');
      errorTypes.push('missing_name');
      missingFieldCount++;
    }

    // Rule 3: Check Date of Birth & Age
    if (!rec.date_of_birth || rec.date_of_birth.trim() === '') {
      errors.push('Missing date of birth');
      errorTypes.push('missing_dob');
      missingFieldCount++;
    } else {
      const dateAnalysis = parseAndValidateDate(rec.date_of_birth, referenceDate);
      if (!dateAnalysis.isValid) {
        errors.push(`Invalid date of birth format: "${rec.date_of_birth}" (expected YYYY-MM-DD or DD/MM/YYYY)`);
        errorTypes.push('invalid_date');
      } else if (dateAnalysis.isFuture) {
        errors.push(`Date of birth cannot be in the future (${dateAnalysis.iso})`);
        errorTypes.push('future_dob');
      } else if (dateAnalysis.age !== null) {
        if (dateAnalysis.age > 110) {
          errors.push(`Implausible age (${dateAnalysis.age} years old) exceeds 110-year threshold`);
          errorTypes.push('implausible_age');
        } else if (dateAnalysis.age < 0) {
          errors.push('Computed age cannot be negative');
          errorTypes.push('implausible_age');
        } else {
          // Contextual age warnings
          if (rec.relationship === 'employee') {
            if (dateAnalysis.age < 18) {
              warnings.push(
                `Employee age (${dateAnalysis.age}) is below typical UAE legal employment age (18)`
              );
            } else if (dateAnalysis.age > 75) {
              warnings.push(
                `Employee age (${dateAnalysis.age}) exceeds standard retirement age; underwriting review advised`
              );
            }
          } else if (rec.relationship === 'child') {
            if (dateAnalysis.age > 26) {
              warnings.push(
                `Child dependent age (${dateAnalysis.age}) exceeds 26; student/dependency status verification required`
              );
            }
          }
        }
      }
    }

    // Rule 4: Check Relationship Category
    if (rec.relationship === 'unknown') {
      const rawRel = rec.raw_data['relationship'] || rec.raw_data['relation'] || rec.raw_data['member_type'] || 'empty';
      errors.push(`Unknown or non-standard relationship category: "${rawRel}"`);
      errorTypes.push('unknown_relationship');
    }

    // Missing required fields flag if multiple critical items missing
    if (
      (!rec.employee_id || !rec.name || !rec.date_of_birth) &&
      !errorTypes.includes('missing_required_fields')
    ) {
      errorTypes.push('missing_required_fields');
    }

    // Update error counts
    errorTypes.forEach((t) => {
      errorCounts[t] = (errorCounts[t] || 0) + 1;
    });

    // Determine Status
    let status: ValidatedRecord['status'] = 'valid';
    let recommended_action = 'Record verified. Eligible for illustrative quoting.';

    // Hard blockers make record invalid
    const hardBlockerTypes: ValidationErrorType[] = [
      'missing_identifier',
      'missing_name',
      'missing_dob',
      'invalid_date',
      'future_dob',
      'duplicate_record',
    ];

    const hasHardBlocker = errorTypes.some((t) => hardBlockerTypes.includes(t));

    if (hasHardBlocker) {
      status = 'invalid';
      if (errorTypes.includes('missing_identifier')) {
        recommended_action = 'Assign a unique employee or dependent identifier.';
      } else if (errorTypes.includes('missing_name')) {
        recommended_action = 'Supply the full legal name of the member.';
      } else if (errorTypes.includes('missing_dob') || errorTypes.includes('invalid_date')) {
        recommended_action = 'Correct date of birth to a valid ISO format (YYYY-MM-DD).';
      } else if (errorTypes.includes('future_dob')) {
        recommended_action = 'Correct future birth date to historical date of birth.';
      } else if (errorTypes.includes('duplicate_record')) {
        recommended_action = 'Remove redundant duplicate row from census.';
      }
    } else if (errors.length > 0) {
      status = 'review_required';
      if (errorTypes.includes('duplicate_identifier')) {
        recommended_action = 'Investigate duplicated ID with HR and reassign unique ID.';
      } else if (errorTypes.includes('unknown_relationship')) {
        recommended_action = 'Confirm relationship category (employee, spouse, child, or other).';
      } else if (errorTypes.includes('implausible_age')) {
        recommended_action = 'Verify member date of birth with official government document.';
      }
    } else if (warnings.length > 0) {
      // Warnings do not block quote calculation, but are flagged
      recommended_action = 'Valid with advisory flags. Review policy age limits if needed.';
    }

    const is_eligible = status === 'valid';

    if (status === 'valid') validCount++;
    else if (status === 'review_required') reviewCount++;
    else invalidCount++;

    if (is_eligible) eligibleCount++;

    return {
      row_id: rec.row_id,
      record: rec,
      status,
      errors,
      error_types: errorTypes,
      warnings,
      recommended_action,
      is_eligible_for_quote: is_eligible,
    };
  });

  const duration = Math.round(performance.now() - startTime);

  const summary: ValidationSummary = {
    total_records: records.length,
    valid_records: validCount,
    review_required_records: reviewCount,
    invalid_records: invalidCount,
    duplicate_records: duplicateCount,
    missing_field_errors: missingFieldCount,
    eligible_for_quote: eligibleCount,
    validation_duration_ms: duration,
    error_breakdown: errorCounts,
  };

  return { validatedRecords, summary };
}
