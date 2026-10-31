"""
FAO-56 Evapotranspiration and Water Balance Calculations
Reference: Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998).
Crop evapotranspiration - Guidelines for computing crop water requirements -
FAO Irrigation and drainage paper 56. FAO, Rome.
"""

import math
from typing import Dict, Any, Tuple, Optional

# Default FAO-56 Crop Coefficients (Table 12)
DEFAULT_CROP_KC = {
    "wheat": {"initial": 0.30, "development": 0.75, "mid": 1.15, "late": 0.40, "p": 0.55, "root_depth": 1.2},
    "corn": {"initial": 0.30, "development": 0.80, "mid": 1.20, "late": 0.60, "p": 0.55, "root_depth": 1.2},
    "tomato": {"initial": 0.60, "development": 0.85, "mid": 1.15, "late": 0.80, "p": 0.40, "root_depth": 0.8},
    "cotton": {"initial": 0.35, "development": 0.75, "mid": 1.20, "late": 0.65, "p": 0.65, "root_depth": 1.4},
    "rice": {"initial": 1.05, "development": 1.10, "mid": 1.20, "late": 0.90, "p": 0.20, "root_depth": 0.6},
    "potato": {"initial": 0.50, "development": 0.80, "mid": 1.15, "late": 0.75, "p": 0.35, "root_depth": 0.6},
    "sugarcane": {"initial": 0.40, "development": 0.85, "mid": 1.25, "late": 0.75, "p": 0.65, "root_depth": 1.5},
    "soybean": {"initial": 0.40, "development": 0.75, "mid": 1.15, "late": 0.50, "p": 0.50, "root_depth": 1.0},
    "general": {"initial": 0.40, "development": 0.80, "mid": 1.15, "late": 0.60, "p": 0.50, "root_depth": 1.0}
}

# Soil physical parameters: (Field Capacity theta_fc, Permanent Wilting Point theta_pwp, Saturation theta_s)
SOIL_PROPERTIES = {
    "sandy": {"fc": 0.12, "pwp": 0.05, "sat": 0.38, "name": "Sandy Soil"},
    "sandy_loam": {"fc": 0.18, "pwp": 0.08, "sat": 0.43, "name": "Sandy Loam"},
    "loam": {"fc": 0.27, "pwp": 0.12, "sat": 0.47, "name": "Loam"},
    "clay_loam": {"fc": 0.32, "pwp": 0.17, "sat": 0.49, "name": "Clay Loam"},
    "silty_clay": {"fc": 0.36, "pwp": 0.21, "sat": 0.51, "name": "Silty Clay"},
    "clay": {"fc": 0.40, "pwp": 0.24, "sat": 0.53, "name": "Clay"}
}


def extraterrestrial_radiation_ra(latitude_deg: float, day_of_year: int) -> float:
    """
    Computes extraterrestrial radiation Ra (MJ / m^2 / day) - FAO-56 Eq. 21.
    """
    lat_rad = math.radians(latitude_deg)
    # Inverse relative distance Earth-Sun (Eq. 23)
    dr = 1 + 0.033 * math.cos(2 * math.pi * day_of_year / 365)
    # Solar declination (Eq. 24)
    delta = 0.409 * math.sin((2 * math.pi * day_of_year / 365) - 1.39)
    # Sunset hour angle (Eq. 25)
    cos_omega_s = -math.tan(lat_rad) * math.tan(delta)
    cos_omega_s = max(-1.0, min(1.0, cos_omega_s))
    omega_s = math.acos(cos_omega_s)

    # Ra in MJ / m^2 / day (Eq. 21)
    gsc = 0.0820  # Solar constant MJ / m^2 / min
    ra = (24 * 60 / math.pi) * gsc * dr * (
        omega_s * math.sin(lat_rad) * math.sin(delta) +
        math.cos(lat_rad) * math.cos(delta) * math.sin(omega_s)
    )
    return max(0.0, ra)


def hargreaves_samani_et0(t_min: float, t_max: float, latitude_deg: float, day_of_year: int = 180) -> float:
    """
    FAO-56 Eq. 52: Hargreaves-Samani ETo estimation when only Tmin & Tmax exist.
    ETo = 0.0023 * (Tmean + 17.8) * (Tmax - Tmin)^0.5 * 0.408 * Ra
    Where 0.408 converts MJ/m^2/day to mm/day.
    """
    t_mean = (t_max + t_min) / 2.0
    t_range = max(0.1, t_max - t_min)
    ra_mj = extraterrestrial_radiation_ra(latitude_deg, day_of_year)
    ra_mm = 0.408 * ra_mj
    et0 = 0.0023 * (t_mean + 17.8) * math.sqrt(t_range) * ra_mm
    return round(max(0.0, et0), 2)


