"""
CensusQuote AI - Python Core Engine
Deterministic CSV parsing, normalizer, validator, and illustrative pricing engine.
Adheres strictly to Cigna 'The Quote in Seconds Challenge' specifications.
All premium figures are illustrative demonstration values.
"""

import csv
import io
import re
from datetime import datetime, date
from typing import List, Dict, Any, Tuple, Optional

BASE_RATES = {
    "employee": 1200.00,
    "spouse": 1000.00,
    "child": 600.00,
    "other": 900.00,
    "unknown": 0.00
}

PLAN_MULTIPLIERS = {
    "essential": 1.00,
    "enhanced": 1.25,
    "premium": 1.55
}

COPAY_MULTIPLIERS = {
    "20": 0.95,
    "10": 1.00,
    "0": 1.12
}

MATERNITY_ADDON_PER_EMPLOYEE = 250.00

RELATIONSHIP_MAP = {
    "employee": "employee", "staff": "employee", "primary": "employee",
    "subscriber": "employee", "self": "employee", "emp": "employee",
    "worker": "employee", "member": "employee", "owner": "employee",
    "spouse": "spouse", "husband": "spouse", "wife": "spouse", "partner": "spouse",
    "child": "child", "son": "child", "daughter": "child", "kid": "child",
    "infant": "child", "minor": "child",
    "other": "other", "parent": "other", "father": "other", "mother": "other",
    "dependent": "other", "dependant": "other"
}

COLUMN_ALIASES = {
    "employee_id": ["employee_id", "employee id", "empid", "id", "member_id", "member id", "staff_id"],
    "name": ["name", "employee_name", "full_name", "employee name", "full name", "member_name"],
    "relationship": ["relationship", "relation", "member_type", "member type", "role_type", "rel"],
    "date_of_birth": ["date_of_birth", "dob", "birth_date", "birthdate", "date of birth", "birthday"],
    "job_title": ["job_title", "job title", "role", "designation", "position", "title"],
    "department": ["department", "dept", "division", "unit"],
    "location": ["location", "branch", "city", "emirate", "work_location", "office"]
}


def normalize_relationship(raw: str) -> str:
    if not raw:
        return "unknown"
    clean = re.sub(r"[-_\s]+", "", raw.strip().lower())
    for key, normalized in RELATIONSHIP_MAP.items():
        if clean == re.sub(r"[-_\s]+", "", key):
            return normalized
    return "unknown"


def parse_and_validate_date(raw_date: str, ref_date: Optional[date] = None) -> Tuple[Optional[str], bool, bool, Optional[int]]:
    if not raw_date or not raw_date.strip() or raw_date.strip().lower() == "null":
        return None, False, False, None
    if ref_date is None:
        ref_date = date.today()

    s = raw_date.strip()
    year, month, day = None, None, None

    # YYYY-MM-DD or YYYY/MM/DD
    m1 = re.match(r"^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$", s)
    if m1:
        year, month, day = int(m1.group(1)), int(m1.group(2)), int(m1.group(3))
    else:
        # DD/MM/YYYY or DD-MM-YYYY
        m2 = re.match(r"^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$", s)
        if m2:
            p1, p2, p3 = int(m2.group(1)), int(m2.group(2)), int(m2.group(3))
            if p1 > 12:
                day, month, year = p1, p2, p3
            elif p2 > 12:
                month, day, year = p1, p2, p3
            else:
                day, month, year = p1, p2, p3

    if not year or not month or not day:
        return None, False, False, None

    try:
        dt = date(year, month, day)
    except ValueError:
        return None, False, False, None

    is_future = dt > ref_date
    iso_str = f"{year:04d}-{month:02d}-{day:02d}"

    age = None
    if not is_future:
        age = ref_date.year - year - ((ref_date.month, ref_date.day) < (month, day))

    return iso_str, True, is_future, age


