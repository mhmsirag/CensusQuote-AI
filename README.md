# CensusQuote AI
### SME Census-to-Quote Automation | Concept Prototype
**Cigna "The Quote in Seconds Challenge" — SME Quoting at Scale**

> **STRICT TRUTH AND SAFETY NOTICE:**
> This application is an **independent concept prototype** developed solely for evaluating SME census processing and quoting automation.
> - It is **not** an official Cigna service, product, or endorsed integration.
> - It does **not** claim or establish live connections to Cigna, Salesforce, or live insurance rating systems.
> - All premium figures displayed or exported are **“Illustrative demonstration amounts — not an insurer quote.”**
> - The application does **not** perform medical underwriting or approve real insurance policies.
> - All datasets used are strictly **synthetic** (fictional names, IDs, and attributes).

---

## 1. Executive Summary & Challenge Pitch

Small and medium-sized enterprises (SMEs) face massive delays in obtaining employee health insurance quotes due to messy, non-standard census spreadsheets. Manual operations teams spend hours or days:
1. Reformatting column headers and dates.
2. Manually contacting brokers to resolve duplicate IDs and missing dates of birth.
3. Re-keying demographic records into insurer rating engines.
4. Formatting comparison options manually.

**CensusQuote AI** automates this entire lifecycle into a sub-second, auditable pipeline:
$$\text{Upload Census} \longrightarrow \text{Normalize Fields} \longrightarrow \text{Validate Records} \longrightarrow \text{Route Exceptions} \longrightarrow \text{Illustrative Quote} \longrightarrow \text{Compare Options} \longrightarrow \text{Export Packages}$$

---

## 2. Key Architecture & Technology Stack

The prototype is engineered with a clean full-stack architecture running locally without external paid database or API dependencies:

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Backend Services:**
  - **Node.js / Express (`server.ts`):** Unified full-stack server running Vite in development, hosting `/api/*` endpoints, deterministic processing, and server-side Gemini AI proxies.
  - **Python Core (`backend_python/census_core.py`):** Standalone Python modules for deterministic CSV normalization, RFC parsing, 10-point validation, and illustrative rating.
  - **Python FastAPI (`backend_python/fastapi_app.py`):** Alternative REST API ready for Python container deployments.
- **AI Assistance (Server-Side Proxy):** Gemini (`gemini-3.8-flash`) via `@google/genai` on server endpoints (`/api/ai/*`) for optional header mapping suggestions, validation explanations, and broker follow-up checklists. *Strict rule: AI is never used for premium calculation.*
- **Automated Testing:**
  - `npm test`: Node/TypeScript automated runner covering 20 required challenge scenarios.
  - `npm run test:py`: Python `unittest` suite covering all 20 required scenarios.

---

## 3. End-to-End Workflow & Core Capabilities

### Step 1: Census Ingestion & Column Normalization
- Accepts standard UTF-8 CSV files up to 5MB and 5,000 records.
- Automated alias mapping handles variations:
  - `employee_id`: `empid`, `member_id`, `id`, `staff_id`, `employee_number`
  - `name`: `employee_name`, `full_name`, `member_name`
  - `relationship`: `relation`, `member_type`, `role_type`
  - `date_of_birth`: `dob`, `birth_date`, `birthday`
- If required fields are unmapped, an interactive **Column Mapping Modal** allows manual mapping or one-click **AI Auto-Suggestion**.

### Step 2: Deterministic Data Validation Engine
Applies 10 rigorous enterprise rules without silent drops:
1. **Missing Identifier:** Flagged as fatal invalid.
2. **Duplicate Identifier:** Cross-checked against full record fingerprints; isolates exact duplicate rows vs reused IDs.
3. **Missing Name:** Flagged as fatal invalid.
4. **Missing Date of Birth:** Flagged as fatal invalid.
5. **Invalid Date Format:** Flags non-standard strings; parses ISO `YYYY-MM-DD` and `DD/MM/YYYY`.
6. **Future Date of Birth:** Flagged as fatal invalid.
7. **Implausible Age:** Flagged if age exceeds 110 years or is negative.
8. **Contextual Age Warnings:** Warns if active employee is $<18$ or $>75$, or dependent child is $>26$.
9. **Unknown Relationship:** Normalizes to `employee`, `spouse`, `child`, `other`; flags ambiguous terms for review.
10. **Three Clear Statuses:** `Valid`, `Review Required`, and `Invalid`.

