"""
Comprehensive Unit Tests for AgroSenseAI Decision Engine
"""

import pytest
from services.engine.modules.fao56 import (
    penman_monteith_et0,
    hargreaves_samani_et0,
    calculate_water_balance,
    DEFAULT_CROP_KC,
    SOIL_PROPERTIES
)
from services.engine.modules.reliability import evaluate_data_reliability
from services.engine.modules.disagreement import analyze_sensor_disagreement
from services.engine.modules.recovery import recover_missing_data
from services.engine.modules.uncertainty import (
    monte_carlo_water_balance,
    compute_decision_and_abstention,
    compute_expected_calibration_error
)
from services.engine.modules.explainability import generate_counterfactuals_and_explanation
from services.engine.main import run_full_pipeline


def test_fao56_penman_monteith():
    # Standard sunny summer day
    et0 = penman_monteith_et0(
        t_mean=28.0,
        t_min=20.0,
        t_max=36.0,
        rh_mean=45.0,
        wind_speed_2m=2.5,
        solar_radiation_mj=22.0,
        altitude_m=100.0,
        latitude_deg=25.0,
        day_of_year=180
    )
    assert 4.0 <= et0 <= 8.0, f"Expected realistic summer ET0, got {et0}"


def test_fao56_hargreaves_fallback():
    # Only Tmin and Tmax available
    et0_harg = hargreaves_samani_et0(t_min=20.0, t_max=36.0, latitude_deg=25.0, day_of_year=180)
    assert 4.0 <= et0_harg <= 8.5, f"Expected realistic Hargreaves ET0, got {et0_harg}"


def test_water_balance_calculation():
    wb = calculate_water_balance(
        crop_name="wheat",
        growth_stage="mid",
        soil_type="loam",
        soil_moisture_vol=0.18,  # Below field capacity (0.27)
        et0_mm=5.0,
        forecast_rain_mm=0.0
    )
    assert wb["taw_mm"] > 0
    assert wb["raw_mm"] > 0
    assert wb["raw_mm"] < wb["taw_mm"]
    assert wb["dr_mm"] > 0
    assert wb["net_irrigation_req_mm"] >= 0
    assert "theta_refill_threshold" in wb


def test_reliability_scoring():
    # 1. Clean data should yield high reliability (1.0)
    clean = evaluate_data_reliability(
        soil_moisture=0.25,
        temperature=26.0,
        humidity=50.0,
        rainfall=0.0,
        weather_age_seconds=600,
        soil_sat=0.47,
        soil_pwp=0.12
    )
    assert clean["reliability_score"] == 1.0
    assert clean["is_reliable"] is True
    assert clean["status_category"] == "HIGH_CONFIDENCE"

    # 2. Missing moisture should heavily penalize reliability
    degraded = evaluate_data_reliability(
        soil_moisture=None,
        temperature=26.0,
        humidity=50.0,
        rainfall=0.0,
        soil_sat=0.47,
        soil_pwp=0.12
    )
    assert degraded["reliability_score"] <= 0.60
    assert degraded["is_reliable"] is False


def test_disagreement_classification():
    # Case 1: Real texture difference (%AWC close)
    zones = [
        {"zone_id": "z1", "soil_moisture": 0.28, "theta_fc": 0.32, "theta_pwp": 0.17, "rain_response_detected": True},
        {"zone_id": "z2", "soil_moisture": 0.16, "theta_fc": 0.18, "theta_pwp": 0.08, "rain_response_detected": True}
    ]
    res1 = analyze_sensor_disagreement(zones)
    assert res1["status"] == "likely_real_variability"

    # Case 2: Spike detected in one zone
    zones_fault = [
        {"zone_id": "z1", "soil_moisture": 0.28, "theta_fc": 0.32, "theta_pwp": 0.17, "has_recent_spike": True},
        {"zone_id": "z2", "soil_moisture": 0.26, "theta_fc": 0.32, "theta_pwp": 0.17, "has_recent_spike": False}
    ]
    res2 = analyze_sensor_disagreement(zones_fault)
    assert res2["status"] == "possible_sensor_fault"


def test_full_pipeline_abstention():
    # If soil moisture is missing completely, system must abstain
    payload = {
        "crop_name": "wheat",
        "growth_stage": "development",
        "soil_type": "loam",
        "soil_moisture": None,  # Missing
        "temperature": 25.0,
        "humidity": 50.0,
        "rainfall": 0.0
    }
    result = run_full_pipeline(payload)
    assert result["decision"] == "INSUFFICIENT_DATA_VERIFY_MANUALLY"
    assert result["abstention_reason"] is not None


def test_full_pipeline_irrigate():
    # Very dry soil (0.13 in loam with FC 0.27, PWP 0.12)
    payload = {
        "crop_name": "wheat",
        "growth_stage": "mid",
        "soil_type": "loam",
        "soil_moisture": 0.13,
        "temperature": 32.0,
        "humidity": 30.0,
        "rainfall": 0.0
    }
    result = run_full_pipeline(payload)
    assert result["decision"] == "IRRIGATE"
    assert result["water_balance"]["net_irrigation_req_mm"] > 0
    assert len(result["explanation"]["counterfactuals"]) > 0


def test_full_pipeline_no_irrigation():
    # Plentiful moisture near field capacity (0.26 in loam) + heavy forecast rain
    payload = {
        "crop_name": "wheat",
        "growth_stage": "development",
        "soil_type": "loam",
        "soil_moisture": 0.26,
        "temperature": 24.0,
        "humidity": 65.0,
        "rainfall": 15.0
    }
    result = run_full_pipeline(payload)
    assert result["decision"] == "NO_IRRIGATION_NEEDED"

