"""
Module A: Dual Uncertainty Quantification & Calibrated Abstention
Combines Monte-Carlo physical error propagation through FAO-56 with
conformal interval bounds. Evaluates calibration and enforces the abstention rule.
"""

from typing import Dict, Any, List, Tuple
import numpy as np

# Typical agricultural sensor error standard deviations
SIGMA_MOISTURE_VOL = 0.025   # ~2.5% volumetric water content uncertainty
SIGMA_RAIN_MM = 1.5           # Precipitation gauge / radar uncertainty
SIGMA_ET0_MM = 0.45           # Evapotranspiration formula / radiation uncertainty

def monte_carlo_water_balance(
    soil_moisture_vol: float,
    raw_mm: float,
    taw_mm: float,
    theta_fc: float,
    root_depth_m: float,
    et0_mm: float,
    kc: float,
    forecast_rain_mm: float,
    n_samples: int = 1000
) -> Dict[str, Any]:
    """
    Propagates input measurement uncertainty through FAO-56 root zone depletion.
    Samples theta, rain, ET0 from calibrated normal distributions.
    """
    np.random.seed(42)  # Deterministic testable engine

    # Draw perturbed inputs
    moisture_draws = np.random.normal(soil_moisture_vol, SIGMA_MOISTURE_VOL, n_samples)
    moisture_draws = np.clip(moisture_draws, 0.01, 0.55)

    rain_draws = np.random.normal(forecast_rain_mm, SIGMA_RAIN_MM, n_samples)
    rain_draws = np.clip(rain_draws, 0.0, 100.0)

    et0_draws = np.random.normal(et0_mm, SIGMA_ET0_MM, n_samples)
    et0_draws = np.clip(et0_draws, 0.5, 15.0)

    etc_draws = kc * et0_draws

    # Effective rain draws
    p_eff_draws = np.where(
        rain_draws < 8.3,
        rain_draws * (125.0 - 0.2 * rain_draws) / 125.0,
        125.0 / 3.0 + 0.1 * rain_draws
    )
    p_eff_draws = np.clip(p_eff_draws, 0.0, rain_draws)

    # Depletion draws: Dr = 1000 * (theta_fc - theta) * Zr
    dr_draws = 1000.0 * (theta_fc - moisture_draws) * root_depth_m
    dr_draws = np.clip(dr_draws, 0.0, taw_mm)

    # Net deficit: Deficit = Dr - Peff
    deficit_draws = np.clip(dr_draws - p_eff_draws, 0.0, taw_mm)

    # Probability that net deficit exceeds RAW (irrigation needed)
    p_irrigate = float(np.mean(deficit_draws >= raw_mm))

    # Conformal / empirical percentiles (90% interval: 5th to 95th)
    q05 = float(np.percentile(dr_draws, 5))
    q50 = float(np.percentile(dr_draws, 50))
    q95 = float(np.percentile(dr_draws, 95))

    interval_width = round(q95 - q05, 2)
    straddles_raw = bool(q05 < raw_mm < q95)

    return {
        "p_irrigate": round(p_irrigate, 3),
        "dr_samples_mean": round(float(np.mean(dr_draws)), 2),
        "dr_samples_std": round(float(np.std(dr_draws)), 2),
        "dr_interval_90": {
            "lower": round(q05, 2),
            "median": round(q50, 2),
            "upper": round(q95, 2),
            "width_mm": interval_width
        },
        "straddles_raw_threshold": straddles_raw,
        "n_samples": n_samples
    }


def compute_decision_and_abstention(
    reliability_score: float,
    dr_mm: float,
    raw_mm: float,
    taw_mm: float,
    p_eff_mm: float,
    mc_results: Dict[str, Any],
    requires_manual_verification: bool = False,
    straddle_tolerance_mm: float = 6.0
) -> Dict[str, Any]:
    """
    Deterministic decision logic with explicit ABSTENTION capability.
    Outputs exactly one of:
    - IRRIGATE
    - NO_IRRIGATION_NEEDED
    - INSUFFICIENT_DATA_VERIFY_MANUALLY
    """
    dr_net = dr_mm - p_eff_mm
    interval_width = mc_results["dr_interval_90"]["width_mm"]
    straddles = mc_results["straddles_raw_threshold"]

    # Condition 1: Data reliability is below minimum threshold
    if reliability_score < 0.65 or requires_manual_verification:
        return {
            "decision": "INSUFFICIENT_DATA_VERIFY_MANUALLY",
            "abstention_reason": f"Data reliability score ({reliability_score:.2f}) is below safe threshold 0.65 or critical sensor data is missing.",
            "confidence_band": "LOW",
            "dr_net_mm": round(dr_net, 2)
        }

    # Condition 2: Uncertainty interval straddles the RAW threshold beyond tolerance
    if straddles and interval_width > straddle_tolerance_mm:
        return {
            "decision": "INSUFFICIENT_DATA_VERIFY_MANUALLY",
            "abstention_reason": f"Root-zone depletion interval [{mc_results['dr_interval_90']['lower']} - {mc_results['dr_interval_90']['upper']} mm] straddles refill boundary ({raw_mm} mm) with high variance (width {interval_width} mm > {straddle_tolerance_mm} mm tolerance).",
            "confidence_band": "MODERATE_UNCERTAIN",
            "dr_net_mm": round(dr_net, 2)
        }

    # High-confidence deterministic recommendation
    if dr_net >= raw_mm:
        decision = "IRRIGATE"
        confidence_band = "HIGH" if reliability_score >= 0.85 else "MODERATE"
        reason = f"Net root-zone depletion ({dr_net:.1f} mm) exceeds Readily Available Water threshold ({raw_mm:.1f} mm)."
    else:
        decision = "NO_IRRIGATION_NEEDED"
        confidence_band = "HIGH" if reliability_score >= 0.85 else "MODERATE"
        reason = f"Net root-zone depletion ({dr_net:.1f} mm) is within safe crop tolerance ({raw_mm:.1f} mm)."

    return {
        "decision": decision,
        "abstention_reason": None,
        "reason": reason,
        "confidence_band": confidence_band,
        "dr_net_mm": round(dr_net, 2)
    }


def compute_expected_calibration_error(
    predicted_probs: List[float],
    true_labels: List[int],
    n_bins: int = 5
) -> float:
    """
    Computes Expected Calibration Error (ECE) for test evaluation:
    ECE = sum_b (|B_b| / N) * |acc(B_b) - conf(B_b)|
    """
    if not predicted_probs or len(predicted_probs) != len(true_labels):
        return 0.0

    bins = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    total_samples = len(predicted_probs)

    probs = np.array(predicted_probs)
    labels = np.array(true_labels)

    for i in range(n_bins):
        bin_lower = bins[i]
        bin_upper = bins[i+1]
        mask = (probs >= bin_lower) & (probs <= bin_upper) if i == n_bins - 1 else (probs >= bin_lower) & (probs < bin_upper)
        bin_size = np.sum(mask)

        if bin_size > 0:
            bin_conf = np.mean(probs[mask])
            bin_acc = np.mean(labels[mask])
            ece += (bin_size / total_samples) * abs(bin_acc - bin_conf)

    return round(float(ece), 4)

