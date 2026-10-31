# AgroSenseAI AI & Agronomic Hydrology Methodology

**Project:** AgroSenseAI – Confidence-Aware & Explainable Irrigation Intelligence Platform  
**Document:** `docs/AI_METHODOLOGY.md`  
**Reference Standard:** FAO Irrigation and Drainage Paper No. 56 (Allen, Pereira, Raes, & Smith, 1998)  
**Standard Adherence:** Non-Negotiable Integrity Rules #1, #2, #3, #4, #5, #7.

---

## 1. Core Principles

1. **Deterministic Decisions:** Core agronomic recommendations (`IRRIGATE` or `NO_IRRIGATION_NEEDED`) are produced exclusively by deterministic physical equations (FAO-56) and conformal risk bounds, NOT by Large Language Models or uncalibrated black boxes.
2. **Defensible Estimations:** Missing weather or soil data is recovered only through scientifically peer-reviewed formulas (e.g. FAO-56 Hargreaves-Samani temperature-based fallback when solar radiation or wind are unavailable).
3. **Explicit Uncertainty:** Epistemic and aleatoric uncertainties are quantified via Monte-Carlo error propagation and split-conformal prediction intervals. When evidence is inadequate or uncertainty spans the refill boundary, the engine executes the **Reject Option (Abstention)**: `INSUFFICIENT_DATA_VERIFY_MANUALLY`.

---

## 2. Agronomic Hydrology: FAO-56 Water Balance (Module G)

### 2.1. Reference Evapotranspiration ($ET_0$)

#### Primary Method: FAO-56 Penman-Monteith (Eq. 6)
When air temperature, relative humidity, wind speed, and solar radiation are available:
$$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T_{mean} + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$
Where:
- $ET_0$: Reference evapotranspiration ($\text{mm/day}$).
- $R_n$: Net radiation at the crop surface ($\text{MJ/m}^2\text{/day}$).
- $G$: Soil heat flux density ($\approx 0\text{ MJ/m}^2\text{/day}$ for daily calculations, FAO-56 Eq. 42).
- $T_{mean}$: Mean daily air temperature at 2 m height ($^\circ\text{C}$).
- $u_2$: Wind speed at 2 m height ($\text{m/s}$).
- $e_s$: Saturation vapor pressure ($\text{kPa}$), computed as the average of $e^0(T_{max})$ and $e^0(T_{min})$ (Eq. 11, 12).
- $e_a$: Actual vapor pressure ($\text{kPa}$), derived from mean relative humidity: $e_a = e_s \cdot \frac{RH_{mean}}{100}$ (Eq. 19).
- $\Delta$: Slope of the saturation vapor pressure curve ($\text{kPa/}^\circ\text{C}$):
  $$\Delta = \frac{4098 \cdot \left[0.6108 \exp\left(\frac{17.27 T}{T + 237.3}\right)\right]}{(T + 237.3)^2}$$
- $\gamma$: Psychrometric constant ($\text{kPa/}^\circ\text{C}$):
  $$\gamma = 0.000665 \cdot P_{atm}$$
  with atmospheric pressure $P_{atm} = 101.3 \cdot \left(\frac{293 - 0.0065 z}{293}\right)^{5.26}$ (Eq. 7, 8).

#### Fallback Method: Hargreaves-Samani (FAO-56 Eq. 52)
When local net radiation or wind speed sensors are absent (e.g. uninstrumented smallholder plots):
$$ET_0 = 0.0023 \cdot (T_{mean} + 17.8) \cdot (T_{max} - T_{min})^{0.5} \cdot R_a \cdot 0.408$$
Where $R_a$ is extraterrestrial solar radiation ($\text{MJ/m}^2\text{/day}$), computed astronomically from latitude and day-of-year (FAO-56 Eq. 21). Tagged in data provenance as `source: "estimated"`.

### 2.2. Crop Water Demand ($ET_c$)
$$ET_c = K_c \cdot ET_0$$
Where $K_c$ is the crop coefficient determined by growth stage per FAO-56 Table 12:
- Initial Stage: $K_{c,ini} \approx 0.30 - 0.50$
- Development Stage: $K_{c,dev} \approx 0.70 - 0.85$
- Mid-Season Peak: $K_{c,mid} \approx 1.10 - 1.25$
- Late Season Maturity: $K_{c,late} \approx 0.40 - 0.75$