### Step 3: Human-in-the-Loop Exception Review Queue
- Filter by specific error category or search by synthetic employee ID / name.
- View immutable original ingestion baseline side-by-side with correction inputs.
- Inline demonstration correction editor with instant re-validation.
- Immutable **Session Audit Trail** logs timestamp, row, changed field, old baseline, corrected value, and reviewer identity.
- Optional AI Issue Analysis drafts operational remediation guidance for broker communications.

### Step 4: Deterministic Illustrative Pricing Engine
*Zero AI hallucination in financial calculations.*
- **Annual Base Rates:**
  - Employee: AED 1,200.00
  - Spouse: AED 1,000.00
  - Child: AED 600.00
  - Other: AED 900.00
- **Plan Multipliers:**
  - Essential: $1.00\times$
  - Enhanced: $1.25\times$
  - Premium: $1.55\times$
- **Co-Pay Multipliers:**
  - 20% Co-Pay: $0.95\times$ (5% discount)
  - 10% Co-Pay: $1.00\times$ (baseline)
  - 0% Co-Pay: $1.12\times$ (surcharge)
- **Optional Maternity Add-on:** Flat AED 250.00 applied exclusively to primary employee records.
- **Formula:**
  $$\text{Illustrative Annual Amount} = (\text{Base} + \text{Maternity Add-on}) \times \text{Plan Multiplier} \times \text{Co-Pay Multiplier}$$
- Rounded consistently to 2 decimal places. Only validated, eligible records are rated.

### Step 5: Side-by-Side Plan Tier Comparison
- Instant side-by-side display of **Essential**, **Enhanced**, and **Premium** options with annual and monthly breakdowns.
- Rated member line-item itemization showing mathematical formula steps.
- Excluded members breakdown explaining exact reasons for exclusion.

### Step 6: Reports & Audit Package Exports
- **Cleaned Census CSV:** Valid, normalized records only.
- **Validation Exceptions Report CSV:** Complete row-by-row audit with error codes and recommendations.
- **Quote Line-Items CSV:** Rated member premium calculation schedule.
- **Structured Quote Summary JSON:** Machine-readable API bundle.
- **Printable Executive Summary:** Clean print-to-PDF modal with official disclaimers.

---

## 4. Setup, Execution & Testing Instructions

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Running the Application
```bash
# 1. Install dependencies (already present in AI Studio)
npm install

# 2. Start the full-stack server (runs on port 3000)
npm run dev

# 3. Open your browser:
http://localhost:3000
```

### Running Automated Test Suites
```bash
# Run TypeScript / Node automated test suite (20 challenge scenarios):
npm test

# Run Python unit test suite:
npm run test:py
# or
python3 -m unittest tests/test_censusquote.py
```

---

## 5. Automated Verification Results (20 Scenarios)