def detect_column_mapping(headers: List[str]) -> Tuple[Dict[str, str], List[str]]:
    mapping = {}
    lower_map = {h.strip().lower(): h for h in headers}

    required = ["employee_id", "name", "relationship", "date_of_birth"]
    optional = ["job_title", "department", "location"]

    for field in required + optional:
        aliases = COLUMN_ALIASES[field]
        for candidate in aliases:
            if candidate in lower_map:
                mapping[field] = lower_map[candidate]
                break

    unmapped = [f for f in required if f not in mapping]
    return mapping, unmapped


def parse_csv_content(csv_text: str) -> Tuple[List[str], List[Dict[str, str]]]:
    clean = csv_text.strip().lstrip("\ufeff")
    if not clean:
        return [], []
    reader = csv.reader(io.StringIO(clean))
    rows = list(reader)
    if not rows:
        return [], []
    headers = [h.strip() for h in rows[0]]
    records = []
    for row in rows[1:]:
        if not any(cell.strip() for cell in row):
            continue
        row_dict = {}
        for idx, h in enumerate(headers):
            row_dict[h] = row[idx].strip() if idx < len(row) else ""
        records.append(row_dict)
    return headers, records


def validate_records(records: List[Dict[str, Any]], ref_date: Optional[date] = None) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    if ref_date is None:
        ref_date = date.today()

    id_counts = {}
    fingerprints = {}

    for idx, r in enumerate(records):
        emp_id = (r.get("employee_id") or "").strip().upper()
        if emp_id:
            id_counts.setdefault(emp_id, []).append(idx + 1)
        fp = f"{emp_id}|{(r.get('name') or '').strip().lower()}|{r.get('relationship')}|{(r.get('date_of_birth') or '').strip()}".lower()
        fingerprints.setdefault(fp, []).append(idx + 1)

    validated = []
    error_counts = {
        "missing_identifier": 0, "duplicate_identifier": 0, "missing_name": 0,
        "missing_dob": 0, "invalid_date": 0, "future_dob": 0, "implausible_age": 0,
        "unknown_relationship": 0, "missing_required_fields": 0, "duplicate_record": 0
    }

    valid_c, review_c, invalid_c, dup_c, missing_c = 0, 0, 0, 0, 0

    for idx, r in enumerate(records):
        row_id = idx + 1
        errors, error_types, warnings = [], [], []

        emp_id = (r.get("employee_id") or "").strip()
        if not emp_id:
            errors.append("Missing member/employee identifier")
            error_types.append("missing_identifier")
            missing_c += 1
        else:
            dups = id_counts.get(emp_id.upper(), [])
            if len(dups) > 1:
                fp = f"{emp_id.upper()}|{(r.get('name') or '').strip().lower()}|{r.get('relationship')}|{(r.get('date_of_birth') or '').strip()}".lower()
                identical = fingerprints.get(fp, [])
                if len(identical) > 1:
                    errors.append(f"Exact duplicate record found (matches rows {[x for x in identical if x != row_id]})")
                    error_types.append("duplicate_record")
                    dup_c += 1
                else:
                    errors.append(f"Duplicate employee identifier reused in other rows")
                    error_types.append("duplicate_identifier")
                    dup_c += 1

        name = (r.get("name") or "").strip()
        if not name:
            errors.append("Missing member full name")
            error_types.append("missing_name")
            missing_c += 1

        dob_raw = (r.get("date_of_birth") or "").strip()
        if not dob_raw:
            errors.append("Missing date of birth")
            error_types.append("missing_dob")
            missing_c += 1
        else:
            iso, is_valid, is_future, age = parse_and_validate_date(dob_raw, ref_date)
            if not is_valid:
                errors.append(f"Invalid date of birth format: '{dob_raw}'")
                error_types.append("invalid_date")
            elif is_future:
                errors.append(f"Date of birth cannot be in the future ({iso})")
                error_types.append("future_dob")
            elif age is not None:
                if age > 110:
                    errors.append(f"Implausible age ({age}) exceeds 110-year limit")
                    error_types.append("implausible_age")
                elif age < 0:
                    errors.append("Computed age cannot be negative")
                    error_types.append("implausible_age")

        rel = r.get("relationship", "unknown")
        if rel == "unknown":
            errors.append("Unknown or non-standard relationship category")
            error_types.append("unknown_relationship")

        for et in error_types:
            error_counts[et] = error_counts.get(et, 0) + 1

        hard_blockers = {"missing_identifier", "missing_name", "missing_dob", "invalid_date", "future_dob", "duplicate_record"}
        has_blocker = any(et in hard_blockers for et in error_types)

        if has_blocker:
            status = "invalid"
            invalid_c += 1
        elif len(errors) > 0:
            status = "review_required"
            review_c += 1
        else:
            status = "valid"
            valid_c += 1

        validated.append({
            "row_id": row_id,
            "record": r,
            "status": status,
            "errors": errors,
            "error_types": error_types,
            "warnings": warnings,
            "is_eligible_for_quote": (status == "valid")
        })

    summary = {
        "total_records": len(records),
        "valid_records": valid_c,
        "review_required_records": review_c,
        "invalid_records": invalid_c,
        "duplicate_records": dup_c,
        "missing_field_errors": missing_c,
        "eligible_for_quote": valid_c,
        "error_breakdown": error_counts
    }
    return validated, summary


