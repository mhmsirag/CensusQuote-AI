/**
 * Census Data Normalizer
 * Handles CSV parsing, column alias mapping, and field normalization.
 */

import { CensusRecord, RelationshipType } from '../types/census';

export interface ColumnMapping {
  employee_id: string;
  name: string;
  relationship: string;
  date_of_birth: string;
  job_title?: string;
  department?: string;
  location?: string;
}

const ALIASES: Record<keyof ColumnMapping, string[]> = {
  employee_id: [
    'employee_id',
    'employee id',
    'empid',
    'id',
    'member_id',
    'member id',
    'staff_id',
    'staff id',
    'employee_number',
    'emp_id',
    'badge_id',
  ],
  name: [
    'name',
    'employee_name',
    'full_name',
    'employee name',
    'full name',
    'member_name',
    'member name',
    'worker_name',
  ],
  relationship: [
    'relationship',
    'relation',
    'member_type',
    'member type',
    'role_type',
    'dependent_type',
    'rel',
    'coverage_type',
  ],
  date_of_birth: [
    'date_of_birth',
    'dob',
    'birth_date',
    'birthdate',
    'date of birth',
    'birth_day',
    'birthday',
    'birth date',
  ],
  job_title: [
    'job_title',
    'job title',
    'role',
    'designation',
    'position',
    'title',
    'occupation',
  ],
  department: [
    'department',
    'dept',
    'division',
    'unit',
    'business_unit',
    'team',
  ],
  location: [
    'location',
    'branch',
    'city',
    'emirate',
    'work_location',
    'office',
    'site',
  ],
};

const RELATIONSHIP_MAP: Record<string, RelationshipType> = {
  employee: 'employee',
  staff: 'employee',
  primary: 'employee',
  subscriber: 'employee',
  self: 'employee',
  emp: 'employee',
  worker: 'employee',
  member: 'employee',
  owner: 'employee',
  spouse: 'spouse',
  husband: 'spouse',
  wife: 'spouse',
  partner: 'spouse',
  child: 'child',
  son: 'child',
  daughter: 'child',
  kid: 'child',
  infant: 'child',
  minor: 'child',
  other: 'other',
  parent: 'other',
  father: 'other',
  mother: 'other',
  dependent: 'other',
  dependant: 'other',
};

/**
 * Robust RFC-compliant CSV parser handling quoted fields, commas, and linebreaks
 */
export function parseCSV(csvText: string): { headers: string[]; rows: Record<string, string>[] } {
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  if (!cleanText) {
    return { headers: [], rows: [] };
  }

  const lines = parseCSVLines(cleanText);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = lines[0].map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i];
    // Skip empty lines
    if (values.length === 1 && values[0].trim() === '') continue;

    const rowObj: Record<string, string> = {};
    rawHeaders.forEach((header, index) => {
      rowObj[header] = values[index] !== undefined ? values[index].trim() : '';
    });
    rows.push(rowObj);
  }

  return { headers: rawHeaders, rows };
}

function parseCSVLines(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF after CR
      }
      currentRow.push(currentVal);
      currentVal = '';
      if (currentRow.length > 0 && !(currentRow.length === 1 && currentRow[0] === '')) {
        lines.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  // Push final field/row if any
  currentRow.push(currentVal);
  if (currentRow.length > 0 && !(currentRow.length === 1 && currentRow[0] === '')) {
    lines.push(currentRow);
  }

  return lines;
}

/**
 * Automatically detects column mapping based on standard enterprise aliases
 */
export function detectColumnMapping(headers: string[]): {
  mapping: Partial<ColumnMapping>;
  unmappedRequired: (keyof ColumnMapping)[];
} {
  const mapping: Partial<ColumnMapping> = {};
  const lowerHeaders = headers.map((h) => ({ original: h, lower: h.toLowerCase().trim() }));

  const requiredFields: (keyof ColumnMapping)[] = [
    'employee_id',
    'name',
    'relationship',
    'date_of_birth',
  ];
  const optionalFields: (keyof ColumnMapping)[] = ['job_title', 'department', 'location'];
  const allFields = [...requiredFields, ...optionalFields];

  for (const field of allFields) {
    const candidates = ALIASES[field];
    const match = lowerHeaders.find((h) => candidates.includes(h.lower));
    if (match) {
      mapping[field] = match.original;
    }
  }

  const unmappedRequired = requiredFields.filter((f) => !mapping[f]);

  return { mapping, unmappedRequired };
}

