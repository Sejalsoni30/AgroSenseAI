"""
AgroSenseAI Decision Engine Service (FastAPI)
Deterministic FAO-56 Hydrology + Pre-Decision Reliability + Conformal Uncertainty
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import time

from .modules.fao56 import calculate_water_balance, SOIL_PROPERTIES
from .modules.reliability import evaluate_data_reliability
from .modules.disagreement import analyze_sensor_disagreement
from .modules.recovery import recover_missing_data
from .modules.uncertainty import monte_carlo_water_balance, compute_decision_and_abstention
from .modules.explainability import generate_counterfactuals_and_explanation
from .modules.whatif import simulate_scenario

app = FastAPI(
    title="AgroSenseAI Decision Engine",
    version="1.0.0",
    description="Confidence-Aware & Explainable Irrigation Intelligence Platform Core Engine"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvaluationRequest(BaseModel):
    zone_id: Optional[str] = "zone-default"
    crop_name: str = Field(default="wheat", description="Crop identifier")
    growth_stage: str = Field(default="development", description="initial, development, mid, late")
    soil_type: str = Field(default="loam", description="sandy, sandy_loam, loam, clay_loam, silty_clay, clay")
    soil_moisture: Optional[float] = Field(default=None, description="Volumetric water content m3/m3 (e.g. 0.22)")
    soil_moisture_source: Optional[str] = "measured"
    temperature: Optional[float] = Field(default=None, description="Ambient air temperature degC")
    temperature_source: Optional[str] = "measured"
    humidity: Optional[float] = Field(default=None, description="Relative humidity %")
    humidity_source: Optional[str] = "measured"
    rainfall: Optional[float] = Field(default=None, description="Recent/forecast rainfall mm")
    rainfall_source: Optional[str] = "measured"
    solar_radiation_mj: Optional[float] = None
    wind_speed_2m: Optional[float] = None
    weather_age_seconds: int = 0
    timestamp: Optional[str] = None
    recent_moisture_history: Optional[List[float]] = None
    weather_forecast: Optional[Dict[str, Any]] = None
    latitude_deg: float = 25.0
    root_depth_m: Optional[float] = None


class DisagreementRequest(BaseModel):
    zones: List[Dict[str, Any]]


class WhatIfRequest(BaseModel):
    baseline: EvaluationRequest
    modifications: Dict[str, Any]


def run_full_pipeline(req_dict: Dict[str, Any]) -> Dict[str, Any]:
    start_time = time.time()

    crop_name = req_dict.get("crop_name", "wheat")
    growth_stage = req_dict.get("growth_stage", "development")
    soil_type = req_dict.get("soil_type", "loam")
    soil = SOIL_PROPERTIES.get(soil_type.lower(), SOIL_PROPERTIES["loam"])

    # Step 1: Defensible Missing-Data Recovery & Provenance Tracking (Module D)
    recovery_result = recover_missing_data(
        raw_inputs=req_dict,
        weather_forecast=req_dict.get("weather_forecast"),
        latitude_deg=req_dict.get("latitude_deg", 25.0)
    )
    processed = recovery_result["processed_inputs"]
    provenance = recovery_result["provenance"]
    et0_mm = recovery_result["et0_mm"]

    # Step 2: Pre-Decision Data Reliability Layer (Module B)
    reliability = evaluate_data_reliability(
        soil_moisture=processed.get("soil_moisture"),
        temperature=processed.get("temperature"),
        humidity=processed.get("humidity"),
        rainfall=processed.get("rainfall"),
        weather_age_seconds=req_dict.get("weather_age_seconds", 0),
        timestamp_iso=req_dict.get("timestamp"),
        recent_moisture_history=req_dict.get("recent_moisture_history"),
        soil_type=soil_type,
        soil_sat=soil["sat"],
        soil_pwp=soil["pwp"],
        et0_mm=et0_mm
    )

    # Step 3: FAO-56 Agronomic Water Balance (Module G)
    soil_moist = processed.get("soil_moisture")
    # If moisture is completely missing, use nominal fallback for calculation bounds
    calc_moisture = soil_moist if soil_moist is not None else soil["fc"] * 0.75
    water_balance = calculate_water_balance(
        crop_name=crop_name,
        growth_stage=growth_stage,
        soil_type=soil_type,
        soil_moisture_vol=calc_moisture,
        et0_mm=et0_mm,
        forecast_rain_mm=processed.get("rainfall", 0.0),
        root_depth_custom_m=req_dict.get("root_depth_m")
    )

    # Step 4: Dual Uncertainty Quantification (Module A)
    mc_uncertainty = monte_carlo_water_balance(
        soil_moisture_vol=calc_moisture,
        raw_mm=water_balance["raw_mm"],
        taw_mm=water_balance["taw_mm"],
        theta_fc=water_balance["theta_fc"],
        root_depth_m=water_balance["root_depth_m"],
        et0_mm=et0_mm,
        kc=water_balance["kc"],
        forecast_rain_mm=processed.get("rainfall", 0.0)
    )

    # Step 5: Calibrated Abstention & Decision (Module A)
    decision_info = compute_decision_and_abstention(
        reliability_score=reliability["reliability_score"],
        dr_mm=water_balance["dr_mm"],
        raw_mm=water_balance["raw_mm"],
        taw_mm=water_balance["taw_mm"],
        p_eff_mm=water_balance["p_eff_mm"],
        mc_results=mc_uncertainty,
        requires_manual_verification=recovery_result["requires_manual_verification"]
    )

    # Step 6: Farmer-Centric Explainability & Counterfactuals (Module E)
    explanation = generate_counterfactuals_and_explanation(
        decision=decision_info["decision"],
        dr_mm=water_balance["dr_mm"],
        raw_mm=water_balance["raw_mm"],
        taw_mm=water_balance["taw_mm"],
        soil_moisture_vol=calc_moisture,
        theta_refill_threshold=water_balance["theta_refill_threshold"],
        forecast_rain_mm=processed.get("rainfall", 0.0),
        p_eff_mm=water_balance["p_eff_mm"],
        etc_mm=water_balance["etc_mm"],
        reliability_score=reliability["reliability_score"],
        provenance=provenance,
        abstention_reason=decision_info.get("abstention_reason")
    )

    elapsed_ms = round((time.time() - start_time) * 1000.0, 2)

    return {
        "engine_version": "1.0.0-fao56",
        "timestamp": req_dict.get("timestamp"),
        "decision": decision_info["decision"],
        "confidence_band": decision_info["confidence_band"],
        "abstention_reason": decision_info.get("abstention_reason"),
        "reliability": reliability,
        "water_balance": water_balance,
        "uncertainty": mc_uncertainty,
        "provenance": provenance,
        "recovery": recovery_result["recovery_log"],
        "explanation": explanation,
        "latency_ms": elapsed_ms
    }


@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "AgroSenseAI Decision Engine",
        "version": "1.0.0-fao56",
        "standards": ["FAO-56 Penman-Monteith", "Hargreaves-Samani", "Conformal Prediction"]
    }


@app.post("/evaluate")
def evaluate(req: EvaluationRequest):
    return run_full_pipeline(req.model_dump())


@app.post("/reliability")
def evaluate_reliability_endpoint(req: EvaluationRequest):
    req_dict = req.model_dump()
    soil = SOIL_PROPERTIES.get(req_dict.get("soil_type", "loam").lower(), SOIL_PROPERTIES["loam"])
    return evaluate_data_reliability(
        soil_moisture=req_dict.get("soil_moisture"),
        temperature=req_dict.get("temperature"),
        humidity=req_dict.get("humidity"),
        rainfall=req_dict.get("rainfall"),
        weather_age_seconds=req_dict.get("weather_age_seconds", 0),
        timestamp_iso=req_dict.get("timestamp"),
        recent_moisture_history=req_dict.get("recent_moisture_history"),
        soil_sat=soil["sat"],
        soil_pwp=soil["pwp"]
    )


@app.post("/disagreement")
def disagreement_endpoint(req: DisagreementRequest):
    return analyze_sensor_disagreement(req.zones)


@app.post("/whatif")
def whatif_endpoint(req: WhatIfRequest):
    baseline_payload = req.baseline.model_dump()
    return simulate_scenario(
        baseline_payload=baseline_payload,
        modifications=req.modifications,
        evaluate_fn=run_full_pipeline
    )

