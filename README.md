# AgroSenseAI – Confidence-Aware & Explainable Irrigation Intelligence Platform

[![Engine Tests](https://img.shields.io/badge/pytest-8%20passed-brightgreen)](#testing--evaluation)
[![Evaluation Harness](https://img.shields.io/badge/Selective%20Accuracy-94.2%25-forestgreen)](#empirical-evaluation)
[![Standards](https://img.shields.io/badge/Hydrology-FAO--56-blue)](#scientific-methodology)
[![License](https://img.shields.io/badge/Weather%20Data-Open--Meteo%20CC--BY%204.0-sky)](#weather-integration)

> **Core Research Question:**  
> *"How can an irrigation recommender stay reliable when agricultural data is incomplete, noisy, conflicting, or stale?"*

AgroSenseAI is a research-grounded, confidence-aware decision-support platform. Unlike standard smart-irrigation dashboards that feed unverified telemetry into opaque black boxes, AgroSenseAI **evaluates data reliability before recommending, quantifies uncertainty with conformal prediction intervals, and exercises the explicit right to ABSTAIN (`INSUFFICIENT_DATA_VERIFY_MANUALLY`) when evidence is degraded.**

---

## 1. Quick Start: Run Everything with One Command

AgroSenseAI requires zero external database installation. If `MONGODB_URI` is omitted, the API gateway automatically launches an in-memory MongoDB server and seeds verified demo data!

### Prerequisites
- **Node.js** v18+ (tested on v24.14) & **npm**
- **Python** 3.10+ (tested on 3.12) with packages: `fastapi uvicorn numpy pandas scipy scikit-learn pytest httpx`

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Start Full Stack (Web + API + Decision Engine)
```bash
npm run dev
```

This single command starts:
- **Decision Engine (Python FastAPI):** `http://127.0.0.1:8000`
- **Backend API Gateway (Express + MongoDB):** `http://localhost:5000`
- **Web Frontend (React + Vite + Tailwind):** `http://localhost:3000`

Open **`http://localhost:3000`** in your browser to interact with the live application.

---

## 2. Demo User Credentials & Non-Negotiable Integrity Rules

To evaluate the platform immediately with seeded farms and telemetry:
- **Login Email:** `demo@agrosense.ai`
- **Password:** `demo123`
*(Or click the "One-Click Demo Access" button on the Sign-In page)*

### Strict Integrity Guardrails Enforced:
1. **Rule #1 (No Fabricated Readings):** All demo data is strictly labelled **"DEMO DATA"** in the UI and DB (`source: "demo"`).
2. **Rule #2 (Provenance Tracking):** Every telemetry datum carries: `{ value, unit, source, timestamp, age }` where source $\in$ `[measured, manual, api, estimated, simulated, demo]`.
3. **Rule #3 (Defensible Fallbacks):** Never silently imputes missing data. Missing weather falls back strictly to the peer-reviewed **FAO-56 Hargreaves-Samani equation** with explicit confidence penalties.
4. **Rule #5 (Deterministic Core):** Core decisions are produced by physical FAO-56 mass balance and conformal risk bounds, NOT by an LLM.
5. **Rule #6 (Zero Auto-Retraining):** Farmer feedback is stored strictly for post-hoc comparison and audit, completely isolated from model retraining pipelines.

---

## 3. Decision Engine Outputs

The engine outputs exactly one of three states:
1. **`IRRIGATE`** – Net root-zone depletion ($D_r$) exceeds Readily Available Water ($RAW$) under high data reliability.
2. **`NO_IRRIGATION_NEEDED`** – Root-zone water is within safe crop tolerance or forecast rainfall satisfies demand.
3. **`INSUFFICIENT_DATA_VERIFY_MANUALLY`** – Data Reliability Score $< 65\%$ OR the 90% conformal prediction interval straddles the refill boundary beyond tolerance.

---

## 4. Interactive Pages & Navigation

| Route | Page | Core Functionality |
| :--- | :--- | :--- |
| `/` | **Landing Page** | Platform overview, research foundation, and quick launch links. |
| `/dashboard` | **Farmer Dashboard** | Real-time Recharts visuals: soil moisture trajectory vs FC/RAW/PWP, recent telemetry table. |
| `/irrigation` | **Irrigation Intelligence** | In-situ telemetry input, CSV batch upload, live Open-Meteo weather fetch, and full decision evaluation panel. |
| `/farms` | **Farm & Zones** | CRUD agricultural properties and multi-depth management zones (soil textures, crops, root depth $Z_r$). |
| `/reliability` | **Data Reliability Center** | Pre-decision penalty inspector, physical bound checks, rolling MAD spike detection, and sensor disagreement arbitration. |
| `/what-if` | **What-If Simulator** | Interactive sandbox with sliders for rainfall, heatwaves, and probe dropouts; side-by-side comparison with `SIMULATED` badges. |
| `/water` | **Water Management** | Seasonal water allocation, underwatering/overwatering risk gauges, and soil available water spectrum. |
| `/history` | **Audit & History** | Append-only decision snapshot inspection and grower feedback submission form (with Rule #6 notice). |
| `/assistant` | **Farmer Assistant** | Plain-language bilingual advisory (English & हिन्दी) with Web Speech API audio synthesis and text fallback. |
| `/settings` | **Settings** | Language preferences, safety cutoffs, and live microservice health diagnostics. |

---

## 5. Testing & Empirical Evaluation

### Run Engine Unit Tests
```bash
npm run test:engine
```
*Output: 8 passed unit tests covering FAO-56 Penman-Monteith, Hargreaves fallback, water balance, rolling MAD spikes, disagreement arbitration, and abstention rules.*

### Run Reproducible Evaluation Harness
```bash
python -m services.engine.eval.harness
```
*Evaluates 600 synthetic agronomic scenarios, measures controlled fault injection precision/recall, compares Baselines A, B, and AgroSenseAI, and generates `docs/TESTING_AND_EVALUATION.md`.*

#### Measured Benchmark Highlights:
- **Fault Detection Precision / Recall:** `1.000` / `0.824` (F1: `0.903`)
- **AgroSenseAI Selective Accuracy:** `94.2%` (vs `79.2%` for threshold baseline and `90.5%` for raw FAO-56)
- **False-Irrigation Rate:** Reduced from `3.0%` (raw FAO-56) down to **`0.0%`**
- **Expected Calibration Error (ECE):** `0.0778`
- **p95 Engine Latency:** `2.0 ms`

---

## 6. Monorepo Architecture

```text
/
├── apps/
│   ├── api/          # Node.js + Express + TypeScript + Mongoose (Port 5000)
│   └── web/          # React + Vite + Tailwind + Recharts + i18next (Port 3000)
├── services/
│   └── engine/       # Python FastAPI + NumPy + SciPy + scikit-learn (Port 8000)
├── docs/             # Research & Engineering Documentation
│   ├── COMPETITIVE_ANALYSIS.md
│   ├── RESEARCH_GAP.md
│   ├── INNOVATION_MATRIX.md
│   ├── AI_METHODOLOGY.md
│   ├── TESTING_AND_EVALUATION.md
│   └── FUTURE_SCOPE.md
├── docker-compose.yml
└── package.json      # Monorepo orchestration scripts
```

---

## 7. Citations & Attribution

- **FAO-56 Reference:** Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998). *Crop evapotranspiration - Guidelines for computing crop water requirements*. FAO Irrigation and drainage paper 56, Rome.
- **Weather Telemetry:** Weather data provided by [Open-Meteo.com](https://open-meteo.com) under Creative Commons Attribution 4.0 International (CC-BY 4.0).
- **Counterfactual Explanations:** Wachter, S., Mittelstadt, B., & Russell, C. (2017). *Counterfactual Explanations without Opening the Black Box: Automated Decisions and the GDPR*. Harvard Journal of Law & Technology.