Both test runners were executed and passed 100%:
- `test_01_valid_clean_dataset`: Passed (100% clean rate on standard census)
- `test_02_missing_identifier`: Passed (Flagged invalid; missing_identifier)
- `test_03_duplicate_identifier`: Passed (Flagged duplicate_identifier)
- `test_04_missing_date_of_birth`: Passed (Flagged invalid; missing_dob)
- `test_05_invalid_date_of_birth`: Passed (Detected 32/13/1985 invalid date)
- `test_06_future_date_of_birth`: Passed (Detected 2035 future date)
- `test_07_implausible_age`: Passed (Detected age > 110 years)
- `test_08_unknown_relationship`: Passed (Flagged unknown_relationship)
- `test_09_missing_required_columns`: Passed (Detected unmapped required headers)
- `test_10_empty_file`: Passed (Handled without crashing)
- `test_11_malformed_csv`: Passed (Handled unclosed quotes safely)
- `test_12_file_size_limits`: Passed (Enforced 5MB boundary)
- `test_13_plan_multipliers`: Passed (Essential 1200, Enhanced 1500, Premium 1860)
- `test_14_copay_multipliers`: Passed (20% -> 1140, 10% -> 1200, 0% -> 1344)
- `test_15_maternity_addon`: Passed (Applied strictly to employee; AED 2450 total)
- `test_16_dependants_included`: Passed (Both employee and child rated)
- `test_17_employees_only_calculation`: Passed (Excluded child dependant)
- `test_18_exclusion_of_invalid_records`: Passed (Excluded invalid records from rating)
- `test_19_quote_export`: Passed (Verified export payload structure and currency)
- `test_20_api_error_handling`: Passed (Empty inputs handled gracefully)

---

## 6. Real Insurer-Approved Integration Roadmap

For a future production phase, the prototype specifies clear mock adapters:
1. **Salesforce CRM:** OAuth 2.0 mTLS bidirectional sync of opportunities, census files, and quote packages.
2. **Insurer Live Rating Engine:** REST/gRPC actuarial tariff engine integration.
3. **Policy Administration System (PAS):** ACORD/ISO 20022 digital health card binder issuance.
4. **IAM / SSO:** OIDC/SAML 2.0 integration with role-based access control.

---

## 7. Five-Minute Demonstration Script for Judges

- **Minute 0:00 - 0:45: The Problem & Solution Overview**
  - Open on the **Overview** dashboard. Highlight the persistent safety notice (synthetic data, illustrative pricing). Explain the SME quoting dilemma: manual re-keying, hours of spreadsheet cleanup.
- **Minute 0:45 - 1:45: Loading Census with Controlled Errors**
  - Switch to **Step 2 (Census Upload)**. Click *"Load 105-Member Challenge Dataset"*. Show automated column mapping and how the system flags missing DOB, duplicate IDs, future birth dates, and unknown relationships.
- **Minute 1:45 - 2:45: Validation Engine & Exception Review**
  - Switch to **Step 3 (Data Validation)**. View 6 KPI cards showing 85 clean records, 12 review required, 8 fatal invalid.
  - Navigate to **Step 4 (Exception Review)**. Select Row #30 (future DOB: 2028-11-15). Click *"AI Issue Analysis"* to see operational guidance. Apply an inline correction (e.g. `1995-11-15`). Click *"Apply & Revalidate Record"*. Show how the record turns valid in real time and appears in the session audit trail.
- **Minute 2:45 - 3:45: Deterministic Quoting & Side-by-Side Comparison**
  - Move to **Step 5 (Quote Config)**. Toggle maternity add-on and switch co-pay from 10% to 20%.
  - Move to **Step 6 (Quote Comparison)**. Showcase side-by-side Essential (AED 1.00x), Enhanced (AED 1.25x), and Premium (AED 1.55x) cards. Drill down into rated line items to show exact mathematical formula calculations.
- **Minute 3:45 - 4:30: Reports, Speed Benchmark & Exports**
  - Move to **Step 8 (Reports & Exports)**. Download the Cleaned Census CSV and Structured JSON. Open the **Print / PDF Summary Modal**.
  - Click *"Run Speed Benchmark"* in header. Run a live benchmark on 500 records to show sub-50ms deterministic execution.
- **Minute 4:30 - 5:00: Architecture Roadmap & Compliance**
  - Review **Step 9 (Integration Roadmap)** and **Step 10 (UAE Compliance Checklist)**. Emphasize that all required governance gates (PDPL, DHA, DOH, CBUAE) are documented for legal review.
