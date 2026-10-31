import axios from 'axios';

const ENGINE_BASE_URL = process.env.ENGINE_URL || 'http://127.0.0.1:8000';

export interface EngineEvaluatePayload {
  zone_id?: string;
  crop_name: string;
  growth_stage: string;
  soil_type: string;
  soil_moisture?: number | null;
  soil_moisture_source?: string;
  temperature?: number | null;
  temperature_source?: string;
  humidity?: number | null;
  humidity_source?: string;
  rainfall?: number | null;
  rainfall_source?: string;
  solar_radiation_mj?: number | null;
  wind_speed_2m?: number | null;
  weather_age_seconds?: number;
  timestamp?: string;
  recent_moisture_history?: number[];
  weather_forecast?: any;
  latitude_deg?: number;
  root_depth_m?: number;
}

export async function callEngineEvaluate(payload: EngineEvaluatePayload) {
  try {
    const res = await axios.post(`${ENGINE_BASE_URL}/evaluate`, payload, { timeout: 5000 });
    return res.data;
  } catch (err: any) {
    console.error('[EngineClient] Evaluate call failed:', err.message);
    throw new Error(`Decision Engine unreachable or failed: ${err.message}`);
  }
}

export async function callEngineDisagreement(zones: any[]) {
  try {
    const res = await axios.post(`${ENGINE_BASE_URL}/disagreement`, { zones }, { timeout: 5000 });
    return res.data;
  } catch (err: any) {
    console.error('[EngineClient] Disagreement call failed:', err.message);
    throw new Error(`Decision Engine disagreement failed: ${err.message}`);
  }
}

export async function callEngineWhatIf(baseline: EngineEvaluatePayload, modifications: any) {
  try {
    const res = await axios.post(`${ENGINE_BASE_URL}/whatif`, { baseline, modifications }, { timeout: 5000 });
    return res.data;
  } catch (err: any) {
    console.error('[EngineClient] WhatIf call failed:', err.message);
    throw new Error(`Decision Engine what-if failed: ${err.message}`);
  }
}