/**
 * Normalizes relationship strings to valid enum values or 'unknown'
 */
export function normalizeRelationship(raw: string): RelationshipType {
  if (!raw) return 'unknown';
  const clean = raw.toLowerCase().trim().replace(/[-_\s]+/g, '');
  for (const [key, normalized] of Object.entries(RELATIONSHIP_MAP)) {
    if (clean === key.replace(/[-_\s]+/g, '')) {
      return normalized;
    }
  }
  return 'unknown';
}

/**
 * Robust date parser supporting YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, etc.
 * Returns { iso: 'YYYY-MM-DD' | null, isValid: boolean, isFuture: boolean, age: number | null }
 */
export function parseAndValidateDate(
  rawDate: string,
  referenceDate: Date = new Date()
): {
  iso: string | null;
  isValid: boolean;
  isFuture: boolean;
  age: number | null;
} {
  if (!rawDate || rawDate.trim() === '' || rawDate.toLowerCase() === 'null') {
    return { iso: null, isValid: false, isFuture: false, age: null };
  }

  const trimmed = rawDate.trim();
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  // Format 1: YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoMatch) {
    year = parseInt(isoMatch[1], 10);
    month = parseInt(isoMatch[2], 10);
    day = parseInt(isoMatch[3], 10);
  } else {
    // Format 2: DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
      const part1 = parseInt(dmyMatch[1], 10);
      const part2 = parseInt(dmyMatch[2], 10);
      const part3 = parseInt(dmyMatch[3], 10);

      // Distinguish DD/MM vs MM/DD: if part1 > 12, it must be DD/MM
      if (part1 > 12) {
        day = part1;
        month = part2;
        year = part3;
      } else if (part2 > 12) {
        month = part1;
        day = part2;
        year = part3;
      } else {
        // Default standard DD/MM/YYYY
        day = part1;
        month = part2;
        year = part3;
      }
    }
  }

  if (!year || !month || !day) {
    return { iso: null, isValid: false, isFuture: false, age: null };
  }

  // Validate day count in month
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { iso: null, isValid: false, isFuture: false, age: null };
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return { iso: null, isValid: false, isFuture: false, age: null };
  }

  const isFuture = parsed.getTime() > referenceDate.getTime();
  const iso = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`;

  // Age calculation
  let age: number | null = null;
  if (!isFuture) {
    let calculatedAge = referenceDate.getFullYear() - year;
    const m = referenceDate.getMonth() - (month - 1);
    if (m < 0 || (m === 0 && referenceDate.getDate() < day)) {
      calculatedAge--;
    }
    age = calculatedAge;
  }

  return { iso, isValid: true, isFuture, age };
}

/**
 * Transforms raw CSV rows into CensusRecord objects based on column mappings
 */
export function normalizeRows(
  rows: Record<string, string>[],
  mapping: ColumnMapping
): CensusRecord[] {
  return rows.map((raw, idx) => {
    const rawDob = mapping.date_of_birth ? raw[mapping.date_of_birth] || '' : '';
    const dateAnalysis = parseAndValidateDate(rawDob);
    const rawRel = mapping.relationship ? raw[mapping.relationship] || '' : '';

    return {
      row_id: idx + 1,
      employee_id: mapping.employee_id ? (raw[mapping.employee_id] || '').trim() : '',
      name: mapping.name ? (raw[mapping.name] || '').trim() : '',
      relationship: normalizeRelationship(rawRel),
      date_of_birth: dateAnalysis.iso || rawDob.trim(),
      age: dateAnalysis.age,
      job_title: mapping.job_title ? (raw[mapping.job_title] || '').trim() : undefined,
      department: mapping.department ? (raw[mapping.department] || '').trim() : undefined,
      location: mapping.location ? (raw[mapping.location] || '').trim() : undefined,
      raw_data: raw,
    };
  });
}
