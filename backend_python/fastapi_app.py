"""
CensusQuote AI - FastAPI Backend Service (Concept Prototype)
Demonstrates production-ready REST API endpoints with OpenAPI/Swagger documentation.
Note: For seamless local preview in AI Studio, the application runs on Node/Express with tsx.
This file provides the standalone Python FastAPI deployment alternative.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .census_core import (
    parse_csv_content,
    detect_column_mapping,
    normalize_relationship,
    validate_records,
    calculate_quote,
    BASE_RATES,
    PLAN_MULTIPLIERS,
    COPAY_MULTIPLIERS,
)

app = FastAPI(
    title="CensusQuote AI - API",
    description="SME Census Ingestion, Validation, Exception Routing, and Illustrative Quoting Engine",
    version="1.0.0"
)

class QuoteConfigRequest(BaseModel):
    plan_tier: str = "essential"
    copay_option: str = "10"
    include_maternity: bool = False
    include_dependants: bool = True
    census_data: List[Dict[str, Any]]

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CensusQuote AI",
        "disclaimer": "Demonstration prototype with synthetic data and illustrative pricing."
    }

@app.get("/api/rates")
def get_demonstration_rates():
    return {
        "disclaimer": "Illustrative demonstration amounts — not an insurer quote.",
        "base_rates": BASE_RATES,
        "plan_multipliers": PLAN_MULTIPLIERS,
        "copay_multipliers": COPAY_MULTIPLIERS,
        "maternity_addon": 250.00
    }

@app.post("/api/census/validate")
def validate_census(records: List[Dict[str, Any]]):
    if not records:
        raise HTTPException(status_code=400, detail="Empty records list received.")
    validated, summary = validate_records(records)
    return {"validated_records": validated, "summary": summary}

@app.post("/api/quote/calculate")
def quote_calculation(request: QuoteConfigRequest):
    validated, _ = validate_records(request.census_data)
    quote = calculate_quote(validated, {
        "plan_tier": request.plan_tier,
        "copay_option": request.copay_option,
        "include_maternity": request.include_maternity,
        "include_dependants": request.include_dependants
    })
    return quote