def penman_monteith_et0(
    t_mean: float,
    t_min: float,
    t_max: float,
    rh_mean: float,
    wind_speed_2m: float,
    solar_radiation_mj: Optional[float] = None,
    altitude_m: float = 100.0,
    latitude_deg: float = 25.0,
    day_of_year: int = 180
) -> float:
    """
    FAO-56 Eq. 6: Standard FAO Penman-Monteith equation for reference ETo (mm/day).
    """
    # Atmospheric pressure (Eq. 7)
    p_atm = 101.3 * math.pow((293.0 - 0.0065 * altitude_m) / 293.0, 5.26)
    # Psychrometric constant (Eq. 8)
    gamma = 0.000665 * p_atm

    # Saturation vapor pressure (Eq. 11, 12)
    def sat_vp(t: float) -> float:
        return 0.6108 * math.exp((17.27 * t) / (t + 237.3))

    e_s = (sat_vp(t_max) + sat_vp(t_min)) / 2.0
    # Actual vapor pressure from RH mean (Eq. 19)
    e_a = e_s * (max(5.0, min(100.0, rh_mean)) / 100.0)

    # Slope of saturation vapor pressure curve (Eq. 13)
    delta = (4098.0 * sat_vp(t_mean)) / math.pow(t_mean + 237.3, 2)

    # Net radiation estimation if solar radiation is given or fallback
    ra_mj = extraterrestrial_radiation_ra(latitude_deg, day_of_year)
    if solar_radiation_mj is None or solar_radiation_mj <= 0:
        # Estimate Rs from temperature range (Eq. 50)
        k_rs = 0.16  # interior default
        r_s = k_rs * math.sqrt(max(0.1, t_max - t_min)) * ra_mj
    else:
        r_s = solar_radiation_mj

    # Net shortwave radiation (Eq. 38, albedo = 0.23)
    r_ns = (1.0 - 0.23) * r_s
    # Clear-sky solar radiation (Eq. 37)
    r_so = (0.75 + 2e-5 * altitude_m) * ra_mj
    r_so = max(0.1, r_so)
    # Net longwave radiation (Eq. 39)
    sigma = 4.903e-9  # Stefan-Boltzmann constant MJ/K^4/m^2/day
    t_max_k4 = math.pow(t_max + 273.16, 4)
    t_min_k4 = math.pow(t_min + 273.16, 4)
    f_cloud = 1.35 * min(1.0, max(0.3, r_s / r_so)) - 0.35
    f_humidity = 0.34 - 0.14 * math.sqrt(max(0.01, e_a))
    r_nl = sigma * ((t_max_k4 + t_min_k4) / 2.0) * f_humidity * f_cloud
    r_n = r_ns - r_nl

    # Daily soil heat flux G is assumed negligible (G ~ 0, Eq. 42)
    g = 0.0

    # Wind speed 2m
    u2 = max(0.5, wind_speed_2m)

    # FAO Penman-Monteith (Eq. 6)
    numerator = 0.408 * delta * (r_n - g) + gamma * (900.0 / (t_mean + 273.0)) * u2 * (e_s - e_a)
    denominator = delta + gamma * (1.0 + 0.34 * u2)

    et0 = numerator / denominator
    return round(max(0.2, et0), 2)


