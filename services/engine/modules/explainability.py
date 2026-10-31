"""
Module E: Farmer-Centric Explainability & Counterfactual Recourse
Generates structured explanations, driver rankings, and mathematical
counterfactual tipping points (English and Hindi).
"""

from typing import Dict, Any, List

def generate_counterfactuals_and_explanation(
    decision: str,
    dr_mm: float,
    raw_mm: float,
    taw_mm: float,
    soil_moisture_vol: float,
    theta_refill_threshold: float,
    forecast_rain_mm: float,
    p_eff_mm: float,
    etc_mm: float,
    reliability_score: float,
    provenance: Dict[str, Any],
    abstention_reason: str = None
) -> Dict[str, Any]:
    """
    Computes key hydrologic driver contributions and counterfactual thresholds
    (Wachter et al. formulation).
    """
    net_deficit = dr_mm - p_eff_mm
    margin_to_raw = round(raw_mm - net_deficit, 2)

    # 1. Driver decomposition with relative impacts
    drivers = [
        {
            "name": "Soil Moisture Deficit (Dr)",
            "name_hi": "मृदा नमी की कमी",
            "value_mm": dr_mm,
            "unit": "mm",
            "impact": "Increases irrigation requirement" if dr_mm > 0 else "Neutral",
            "impact_hi": "सिंचाई की आवश्यकता बढ़ाता है",
            "importance": round(min(1.0, dr_mm / max(1.0, raw_mm)), 2)
        },
        {
            "name": "Crop Water Demand (ETc)",
            "name_hi": "फसल जल मांग (ETc)",
            "value_mm": etc_mm,
            "unit": "mm/day",
            "impact": "Daily atmospheric water loss",
            "impact_hi": "दैनिक वायुमंडलीय जल हानि",
            "importance": round(min(1.0, etc_mm / 10.0), 2)
        },
        {
            "name": "Forecast Effective Rain",
            "name_hi": "अनुमानित प्रभावी वर्षा",
            "value_mm": p_eff_mm,
            "unit": "mm",
            "impact": "Reduces / cancels irrigation need" if p_eff_mm > 0 else "No rain assistance",
            "impact_hi": "सिंचाई की आवश्यकता को कम/रद्द करता है",
            "importance": round(min(1.0, p_eff_mm / max(1.0, raw_mm)), 2)
        }
    ]
    # Sort drivers by importance descending
    drivers.sort(key=lambda d: d["importance"], reverse=True)

    # 2. Counterfactual Recourse: What would change this recommendation?
    counterfactuals = []
    counterfactuals_hi = []

    if decision == "NO_IRRIGATION_NEEDED":
        # What would make it IRRIGATE?
        # a) Moisture drop to refill threshold
        counterfactuals.append({
            "trigger": f"Soil moisture drops below {theta_refill_threshold*100:.1f}%",
            "trigger_hi": f"मृदा नमी {theta_refill_threshold*100:.1f}% से नीचे गिर जाती है",
            "current_value": f"{soil_moisture_vol*100:.1f}%",
            "required_delta": f"-{(soil_moisture_vol - theta_refill_threshold)*100:.1f}%",
            "flips_decision_to": "IRRIGATE"
        })
        # b) Rain drops to zero or below threshold
        if forecast_rain_mm > 0:
            rain_drop_threshold = max(0.0, forecast_rain_mm - margin_to_raw)
            counterfactuals.append({
                "trigger": f"Forecast rainfall reduces below {rain_drop_threshold:.1f} mm",
                "trigger_hi": f"अनुमानित वर्षा {rain_drop_threshold:.1f} मिमी से कम हो जाती है",
                "current_value": f"{forecast_rain_mm:.1f} mm",
                "required_delta": f"-{(forecast_rain_mm - rain_drop_threshold):.1f} mm",
                "flips_decision_to": "IRRIGATE"
            })
    elif decision == "IRRIGATE":
        # What would make it NO_IRRIGATION_NEEDED?
        needed_rain_mm = round(net_deficit - raw_mm + 1.0, 1)
        counterfactuals.append({
            "trigger": f"Incoming rainfall reaches {needed_rain_mm:.1f} mm before watering",
            "trigger_hi": f"सिंचाई से पहले {needed_rain_mm:.1f} मिमी बारिश हो जाती है",
            "current_value": f"{forecast_rain_mm:.1f} mm",
            "required_delta": f"+{max(0.0, needed_rain_mm - forecast_rain_mm):.1f} mm",
            "flips_decision_to": "NO_IRRIGATION_NEEDED"
        })
    else:  # INSUFFICIENT_DATA_VERIFY_MANUALLY
        counterfactuals.append({
            "trigger": "Verify field soil moisture with manual physical gauge or restore sensor telemetry",
            "trigger_hi": "मृदा नमी को मैन्युअल गेज से सत्यापित करें या सेंसर कनेक्टिविटी बहाल करें",
            "current_value": f"Reliability: {reliability_score*100:.0f}%",
            "required_delta": "Reach >= 65% Data Reliability Score",
            "flips_decision_to": "IRRIGATE or NO_IRRIGATION_NEEDED"
        })

    # 3. Bilingual Plain-Language Farmer Summary
    if decision == "IRRIGATE":
        summary_en = (
            f"Irrigation is recommended. The crop root zone has depleted {dr_mm:.1f} mm, "
            f"exceeding the safe allowable limit ({raw_mm:.1f} mm). Expected rain ({p_eff_mm:.1f} mm) "
            f"is insufficient to replenish soil water."
        )
        summary_hi = (
            f"सिंचाई की सलाह दी जाती है। फसल की जड़ों में {dr_mm:.1f} मिमी पानी की कमी हो गई है, "
            f"जो सुरक्षित सीमा ({raw_mm:.1f} मिमी) से अधिक है। अनुमानित वर्षा ({p_eff_mm:.1f} मिमी) "
            f"पर्याप्त नहीं है।"
        )
    elif decision == "NO_IRRIGATION_NEEDED":
        summary_en = (
            f"No irrigation is needed today. Current moisture is healthy ({soil_moisture_vol*100:.1f}%), "
            f"which is above the refill threshold ({theta_refill_threshold*100:.1f}%). "
            f"Margin to water stress is {margin_to_raw:.1f} mm."
        )
        summary_hi = (
            f"आज सिंचाई की कोई आवश्यकता नहीं है। वर्तमान मृदा नमी सुरक्षित ({soil_moisture_vol*100:.1f}%) है, "
            f"जो न्यूनतम सीमा ({theta_refill_threshold*100:.1f}%) से ऊपर है।"
        )
    else:
        summary_en = (
            f"Action suspended: Insufficient reliable data. {abstention_reason or 'Data quality is degraded.'} "
            f"Please verify field conditions manually before opening valves."
        )
        summary_hi = (
            f"सिंचाई निर्णय स्थगित: विश्वसनीय डेटा अपर्याप्त है। {abstention_reason or 'डेटा गुणवत्ता कम है।'} "
            f"कृपया वाल्व खोलने से पहले खेत की स्थिति का मैन्युअल सत्यापन करें।"
        )

    # 4. Identify uncertain inputs
    uncertain_inputs = []
    for k, v in provenance.items():
        if isinstance(v, dict) and (v.get("is_estimated") or v.get("source") in ["estimated", "api"]):
            uncertain_inputs.append({
                "field": k,
                "source": v.get("source"),
                "note": "Estimated or non-local API source used"
            })

    return {
        "decision": decision,
        "summary": {
            "en": summary_en,
            "hi": summary_hi
        },
        "drivers": drivers,
        "counterfactuals": counterfactuals,
        "uncertain_inputs": uncertain_inputs,
        "data_provenance_summary": {k: v.get("source") for k, v in provenance.items() if isinstance(v, dict)}
    }