def calculate_quote(validated_records: List[Dict[str, Any]], config: Dict[str, Any]) -> Dict[str, Any]:
    plan_tier = config.get("plan_tier", "essential")
    copay_opt = str(config.get("copay_option", "10"))
    inc_maternity = bool(config.get("include_maternity", False))
    inc_dependants = bool(config.get("include_dependants", True))

    plan_mult = PLAN_MULTIPLIERS.get(plan_tier, 1.0)
    copay_mult = COPAY_MULTIPLIERS.get(copay_opt, 1.0)

    line_items = []
    excluded = []
    total_annual = 0.0

    subtotals = {
        "employee": {"count": 0, "annual_subtotal": 0.0},
        "spouse": {"count": 0, "annual_subtotal": 0.0},
        "child": {"count": 0, "annual_subtotal": 0.0},
        "other": {"count": 0, "annual_subtotal": 0.0}
    }

    for item in validated_records:
        rec = item["record"]
        if item["status"] != "valid":
            excluded.append({
                "row_id": item["row_id"],
                "employee_id": rec.get("employee_id"),
                "reason": "Excluded: Record is invalid or requires human review",
                "errors": item["errors"]
            })
            continue

        rel = rec.get("relationship", "employee")
        if not inc_dependants and rel != "employee":
            excluded.append({
                "row_id": item["row_id"],
                "employee_id": rec.get("employee_id"),
                "reason": "Excluded: Dependants excluded by configuration"
            })
            continue

        base = BASE_RATES.get(rel, 0.0)
        mat = MATERNITY_ADDON_PER_EMPLOYEE if (inc_maternity and rel == "employee") else 0.0

        annual = round((base + mat) * plan_mult * copay_mult, 2)
        monthly = round(annual / 12.0, 2)
        total_annual = round(total_annual + annual, 2)

        if rel in subtotals:
            subtotals[rel]["count"] += 1
            subtotals[rel]["annual_subtotal"] = round(subtotals[rel]["annual_subtotal"] + annual, 2)

        line_items.append({
            "row_id": item["row_id"],
            "employee_id": rec.get("employee_id"),
            "name": rec.get("name"),
            "relationship": rel,
            "base_amount": base,
            "maternity_amount": mat,
            "annual_amount": annual,
            "monthly_amount": monthly
        })

    return {
        "quote_reference": f"CQ-PY-{int(datetime.now().timestamp())}",
        "total_annual_amount": total_annual,
        "total_monthly_amount": round(total_annual / 12.0, 2),
        "currency": "AED",
        "rated_count": len(line_items),
        "excluded_count": len(excluded),
        "subtotals": subtotals,
        "line_items": line_items,
        "excluded_records": excluded,
        "disclaimer": "Illustrative demonstration amounts — not an insurer quote."
    }