def calculate_water_balance(
    crop_name: str,
    growth_stage: str,
    soil_type: str,
    soil_moisture_vol: float,  # e.g. 0.22 for 22%
    et0_mm: float,
    forecast_rain_mm: float = 0.0,
    root_depth_custom_m: Optional[float] = None
) -> Dict[str, Any]:
    """
    Computes FAO-56 daily root zone water balance:
    - Kc, ETc = Kc * ETo
    - TAW, RAW
    - Current Depletion Dr
    - Effective rainfall Peff
    - Net irrigation requirement
    - Over/underwatering risk indices
    """
    crop = DEFAULT_CROP_KC.get(crop_name.lower(), DEFAULT_CROP_KC["general"])
    stage_key = growth_stage.lower()
    if "dev" in stage_key:
        kc = crop["development"]
    elif "mid" in stage_key:
        kc = crop["mid"]
    elif "late" in stage_key:
        kc = crop["late"]
    else:
        kc = crop["initial"]

    etc_mm = round(kc * et0_mm, 2)

    soil = SOIL_PROPERTIES.get(soil_type.lower(), SOIL_PROPERTIES["loam"])
    theta_fc = soil["fc"]
    theta_pwp = soil["pwp"]
    theta_sat = soil["sat"]

    root_depth_m = root_depth_custom_m if root_depth_custom_m and root_depth_custom_m > 0 else crop["root_depth"]

    # Total Available Water TAW (mm) = 1000 * (theta_fc - theta_pwp) * Zr (FAO-56 Eq. 82)
    taw_mm = round(1000.0 * (theta_fc - theta_pwp) * root_depth_m, 2)

    # Management allowed depletion fraction p (FAO-56 Table 22), adjusted for ETc (FAO-56 p. 162)
    p_base = crop["p"]
    p_adj = p_base + 0.04 * (5.0 - etc_mm)
    p_adj = round(max(0.1, min(0.8, p_adj)), 2)

    # Readily Available Water RAW (mm) = p * TAW (FAO-56 Eq. 83)
    raw_mm = round(p_adj * taw_mm, 2)

    # Current root zone depletion Dr (mm) = 1000 * (theta_fc - theta) * Zr (FAO-56 Eq. 85)
    # If theta > theta_fc, Dr = 0 (soil is at or above field capacity)
    theta_clamped = max(0.01, min(theta_sat, soil_moisture_vol))
    dr_mm = round(max(0.0, min(taw_mm, 1000.0 * (theta_fc - theta_clamped) * root_depth_m)), 2)

    # Effective rainfall (USDA SCS method approximation)
    if forecast_rain_mm <= 0:
        p_eff_mm = 0.0
    elif forecast_rain_mm < 8.3:
        p_eff_mm = round(forecast_rain_mm * (125.0 - 0.2 * forecast_rain_mm) / 125.0, 2)
    else:
        p_eff_mm = round(125.0 / 3.0 + 0.1 * forecast_rain_mm, 2)
    p_eff_mm = max(0.0, min(forecast_rain_mm, p_eff_mm))

    # Net irrigation requirement to restore root zone to field capacity:
    # I_net = Dr - Peff
    net_irrigation_req_mm = round(max(0.0, dr_mm - p_eff_mm), 2)

    # Soil moisture deficit percentage relative to RAW
    stress_ratio = dr_mm / raw_mm if raw_mm > 0 else 0.0

    # Risk metrics
    underwatering_risk = 0.0
    if dr_mm > raw_mm:
        # Scaling risk linearly between RAW and TAW
        underwatering_risk = min(100.0, round(((dr_mm - raw_mm) / max(1.0, (taw_mm - raw_mm))) * 100.0, 1))

    # Overwatering risk if irrigating beyond Dr
    overwatering_risk = 0.0
    if theta_clamped > theta_fc:
        overwatering_risk = min(100.0, round(((theta_clamped - theta_fc) / (theta_sat - theta_fc)) * 100.0, 1))

    # Moisture threshold theta_star at which Dr reaches RAW:
    # RAW = 1000 * (theta_fc - theta_star) * Zr => theta_star = theta_fc - (RAW / (1000 * Zr))
    theta_refill_star = round(theta_fc - (raw_mm / (1000.0 * root_depth_m)), 3)

    return {
        "crop": crop_name,
        "growth_stage": growth_stage,
        "kc": kc,
        "et0_mm": et0_mm,
        "etc_mm": etc_mm,
        "soil_type": soil["name"],
        "theta_fc": theta_fc,
        "theta_pwp": theta_pwp,
        "theta_sat": theta_sat,
        "root_depth_m": root_depth_m,
        "taw_mm": taw_mm,
        "raw_mm": raw_mm,
        "p_fraction": p_adj,
        "dr_mm": dr_mm,
        "forecast_rain_mm": forecast_rain_mm,
        "p_eff_mm": p_eff_mm,
        "net_irrigation_req_mm": net_irrigation_req_mm,
        "stress_ratio": round(stress_ratio, 2),
        "underwatering_risk_pct": underwatering_risk,
        "overwatering_risk_pct": overwatering_risk,
        "theta_refill_threshold": theta_refill_star
    }

