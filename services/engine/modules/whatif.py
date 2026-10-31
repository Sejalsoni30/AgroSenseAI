"""
Module F: What-If Simulation Sandbox
Runs side-by-side hypothetical scenarios without modifying production data.
Badges all synthetic outputs as source: "simulated".
"""

from typing import Dict, Any, Optional

def simulate_scenario(
    baseline_payload: Dict[str, Any],
    modifications: Dict[str, Any],
    evaluate_fn
) -> Dict[str, Any]:
    """
    Executes a what-if scenario comparison:
    - baseline: original evaluation
    - simulated: evaluated with modifications applied
    - delta: differences between baseline and simulated
    """
    # 1. Run baseline
    baseline_result = evaluate_fn(baseline_payload)

    # 2. Build modified payload
    simulated_payload = dict(baseline_payload)
    
    # Apply modifications
    if "soil_moisture" in modifications and modifications["soil_moisture"] is not None:
        simulated_payload["soil_moisture"] = float(modifications["soil_moisture"])
        simulated_payload["soil_moisture_source"] = "simulated"

    if "sensor_offline" in modifications and modifications["sensor_offline"] is True:
        simulated_payload["soil_moisture"] = None
        simulated_payload["soil_moisture_source"] = "simulated"

    if "temperature_delta" in modifications:
        current_temp = simulated_payload.get("temperature", 25.0)
        simulated_payload["temperature"] = current_temp + float(modifications["temperature_delta"])
        simulated_payload["temperature_source"] = "simulated"

    if "rainfall" in modifications and modifications["rainfall"] is not None:
        simulated_payload["rainfall"] = float(modifications["rainfall"])
        simulated_payload["rainfall_source"] = "simulated"

    if "growth_stage" in modifications and modifications["growth_stage"]:
        simulated_payload["growth_stage"] = str(modifications["growth_stage"])

    # 3. Run simulated evaluation
    simulated_result = evaluate_fn(simulated_payload)

    # 4. Compute differences
    decision_flipped = baseline_result["decision"] != simulated_result["decision"]
    dr_delta = round(
        simulated_result["water_balance"]["dr_mm"] - baseline_result["water_balance"]["dr_mm"],
        2
    )
    reliability_delta = round(
        simulated_result["reliability"]["reliability_score"] - baseline_result["reliability"]["reliability_score"],
        3
    )

    return {
        "status": "success",
        "is_simulated": True,
        "modifications_applied": modifications,
        "baseline": {
            "decision": baseline_result["decision"],
            "reliability_score": baseline_result["reliability"]["reliability_score"],
            "dr_mm": baseline_result["water_balance"]["dr_mm"],
            "raw_mm": baseline_result["water_balance"]["raw_mm"],
            "etc_mm": baseline_result["water_balance"]["etc_mm"],
            "underwatering_risk_pct": baseline_result["water_balance"]["underwatering_risk_pct"]
        },
        "simulated": {
            "decision": simulated_result["decision"],
            "reliability_score": simulated_result["reliability"]["reliability_score"],
            "dr_mm": simulated_result["water_balance"]["dr_mm"],
            "raw_mm": simulated_result["water_balance"]["raw_mm"],
            "etc_mm": simulated_result["water_balance"]["etc_mm"],
            "underwatering_risk_pct": simulated_result["water_balance"]["underwatering_risk_pct"],
            "summary": simulated_result["explanation"]["summary"]
        },
        "delta": {
            "decision_flipped": decision_flipped,
            "dr_change_mm": dr_delta,
            "reliability_change": reliability_delta,
            "message": f"Decision changed from {baseline_result['decision']} to {simulated_result['decision']}." if decision_flipped else "Decision remained unchanged under these parameters."
        }
    }

