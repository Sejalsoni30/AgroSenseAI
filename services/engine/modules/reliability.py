"""
Module B: Pre-Decision Data Reliability Layer
Evaluates input reliability before any decision is made.
Calculates individual penalties and the overall Data Reliability Score (DRS).
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import numpy as np

PENALTY_WEIGHTS = {
    "missing_soil_moisture": 0.40,
    "missing_temperature": 0.20,
    "missing_humidity": 0.15,
    "missing_rainfall": 0.15,
    "physically_impossible_moisture": 0.35,
    "physically_impossible_temp": 0.25,
    "sensor_spike_detected": 0.25,
    "stale_weather_data": 0.15,
    "inconsistent_timestamp": 0.10,
    "suspected_calibration_drift": 0.20,
    "high_sensor_disagreement": 0.15
}


def check_physical_bounds(
    soil_moisture: Optional[float],
    soil_sat: float,
    soil_pwp: float,
    temperature: Optional[float],
    humidity: Optional[float]
) -> List[Dict[str, Any]]:
    """Checks if sensor readings violate biological/physical limits."""
    violations = []
    
    if soil_moisture is not None:
        # Moisture cannot physically exceed soil saturation + 10% (ponding) or be negative
        if soil_moisture < 0.0 or soil_moisture > (soil_sat * 1.15):
            violations.append({
                "field": "soil_moisture",
                "value": soil_moisture,
                "reason": f"Value {soil_moisture*100:.1f}% exceeds physical limit for this soil (sat: {soil_sat*100:.1f}%)",
                "penalty_code": "physically_impossible_moisture",
                "penalty": PENALTY_WEIGHTS["physically_impossible_moisture"]
            })
    
    if temperature is not None:
        if temperature < -20.0 or temperature > 60.0:
            violations.append({
                "field": "temperature",
                "value": temperature,
                "reason": f"Temperature {temperature}°C outside plausible agricultural envelope (-20°C to 60°C)",
                "penalty_code": "physically_impossible_temp",
                "penalty": PENALTY_WEIGHTS["physically_impossible_temp"]
            })
            
    if humidity is not None:
        if humidity < 0.0 or humidity > 100.0:
            violations.append({
                "field": "humidity",
                "value": humidity,
                "reason": f"Relative humidity {humidity}% outside [0, 100%]",
                "penalty_code": "physically_impossible_temp",
                "penalty": 0.10
            })
            
    return violations


def detect_spikes_mad(
    current_value: float,
    recent_history: List[float],
    threshold_factor: float = 3.5
) -> Optional[Dict[str, Any]]:
    """
    Robust spike detection using Median Absolute Deviation (MAD).
    MAD = median(|x_i - median(x)|).
    A reading is an outlier if |x - median| > threshold_factor * 1.4826 * MAD.
    """
    if not recent_history or len(recent_history) < 4:
        return None
    
    series = np.array(recent_history, dtype=float)
    med = np.median(series)
    mad = np.median(np.abs(series - med))
    
    # If MAD is near zero (e.g. constant readings), use small epsilon
    normalizer = max(0.005, 1.4826 * mad)
    diff = abs(current_value - med)
    modified_z = diff / normalizer
    
    if modified_z > threshold_factor:
        return {
            "type": "spike_anomaly",
            "current_value": current_value,
            "median": float(med),
            "mad": float(mad),
            "modified_z_score": round(float(modified_z), 2),
            "penalty_code": "sensor_spike_detected",
            "penalty": PENALTY_WEIGHTS["sensor_spike_detected"]
        }
    return None


def evaluate_data_reliability(
    soil_moisture: Optional[float],
    temperature: Optional[float],
    humidity: Optional[float],
    rainfall: Optional[float],
    weather_age_seconds: int = 0,
    timestamp_iso: Optional[str] = None,
    recent_moisture_history: Optional[List[float]] = None,
    soil_type: str = "loam",
    soil_sat: float = 0.47,
    soil_pwp: float = 0.12,
    et0_mm: float = 3.5
) -> Dict[str, Any]:
    """
    Computes the comprehensive Data Reliability Score (DRS) and returns
    transparent penalty breakdowns.
    """
    penalties = []
    input_status = {}

    # 1. Missingness checks
    if soil_moisture is None:
        penalties.append({
            "code": "missing_soil_moisture",
            "description": "Root-zone soil moisture reading is missing",
            "penalty": PENALTY_WEIGHTS["missing_soil_moisture"]
        })
        input_status["soil_moisture"] = "missing"
    else:
        input_status["soil_moisture"] = "present"

    if temperature is None:
        penalties.append({
            "code": "missing_temperature",
            "description": "Temperature is missing",
            "penalty": PENALTY_WEIGHTS["missing_temperature"]
        })
        input_status["temperature"] = "missing"
    else:
        input_status["temperature"] = "present"

    if humidity is None:
        penalties.append({
            "code": "missing_humidity",
            "description": "Relative humidity is missing",
            "penalty": PENALTY_WEIGHTS["missing_humidity"]
        })
        input_status["humidity"] = "missing"
    else:
        input_status["humidity"] = "present"

    if rainfall is None:
        penalties.append({
            "code": "missing_rainfall",
            "description": "Rainfall data is missing",
            "penalty": PENALTY_WEIGHTS["missing_rainfall"]
        })
        input_status["rainfall"] = "missing"
    else:
        input_status["rainfall"] = "present"

    # 2. Physical boundary plausibility
    bound_violations = check_physical_bounds(
        soil_moisture, soil_sat, soil_pwp, temperature, humidity
    )
    for v in bound_violations:
        penalties.append({
            "code": v["penalty_code"],
            "description": v["reason"],
            "penalty": v["penalty"]
        })

    # 3. Robust Spike detection on moisture
    if soil_moisture is not None and recent_moisture_history and len(recent_moisture_history) >= 4:
        spike_info = detect_spikes_mad(soil_moisture, recent_moisture_history)
        if spike_info:
            penalties.append({
                "code": spike_info["penalty_code"],
                "description": f"Moisture spike detected (Modified Z-score {spike_info['modified_z_score']} > 3.5)",
                "penalty": spike_info["penalty"],
                "details": spike_info
            })

    # 4. Stale weather telemetry (> 3 hours = 10800s)
    if weather_age_seconds > 10800:
        age_hours = round(weather_age_seconds / 3600.0, 1)
        penalties.append({
            "code": "stale_weather_data",
            "description": f"Weather forecast data is {age_hours} hours old (> 3.0h threshold)",
            "penalty": PENALTY_WEIGHTS["stale_weather_data"]
        })

    # 5. Timestamp validation
    if timestamp_iso:
        try:
            ts = datetime.fromisoformat(timestamp_iso.replace("Z", "+00:00"))
            now = datetime.now(timezone.utc)
            delta_seconds = (ts - now).total_seconds()
            if delta_seconds > 600:  # More than 10 mins in the future
                penalties.append({
                    "code": "inconsistent_timestamp",
                    "description": "Timestamp is set in the future",
                    "penalty": PENALTY_WEIGHTS["inconsistent_timestamp"]
                })
        except Exception:
            pass

    # 6. Suspected calibration drift (e.g. flatlined moisture despite high ET0 and zero rain for 5+ steps)
    if recent_moisture_history and len(recent_moisture_history) >= 6 and soil_moisture is not None:
        last_readings = recent_moisture_history[-5:] + [soil_moisture]
        spread = max(last_readings) - min(last_readings)
        if spread < 0.002 and et0_mm > 4.0 and (rainfall is None or rainfall == 0):
            penalties.append({
                "code": "suspected_calibration_drift",
                "description": "Moisture is completely frozen (< 0.2% change) under high evaporative demand (> 4mm/day)",
                "penalty": PENALTY_WEIGHTS["suspected_calibration_drift"]
            })

    # Compute aggregate DRS (clamped between 0.0 and 1.0)
    total_penalty = sum(p["penalty"] for p in penalties)
    reliability_score = max(0.0, min(1.0, 1.0 - total_penalty))
    reliability_score = round(reliability_score, 3)

    # Classify reliability status
    if reliability_score >= 0.80:
        status_category = "HIGH_CONFIDENCE"
    elif reliability_score >= 0.65:
        status_category = "MODERATE_CONFIDENCE"
    else:
        status_category = "DEGRADED_UNRELIABLE"

    return {
        "reliability_score": reliability_score,
        "status_category": status_category,
        "is_reliable": reliability_score >= 0.65,
        "total_penalty": round(total_penalty, 3),
        "penalties": penalties,
        "input_status": input_status,
        "formula": "DRS = max(0.0, 1.0 - sum(individual_penalties))"
    }

