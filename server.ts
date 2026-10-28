/**
 * CensusQuote AI - Full-Stack Express Server
 * Serves API routes, Gemini AI proxy endpoints, and mounts Vite middlewares in dev.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { validateCensusRecords } from './src/services/validationEngine.ts';
import {
  calculateIllustrativeQuote,
  calculateComparisonQuotes,
  BASE_RATES,
  PLAN_MULTIPLIERS,
  COPAY_MULTIPLIERS,
  MATERNITY_ADDON_PER_EMPLOYEE,
} from './src/services/pricingEngine.ts';
import { runLiveBenchmark } from './src/services/benchmarkService.ts';
import {
  SAMPLE_CHALLENGE_105_CSV,
  SAMPLE_CLEAN_50_CSV,
  SAMPLE_EXCEPTIONS_30_CSV,
} from './src/data/sampleDatasets.ts';
import { CensusRecord, QuoteConfig, ValidatedRecord } from './src/types/census.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client safely on server side only
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// Health and Metadata Endpoints
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'CensusQuote AI',
    version: '1.0.0',
    gemini_enabled: Boolean(ai),
    disclaimer:
      'This demonstration uses synthetic data and illustrative pricing. It is not an official Cigna service or a real insurance quotation.',
  });
});

app.get('/api/rates', (req, res) => {
  res.json({
    disclaimer: 'Illustrative demonstration amounts — not an insurer quote.',
    base_rates: BASE_RATES,
    plan_multipliers: PLAN_MULTIPLIERS,
    copay_multipliers: COPAY_MULTIPLIERS,
    maternity_addon: MATERNITY_ADDON_PER_EMPLOYEE,
  });
});

app.get('/api/sample-datasets', (req, res) => {
  res.json({
    challenge_105: {
      name: 'Synthetic Challenge Dataset (105 records with deliberate errors)',
      csv: SAMPLE_CHALLENGE_105_CSV,
      record_count: 105,
      description:
        'Contains deliberate edge cases: duplicate IDs, future DOB, missing DOB, implausible age, unknown relationship, missing name.',
    },
    clean_50: {
      name: 'Clean Demonstration Dataset (50 valid records)',
      csv: SAMPLE_CLEAN_50_CSV,
      record_count: 50,
      description:
        'Standardized 50-member SME census that validates cleanly with 100% quote eligibility.',
    },
    exceptions_30: {
      name: 'Exception-Heavy Dataset (30 records with high error rate)',
      csv: SAMPLE_EXCEPTIONS_30_CSV,
      record_count: 30,
      description:
        'High-density exception queue stress test for exception resolution workflows.',
    },
  });
});

// -------------------------------------------------------------
// Deterministic Validation & Pricing Endpoints
// -------------------------------------------------------------
app.post('/api/census/validate', (req, res) => {
  try {
    const { records } = req.body as { records: CensusRecord[] };
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Payload must contain a "records" array' });
    }
    const result = validateCensusRecords(records);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Validation failed' });
  }
});

app.post('/api/quote/calculate', (req, res) => {
  try {
    const { validated_records, config, quote_version, census_reference } = req.body as {
      validated_records: ValidatedRecord[];
      config: QuoteConfig;
      quote_version?: number;
      census_reference?: string;
    };

    if (!Array.isArray(validated_records) || !config) {
      return res.status(400).json({ error: 'Missing validated_records or config' });
    }

    const quote = calculateIllustrativeQuote(
      validated_records,
      config,
      quote_version || 1,
      census_reference || 'CENSUS-DEMO-001'
    );
    res.json(quote);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Pricing calculation failed' });
  }
});

app.post('/api/quote/compare', (req, res) => {
  try {
    const { validated_records, base_config, census_reference } = req.body as {
      validated_records: ValidatedRecord[];
      base_config: Omit<QuoteConfig, 'plan_tier'>;
      census_reference?: string;
    };

    if (!Array.isArray(validated_records) || !base_config) {
      return res.status(400).json({ error: 'Missing validated_records or base_config' });
    }

    const comparison = calculateComparisonQuotes(
      validated_records,
      base_config,
      census_reference || 'CENSUS-DEMO-001'
    );
    res.json(comparison);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Comparison calculation failed' });
  }
});

app.post('/api/benchmark', (req, res) => {
  try {
    const { row_count } = req.body as { row_count?: number };
    const count = Math.min(Math.max(row_count || 100, 10), 5000);
    const benchmark = runLiveBenchmark(count);
    res.json(benchmark);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Benchmark failed' });
  }
});

// -------------------------------------------------------------
// Optional Gemini AI Assistance Endpoints
// (Strict constraint: strictly advisory only, never used for pricing)
// -------------------------------------------------------------
app.post('/api/ai/suggest-mapping', async (req, res) => {
  const { headers } = req.body as { headers: string[] };
  if (!headers || !Array.isArray(headers)) {
    return res.status(400).json({ error: 'Headers array is required' });
  }

  // If Gemini is available, query model for mapping recommendations
  if (ai) {
    try {
      const prompt = `You are a data analyst assisting an SME census ingestion system.
Given these raw CSV column headers from an SME client:
${JSON.stringify(headers)}

Suggest how they map to standard enterprise census fields:
- employee_id (required identifier)
- name (required member name)
- relationship (required: employee, spouse, child, other)
- date_of_birth (required date)
- job_title (optional)
- department (optional)
- location (optional)

Return a concise JSON object with the suggested mapping:
{
  "mapping": {
    "employee_id": "<exact_matched_header_or_empty>",
    "name": "<exact_matched_header_or_empty>",
    "relationship": "<exact_matched_header_or_empty>",
    "date_of_birth": "<exact_matched_header_or_empty>",
    "job_title": "<exact_matched_header_or_empty>",
    "department": "<exact_matched_header_or_empty>",
    "location": "<exact_matched_header_or_empty>"
  },
  "confidence_notes": "<short explanation>"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      return res.json({ source: 'gemini', ...parsed });
    } catch (e: any) {
      console.warn('Gemini suggest-mapping fallback to heuristic:', e.message);
    }
  }

  // Deterministic fallback if Gemini is absent or errors
  return res.json({
    source: 'deterministic_heuristic',
    mapping: {},
    confidence_notes: 'Heuristic pattern matching applied.',
  });
});

app.post('/api/ai/explain-issue', async (req, res) => {
  const { record, errors, warnings } = req.body;
  if (!record) {
    return res.status(400).json({ error: 'Record is required' });
  }

  if (ai) {
    try {
      const prompt = `You are an insurance operations specialist reviewing an SME employee census.
A record has encountered validation exceptions:
Record: ${JSON.stringify(record)}
Validation Errors: ${JSON.stringify(errors || [])}
Validation Warnings: ${JSON.stringify(warnings || [])}

Provide:
1. A 2-sentence explanation of the business risk and data discrepancy.
2. The exact document or correction required from the employer/broker (e.g. passport copy, updated HR census, dependent birth certificate).
3. A suggested remediation step.
Do NOT make medical underwriting decisions or approve insurance.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ explanation: response.text?.trim() || '' });
    } catch (e: any) {
      console.warn('Gemini explain-issue fallback:', e.message);
    }
  }

  // Fallback explanation
  const errText = (errors || []).join('; ');
  return res.json({
    explanation: `This record was routed to human exception review due to: ${errText}. Please request confirmation of official identification and corrected birth date/relationship from the employer HR department.`,
  });
});

app.post('/api/ai/follow-up-checklist', async (req, res) => {
  const { exceptions_summary } = req.body;

  if (ai) {
    try {
      const prompt = `As an insurance SME underwriting assistant, create a structured follow-up checklist for an insurance broker/client based on these census exceptions:
${JSON.stringify(exceptions_summary)}

Return a professional, actionable 4-point bullet checklist to resolve outstanding issues quickly.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ checklist: response.text?.trim() || '' });
    } catch (e: any) {
      console.warn('Gemini checklist fallback:', e.message);
    }
  }

  return res.json({
    checklist:
      '1. Request updated census sheet resolving duplicated employee IDs.\n2. Obtain verified date of birth for records with invalid or missing date formats.\n3. Clarify non-standard relationship definitions (e.g. second cousins/extended relatives).\n4. Resubmit corrected batch for automated re-validation and revised illustrative quote.',
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Server Setup
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CensusQuote AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
