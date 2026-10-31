"""
Module C: Sensor Disagreement and Spatial Arbitration
Compares multiple zone sensors using robust statistics and agronomic evidence.
Classifies divergence into:
- likely_real_variability
- possible_sensor_fault
- inconclusive
"""

from typing import Dict, Any, List, Optional
import numpy as np

def analyze_sensor_disagreement(
    zones_data: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    zones_data: list of dicts:
    [
      {
        "zone_id": "zone_1",
        "zone_name": "North Field",
        "soil_type": "clay_loam",
        "soil_moisture": 0.31,
        "theta_fc": 0.32,
        "theta_pwp": 0.17,
        "has_recent_spike": False,
        "rain_response_detected": True
      },
      ...
    ]
    """
    if not zones_data or len(zones_data) < 2:
        return {
            "status": "inconclusive",
            "reason": "Single zone or insufficient sensors for spatial cross-validation",
            "spread_raw": 0.0,
            "spread_awc_pct": 0.0,
            "details": []
        }

    raw_moistures = []
    awc_percentages = []
    has_spikes = []
    rain_responses = []

    for z in zones_data:
        m = z.get("soil_moisture")
        if m is not None:
            raw_moistures.append(m)
            fc = z.get("theta_fc", 0.27)
            pwp = z.get("theta_pwp", 0.12)
            # Available water capacity percentage: %AWC = (theta - pwp) / (fc - pwp) * 100
            denom = max(0.01, fc - pwp)
            awc = ((m - pwp) / denom) * 100.0
            awc_percentages.append(max(0.0, min(150.0, awc)))
            has_spikes.append(bool(z.get("has_recent_spike", False)))
            rain_responses.append(bool(z.get("rain_response_detected", True)))

    if len(raw_moistures) < 2:
        return {
            "status": "inconclusive",
            "reason": "Fewer than 2 valid zone readings available",
            "spread_raw": 0.0,
            "spread_awc_pct": 0.0,
            "details": []
        }

    spread_raw = round(float(max(raw_moistures) - min(raw_moistures)), 3)
    spread_awc = round(float(max(awc_percentages) - min(awc_percentages)), 1)

    # Robust statistics across zones
    mad_awc = float(np.median(np.abs(np.array(awc_percentages) - np.median(awc_percentages))))

    # Evaluation logic:
    # 1. If any zone has an active spike flag or disconnected response => possible_sensor_fault
    if any(has_spikes):
        status = "possible_sensor_fault"
        reason = "One or more zones exhibit abrupt mathematical spike anomalies inconsistent with adjacent probes."
    # 2. If spread_awc is high (> 35%) and rain response is contradictory (one jumped after rain, other stayed flat)
    elif spread_awc > 35.0 and len(set(rain_responses)) > 1:
        status = "possible_sensor_fault"
        reason = "Severe %AWC divergence (> 35%) accompanied by contradictory rainfall infiltration signatures."
    # 3. If raw moisture differs but %AWC spread is moderate (< 25%), difference is due to soil texture
    elif spread_awc <= 25.0:
        status = "likely_real_variability"
        reason = f"Divergence in volumetric moisture is consistent with natural soil texture differences (%AWC spread is only {spread_awc}%)."
    # 4. If %AWC spread is high (> 25%) but all sensors have consistent infiltration history and no spikes
    elif all(rain_responses) and not any(has_spikes):
        status = "likely_real_variability"
        reason = f"Elevated spread (%AWC {spread_awc}%) confirmed by consistent infiltration dynamics across distinct management micro-zones."
    else:
        status = "inconclusive"
        reason = "Inter-zone divergence observed but physical evidence is insufficient to decisively identify hardware failure."

    return {
        "status": status,
        "spread_raw": spread_raw,
        "spread_awc_pct": spread_awc,
        "mad_awc": round(mad_awc, 2),
        "reason": reason,
        "zone_count": len(zones_data)
    }

