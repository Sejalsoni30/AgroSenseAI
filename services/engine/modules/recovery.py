"""
Module D: Missing-Data Recovery & Provenance Tracking
Applies defensible scientific fallbacks (FAO-56 Hargreaves),
attaches source provenance metadata, and lowers confidence.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .fao56 import hargreaves_samani_et0, penman_monteith_et0

def recover_missing_data(
    raw_inputs: Dict[str, Any],
    weather_forecast: Optional[Dict[str, Any]] = None,
    latitude_deg: float = 25.0
) -> Dict[str, Any]:
    """
    Recovers missing inputs using defensible methods only.
    Returns processed inputs, provenance metadata, recovery actions,
    and missingness score.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    processed_inputs = {}
    provenance = {}
    recovery_log = []
    missing_count = 0
    total_core_fields = 4  # soil_moisture, temperature, humidity, rainfall

    # 1. Soil Moisture
    sm = raw_inputs.get("soil_moisture")
    sm_src = raw_inputs.get("soil_moisture_source", "measured")
    if sm is not None:
        processed_inputs["soil_moisture"] = float(sm)
        provenance["soil_moisture"] = {
            "value": float(sm),
            "unit": "m3/m3",
            "source": sm_src,
            "timestamp": raw_inputs.get("timestamp", now_iso),
            "age_seconds": raw_inputs.get("age_seconds", 0),
            "is_estimated": sm_src in ["estimated", "simulated"]
        }
    else:
        missing_count += 1
        recovery_log.append({
            "field": "soil_moisture",
            "action": "UNRECOVERABLE",
            "reason": "Direct in-situ root-zone soil moisture cannot be synthesized without local measurements. Field sampling requested."
        })
        provenance["soil_moisture"] = {
            "value": None,
            "unit": "m3/m3",
            "source": "missing",
            "timestamp": now_iso,
            "age_seconds": 0,
            "is_estimated": False
        }

    # 2. Temperature
    temp = raw_inputs.get("temperature")
    if temp is not None:
        processed_inputs["temperature"] = float(temp)
        provenance["temperature"] = {
            "value": float(temp),
            "unit": "degC",
            "source": raw_inputs.get("temperature_source", "measured"),
            "timestamp": raw_inputs.get("timestamp", now_iso),
            "age_seconds": raw_inputs.get("age_seconds", 0),
            "is_estimated": False
        }
    elif weather_forecast and weather_forecast.get("temperature") is not None:
        val = float(weather_forecast["temperature"])
        processed_inputs["temperature"] = val
        recovery_log.append({
            "field": "temperature",
            "action": "API_FALLBACK",
            "reason": "Missing local ambient sensor. Recovered from Open-Meteo weather reanalysis."
        })
        provenance["temperature"] = {
            "value": val,
            "unit": "degC",
            "source": "api",
            "timestamp": weather_forecast.get("timestamp", now_iso),
            "age_seconds": weather_forecast.get("age_seconds", 600),
            "is_estimated": True
        }
    else:
        missing_count += 1
        processed_inputs["temperature"] = 25.0  # nominal default
        recovery_log.append({
            "field": "temperature",
            "action": "DEFAULT_ESTIMATE",
            "reason": "No local sensor or API weather available. Assumed seasonal default (25.0 C)."
        })
        provenance["temperature"] = {
            "value": 25.0,
            "unit": "degC",
            "source": "estimated",
            "timestamp": now_iso,
            "age_seconds": 0,
            "is_estimated": True
        }

    # 3. Humidity
    rh = raw_inputs.get("humidity")
    if rh is not None:
        processed_inputs["humidity"] = float(rh)
        provenance["humidity"] = {
            "value": float(rh),
            "unit": "%",
            "source": raw_inputs.get("humidity_source", "measured"),
            "timestamp": raw_inputs.get("timestamp", now_iso),
            "age_seconds": raw_inputs.get("age_seconds", 0),
            "is_estimated": False
        }
    elif weather_forecast and weather_forecast.get("humidity") is not None:
        val = float(weather_forecast["humidity"])
        processed_inputs["humidity"] = val
        recovery_log.append({
            "field": "humidity",
            "action": "API_FALLBACK",
            "reason": "Missing local relative humidity. Recovered from Open-Meteo API."
        })
        provenance["humidity"] = {
            "value": val,
            "unit": "%",
            "source": "api",
            "timestamp": weather_forecast.get("timestamp", now_iso),
            "age_seconds": weather_forecast.get("age_seconds", 600),
            "is_estimated": True
        }
    else:
        missing_count += 1
        processed_inputs["humidity"] = 50.0  # nominal 50%
        recovery_log.append({
            "field": "humidity",
            "action": "DEFAULT_ESTIMATE",
            "reason": "Missing humidity. Assumed 50% nominal relative humidity."
        })
        provenance["humidity"] = {
            "value": 50.0,
            "unit": "%",
            "source": "estimated",
            "timestamp": now_iso,
            "age_seconds": 0,
            "is_estimated": True
        }

    # 4. Rainfall
    rain = raw_inputs.get("rainfall")
    if rain is not None:
        processed_inputs["rainfall"] = float(rain)
        provenance["rainfall"] = {
            "value": float(rain),
            "unit": "mm",
            "source": raw_inputs.get("rainfall_source", "measured"),
            "timestamp": raw_inputs.get("timestamp", now_iso),
            "age_seconds": raw_inputs.get("age_seconds", 0),
            "is_estimated": False
        }
    elif weather_forecast and weather_forecast.get("precipitation") is not None:
        val = float(weather_forecast["precipitation"])
        processed_inputs["rainfall"] = val
        recovery_log.append({
            "field": "rainfall",
            "action": "API_FALLBACK",
            "reason": "Local rain gauge absent. Recovered from Open-Meteo precipitation forecast."
        })
        provenance["rainfall"] = {
            "value": val,
            "unit": "mm",
            "source": "api",
            "timestamp": weather_forecast.get("timestamp", now_iso),
            "age_seconds": weather_forecast.get("age_seconds", 600),
            "is_estimated": True
        }
    else:
        missing_count += 1
        processed_inputs["rainfall"] = 0.0
        recovery_log.append({
            "field": "rainfall",
            "action": "CONSERVATIVE_ZERO",
            "reason": "No rainfall telemetry available. Assumed 0.0 mm conservative dry boundary."
        })
        provenance["rainfall"] = {
            "value": 0.0,
            "unit": "mm",
            "source": "estimated",
            "timestamp": now_iso,
            "age_seconds": 0,
            "is_estimated": True
        }

    # 5. ET0 Calculation method determination (Penman-Monteith vs Hargreaves fallback)
    has_full_radiation = raw_inputs.get("solar_radiation_mj") is not None or (weather_forecast and weather_forecast.get("shortwave_radiation") is not None)
    has_wind = raw_inputs.get("wind_speed_2m") is not None or (weather_forecast and weather_forecast.get("wind_speed") is not None)
    
    t_min = raw_inputs.get("t_min", processed_inputs["temperature"] - 4.0)
    t_max = raw_inputs.get("t_max", processed_inputs["temperature"] + 4.0)

    if has_full_radiation and has_wind:
        wind = float(raw_inputs.get("wind_speed_2m") or (weather_forecast.get("wind_speed") if weather_forecast else 2.0))
        rad = float(raw_inputs.get("solar_radiation_mj") or (weather_forecast.get("shortwave_radiation") if weather_forecast else 18.0))
        et0 = penman_monteith_et0(
            t_mean=processed_inputs["temperature"],
            t_min=t_min,
            t_max=t_max,
            rh_mean=processed_inputs["humidity"],
            wind_speed_2m=wind,
            solar_radiation_mj=rad,
            latitude_deg=latitude_deg
        )
        et0_method = "FAO-56 Penman-Monteith (full meteorological data)"
        et0_source = "measured" if raw_inputs.get("solar_radiation_mj") else "api"
    else:
        # Fallback to FAO-56 Eq. 52 Hargreaves-Samani
        et0 = hargreaves_samani_et0(t_min=t_min, t_max=t_max, latitude_deg=latitude_deg)
        et0_method = "FAO-56 Hargreaves-Samani fallback (Tmin/Tmax only)"
        et0_source = "estimated"
        recovery_log.append({
            "field": "et0",
            "action": "HARGREAVES_FALLBACK",
            "reason": "Missing solar radiation or wind telemetry. Applied defensible FAO-56 Eq. 52 temperature-based equation."
        })

    provenance["et0"] = {
        "value": et0,
        "unit": "mm/day",
        "source": et0_source,
        "method": et0_method,
        "timestamp": now_iso,
        "is_estimated": et0_source == "estimated"
    }

    missing_fraction = round(missing_count / total_core_fields, 2)
    requires_manual_verification = missing_fraction >= 0.50 or sm is None

    return {
        "processed_inputs": processed_inputs,
        "provenance": provenance,
        "recovery_log": recovery_log,
        "et0_mm": et0,
        "et0_method": et0_method,
        "missing_fraction": missing_fraction,
        "requires_manual_verification": requires_manual_verification
    }

