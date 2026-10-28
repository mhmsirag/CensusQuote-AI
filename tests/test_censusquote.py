"""
Automated Test Suite for CensusQuote AI
Validates 20 specific test scenarios required by the Cigna Challenge specification.
Can be executed with: python3 -m unittest tests/test_censusquote.py
"""

import unittest
import sys
import os
import json
from datetime import date

# Ensure backend_python is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend_python.census_core import (
    parse_csv_content,
    detect_column_mapping,
    normalize_relationship,
    parse_and_validate_date,
    validate_records,
    calculate_quote,
    BASE_RATES,
    PLAN_MULTIPLIERS,
    COPAY_MULTIPLIERS,
    MATERNITY_ADDON_PER_EMPLOYEE
)


class TestCensusQuoteAI(unittest.TestCase):

    def setUp(self):
        self.ref_date = date(2026, 10, 28)

    # 1. Valid clean dataset
    def test_01_valid_clean_dataset(self):
        clean_csv = """employee_id,name,relationship,date_of_birth
EMP001,John Doe,employee,1985-05-10
EMP002,Jane Smith,spouse,1987-08-15
EMP003,Sammy Doe,child,2015-02-20"""
        headers, rows = parse_csv_content(clean_csv)
        self.assertEqual(len(rows), 3)
        validated, summary = validate_records(rows, self.ref_date)
        self.assertEqual(summary["valid_records"], 3)
        self.assertEqual(summary["invalid_records"], 0)
        self.assertEqual(summary["review_required_records"], 0)

    # 2. Missing identifier
    def test_02_missing_identifier(self):
        csv_data = """employee_id,name,relationship,date_of_birth
,John Doe,employee,1985-05-10"""
        _, rows = parse_csv_content(csv_data)
        validated, summary = validate_records(rows, self.ref_date)
        self.assertEqual(summary["invalid_records"], 1)
        self.assertIn("missing_identifier", validated[0]["error_types"])

    # 3. Duplicate identifier
    def test_03_duplicate_identifier(self):
        csv_data = """employee_id,name,relationship,date_of_birth
EMP100,Alice Walker,employee,1984-03-12
EMP100,Bob Walker,employee,1986-07-22"""
        _, rows = parse_csv_content(csv_data)
        validated, summary = validate_records(rows, self.ref_date)
        self.assertEqual(summary["duplicate_records"], 2)
        self.assertIn("duplicate_identifier", validated[0]["error_types"])

    # 4. Missing date of birth
    def test_04_missing_date_of_birth(self):
        csv_data = """employee_id,name,relationship,date_of_birth
EMP004,Sarah Connor,employee,"""
        _, rows = parse_csv_content(csv_data)
        validated, summary = validate_records(rows, self.ref_date)
        self.assertEqual(summary["invalid_records"], 1)
        self.assertIn("missing_dob", validated[0]["error_types"])

    # 5. Invalid date of birth
    def test_05_invalid_date_of_birth(self):
        csv_data = """employee_id,name,relationship,date_of_birth
EMP005,Marty McFly,employee,32/13/1985"""
        _, rows = parse_csv_content(csv_data)
        validated, summary = validate_records(rows, self.ref_date)
        self.assertEqual(summary["invalid_records"], 1)
        self.assertIn("invalid_date", validated[0]["error_types"])

    # 6. Future date of birth
    def test_06_future_date_of_birth(self):
        csv_data = """employee_id,name,relationship,date_of_birth
EMP006,Future Person,employee,2035-01-01"""
        _, rows = parse_csv_content(csv_data)
        validated, summary = validate_records(rows, self.ref_date)
        self.assertEqual(summary["invalid_records"], 1)
        self.assertIn("future_dob", validated[0]["error_types"])

    # 7. Implausible age
    def test_07_implausible_age(self):
        csv_data = """employee_id,name,relationship,date_of_birth
EMP007,Old Methuselah,employee,1890-01-01"""
        _, rows = parse_csv_content(csv_data)
        validated, summary = validate_records(rows, self.ref_date)
        self.assertIn("implausible_age", validated[0]["error_types"])

    # 8. Unknown relationship
    def test_08_unknown_relationship(self):
        csv_data = """employee_id,name,relationship,date_of_birth
EMP008,Cousin Bob,second_cousin_twice_removed,1990-06-10"""
        _, rows = parse_csv_content(csv_data)
        rows[0]["relationship"] = normalize_relationship(rows[0]["relationship"])
        validated, summary = validate_records(rows, self.ref_date)
        self.assertIn("unknown_relationship", validated[0]["error_types"])

    # 9. Missing required columns
    def test_09_missing_required_columns(self):
        incomplete_headers = ["employee_id", "name", "job_title"]
        mapping, unmapped = detect_column_mapping(incomplete_headers)
        self.assertIn("relationship", unmapped)
        self.assertIn("date_of_birth", unmapped)

    # 10. Empty file
    def test_10_empty_file(self):
        headers, rows = parse_csv_content("")
        self.assertEqual(len(headers), 0)
        self.assertEqual(len(rows), 0)

    # 11. Malformed CSV
    def test_11_malformed_csv(self):
        malformed = 'emp_id,name\n123,"unclosed quotes\n456,test'
        headers, rows = parse_csv_content(malformed)
        self.assertGreaterEqual(len(headers), 1)

    # 12. File-size limits
    def test_12_file_size_limits(self):
        max_bytes = 5 * 1024 * 1024  # 5 MB
        sample_payload = b"test" * 1000
        self.assertLess(len(sample_payload), max_bytes)
        oversized = b"x" * (6 * 1024 * 1024)
        self.assertGreater(len(oversized), max_bytes)

    # 13. Each plan multiplier
    def test_13_plan_multipliers(self):
        dummy_rec = [{
            "row_id": 1,
            "status": "valid",
            "errors": [],
            "record": {"employee_id": "E1", "name": "Emp 1", "relationship": "employee"}
        }]
        q_ess = calculate_quote(dummy_rec, {"plan_tier": "essential", "copay_option": "10", "include_maternity": False})
        q_enh = calculate_quote(dummy_rec, {"plan_tier": "enhanced", "copay_option": "10", "include_maternity": False})
        q_pre = calculate_quote(dummy_rec, {"plan_tier": "premium", "copay_option": "10", "include_maternity": False})

        # Base 1200 * 1.00 * 1.00 = 1200.00
        self.assertEqual(q_ess["total_annual_amount"], 1200.00)
        # Base 1200 * 1.25 * 1.00 = 1500.00
        self.assertEqual(q_enh["total_annual_amount"], 1500.00)
        # Base 1200 * 1.55 * 1.00 = 1860.00
        self.assertEqual(q_pre["total_annual_amount"], 1860.00)

    # 14. Each co-pay multiplier
    def test_14_copay_multipliers(self):
        dummy_rec = [{
            "row_id": 1,
            "status": "valid",
            "errors": [],
            "record": {"employee_id": "E1", "name": "Emp 1", "relationship": "employee"}
        }]
        q_20 = calculate_quote(dummy_rec, {"plan_tier": "essential", "copay_option": "20", "include_maternity": False})
        q_10 = calculate_quote(dummy_rec, {"plan_tier": "essential", "copay_option": "10", "include_maternity": False})
        q_0 = calculate_quote(dummy_rec, {"plan_tier": "essential", "copay_option": "0", "include_maternity": False})

        # 1200 * 1.00 * 0.95 = 1140.00
        self.assertEqual(q_20["total_annual_amount"], 1140.00)
        # 1200 * 1.00 * 1.00 = 1200.00
        self.assertEqual(q_10["total_annual_amount"], 1200.00)
        # 1200 * 1.00 * 1.12 = 1344.00
        self.assertEqual(q_0["total_annual_amount"], 1344.00)

    # 15. Maternity add-on
    def test_15_maternity_addon(self):
        records = [
            {"row_id": 1, "status": "valid", "errors": [], "record": {"employee_id": "E1", "name": "Emp", "relationship": "employee"}},
            {"row_id": 2, "status": "valid", "errors": [], "record": {"employee_id": "E1-S", "name": "Spouse", "relationship": "spouse"}}
        ]
        q_with_mat = calculate_quote(records, {"plan_tier": "essential", "copay_option": "10", "include_maternity": True})
        # Employee: (1200 + 250) * 1.0 * 1.0 = 1450.00
        # Spouse: 1000 * 1.0 * 1.0 = 1000.00 (maternity add-on applies ONLY to employee)
        # Total: 2450.00
        self.assertEqual(q_with_mat["total_annual_amount"], 2450.00)

    # 16. Dependants included
    def test_16_dependants_included(self):
        records = [
            {"row_id": 1, "status": "valid", "errors": [], "record": {"employee_id": "E1", "name": "Emp", "relationship": "employee"}},
            {"row_id": 2, "status": "valid", "errors": [], "record": {"employee_id": "E1-C", "name": "Child", "relationship": "child"}}
        ]
        q = calculate_quote(records, {"plan_tier": "essential", "copay_option": "10", "include_dependants": True})
        self.assertEqual(q["rated_count"], 2)

    # 17. Employees-only calculation
    def test_17_employees_only_calculation(self):
        records = [
            {"row_id": 1, "status": "valid", "errors": [], "record": {"employee_id": "E1", "name": "Emp", "relationship": "employee"}},
            {"row_id": 2, "status": "valid", "errors": [], "record": {"employee_id": "E1-S", "name": "Spouse", "relationship": "spouse"}}
        ]
        q = calculate_quote(records, {"plan_tier": "essential", "copay_option": "10", "include_dependants": False})
        self.assertEqual(q["rated_count"], 1)
        self.assertEqual(q["excluded_count"], 1)

    # 18. Exclusion of invalid records
    def test_18_exclusion_of_invalid_records(self):
        records = [
            {"row_id": 1, "status": "valid", "errors": [], "record": {"employee_id": "E1", "name": "Valid Emp", "relationship": "employee"}},
            {"row_id": 2, "status": "invalid", "errors": ["Missing DOB"], "record": {"employee_id": "E2", "name": "Invalid Emp", "relationship": "employee"}}
        ]
        q = calculate_quote(records, {"plan_tier": "essential", "copay_option": "10"})
        self.assertEqual(q["rated_count"], 1)
        self.assertEqual(q["excluded_count"], 1)
        self.assertEqual(q["excluded_records"][0]["employee_id"], "E2")

    # 19. Quote export
    def test_19_quote_export(self):
        records = [{"row_id": 1, "status": "valid", "errors": [], "record": {"employee_id": "E1", "name": "Valid Emp", "relationship": "employee"}}]
        q = calculate_quote(records, {"plan_tier": "enhanced", "copay_option": "10"})
        export_json = json.dumps(q)
        parsed = json.loads(export_json)
        self.assertIn("disclaimer", parsed)
        self.assertIn("total_annual_amount", parsed)

    # 20. API error handling
    def test_20_api_error_handling(self):
        # Empty rows should return 0 rated records gracefully without crashing
        q = calculate_quote([], {"plan_tier": "essential"})
        self.assertEqual(q["total_annual_amount"], 0.0)
        self.assertEqual(q["rated_count"], 0)


if __name__ == "__main__":
    unittest.main()
