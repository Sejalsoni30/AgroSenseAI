# AgroSenseAI Future Scope & Planned Enhancements

**Project:** AgroSenseAI – Confidence-Aware & Explainable Irrigation Intelligence Platform  
**Document:** `docs/FUTURE_SCOPE.md`  
**Date:** 2026-10-31  
**Standard Adherence:** Non-Negotiable Integrity Rule #8.

---

## 1. Explicitly Excluded Features in Current Release

In accordance with Non-Negotiable Integrity Rule #8, AgroSenseAI contains no placeholder buttons, no simulated mock components, and no fabricated statistics. The following capabilities are recognized as valuable agronomic directions and are explicitly slated for future phases:

### 1.1. Native LoRaWAN / MQTT Gateway Broker Ingestion
- *Current Release:* Telemetry ingestion via authenticated REST endpoints (`POST /api/readings`) and CSV batch upload.
- *Future Enhancement:* Embedded ChirpStack / TTN (The Things Network) MQTT broker listener directly decoding binary Base64 payloads from field gateways (Dragino, RAKwireless).

### 1.2. Multi-Depth Electrical Conductivity & Salinity Compensation
- *Current Release:* Volumetric water content ($\theta$) gating per soil texture saturation and wilting boundaries.
- *Future Enhancement:* Real-time temperature and bulk EC compensation using the Hilhorst (2000) dielectric pore-water mixing model to prevent fertilizer-induced moisture misreadings.

### 1.3. Direct Valve & Pivot SCADA Automation Actuation
- *Current Release:* Decision-support platform delivering recommendations to farmers and agronomists (`IRRIGATE` / `NO_IRRIGATION_NEEDED` / `INSUFFICIENT_DATA_VERIFY_MANUALLY`).
- *Future Enhancement:* Hardware relays and Modbus/TCP bindings for closed-loop automated valve actuation with hardware interlocks.

### 1.4. Multi-Year Lysimeter In-Field Ground Truth Verification
- *Current Release:* Ground truth benchmark established via FAO-56 daily water-balance simulation under stated physical assumptions.
- *Future Enhancement:* Live multi-year seasonal drainage lysimeter trials comparing physical weight changes against predicted depletion trajectories.