### 2.3. Soil Moisture & Root Depletion
- **Total Available Water ($TAW$):**
  $$TAW = 1000 \cdot (\theta_{fc} - \theta_{pwp}) \cdot Z_r \quad (\text{mm})$$
  Where $\theta_{fc}$ is volumetric moisture at field capacity, $\theta_{pwp}$ is permanent wilting point, and $Z_r$ is active rooting depth (m).
- **Readily Available Water ($RAW$):**
  $$RAW = p \cdot TAW \quad (\text{mm})$$
  Where $p$ is the management allowed depletion fraction (FAO-56 Table 22), adjusted dynamically for high evaporative demand:
  $$p_{adj} = p + 0.04 \cdot (5 - ET_c), \quad 0.10 \le p_{adj} \le 0.80$$
- **Current Root-Zone Depletion ($D_r$):**
  $$D_r = 1000 \cdot (\theta_{fc} - \theta) \cdot Z_r \quad (\text{mm})$$
  Bounded within $[0, TAW]$.

### 2.4. Effective Rainfall ($P_{eff}$)
Using USDA Soil Conservation Service methodology:
$$P_{eff} = \begin{cases} 
P \cdot \frac{125 - 0.2 P}{125} & \text{if } P < 8.3\text{ mm} \\
\frac{125}{3} + 0.1 P & \text{if } P \ge 8.3\text{ mm}
\end{cases}$$

### 2.5. Net Irrigation Requirement ($I_{req}$)
$$I_{req} = \max\left(0, D_r - P_{eff}\right)$$

---

## 3. Pre-Decision Data Reliability Layer (Module B)

Before computing water balance, all inputs pass through five sequential tests:

1. **Physical Boundary Plausibility:**
   $$\theta \in [0.5 \cdot \theta_{pwp}, 1.15 \cdot \theta_{sat}]$$
   Violation penalty: $w = -0.35$.
2. **Spike Detection via Rolling MAD:**
   $$MAD = \text{median}(|x_i - \tilde{x}|)$$
   Outlier flagged if $|x_i - \tilde{x}| > 3.5 \cdot 1.4826 \cdot MAD$.
   Violation penalty: $w = -0.25$.
3. **Stale Weather Gating:**
   If Open-Meteo telemetry age $t_{age} > 10,800\text{ s}$ ($> 3$ hours), penalty: $w = -0.15$.
4. **Calibration Drift Heuristic:**
   Flagged if moisture $\Delta \theta < 0.2\%$ over 5 consecutive steps while $ET_0 > 4.0\text{ mm/day}$ and $P = 0$.
   Violation penalty: $w = -0.20$.
5. **Data Reliability Score ($DRS$):**
   $$DRS = \max\left(0.0, 1.0 - \sum w_j \cdot P_j\right)$$
   If $DRS < 0.65$, recommendation is halted and `INSUFFICIENT_DATA_VERIFY_MANUALLY` is triggered.

---

## 4. Uncertainty Quantification & Conformal Bounds (Module A)

1. **Monte-Carlo Error Propagation:**
   Simulates $N = 1,000$ draws from calibrated instrument error distributions:
   $$\theta \sim \mathcal{N}(\theta_{meas}, \sigma_{\theta}^2), \quad P \sim \mathcal{N}(P_{meas}, \sigma_P^2), \quad ET_0 \sim \mathcal{N}(ET_0, \sigma_{ET}^2)$$
   with $\sigma_\theta = 0.025$, $\sigma_P = 1.5\text{ mm}$, $\sigma_{ET} = 0.45\text{ mm}$.
2. **Conformal Prediction Interval:**
   Extracts empirical 5th, 50th, and 95th percentiles of net root depletion $[q_{0.05}, q_{0.50}, q_{0.95}]$.
3. **Calibrated Abstention Rule:**
   The engine abstains if:
   $$DRS < 0.65 \quad \lor \quad \left(q_{0.05} < RAW < q_{0.95} \;\land\; (q_{0.95} - q_{0.05}) > \Delta_{tol}\right)$$
   Where $\Delta_{tol} = 6.0\text{ mm}$.

---

## 5. Farmer-Centric Explainability & Counterfactuals (Module E)

Based on Wachter, Mittelstadt, & Russell (2017), explanations are computed as exact physical tipping points:
1. **Soil Moisture Threshold Flip:**
   $$\theta^* = \theta_{fc} - \frac{RAW}{1000 \cdot Z_r}$$
   "If soil moisture drops below $\theta^*$, decision flips to IRRIGATE."
2. **Rainfall Cancellation Threshold:**
   $$P^* = D_r - RAW$$
   "If incoming rainfall reaches $P^*$, scheduled irrigation is canceled."

