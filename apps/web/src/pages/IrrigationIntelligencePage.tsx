import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Droplet,
  ShieldCheck,
  CloudSun,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Activity,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Clock,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { SourceBadge } from '../components/SourceBadge';

export const IrrigationIntelligencePage: React.FC = () => {
  const { activeFarm, activeZone, zones, setActiveZone } = useFarm();

  // Input form state
  const [soilMoisture, setSoilMoisture] = useState<string>('24.5');
  const [moistureSource, setMoistureSource] = useState<string>('measured');
  const [temperature, setTemperature] = useState<string>('31.2');
  const [humidity, setHumidity] = useState<string>('44.0');
  const [rainfall, setRainfall] = useState<string>('0.0');
  const [inputTab, setInputTab] = useState<'manual' | 'csv'>('manual');

  // CSV Import State
  const [csvText, setCsvText] = useState<string>('');
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  // Weather state from Open-Meteo
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Decision Evaluation State
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  // Language toggle for explanation summary
  const [langView, setLangView] = useState<'en' | 'hi'>('en');

  // Auto-fetch weather when active farm changes
  useEffect(() => {
    if (activeFarm) {
      fetchWeather();
    }
  }, [activeFarm]);

  const fetchWeather = async () => {
    if (!activeFarm) return;
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const lat = activeFarm.location?.latitude || 28.6139;
      const lon = activeFarm.location?.longitude || 77.2090;
      const res = await axios.get(`/api/weather/forecast?lat=${lat}&lon=${lon}`);
      setWeatherData(res.data);
      // Auto-populate inputs if blank or requested
      if (res.data) {
        if (!temperature || temperature === '') setTemperature(res.data.temperature.toFixed(1));
        if (!humidity || humidity === '') setHumidity(res.data.humidity.toFixed(0));
        if (!rainfall || rainfall === '') setRainfall(res.data.precipitation.toFixed(1));
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setWeatherError('Failed to fetch live Open-Meteo telemetry. Fallback agronomic values active.');
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleApplyWeatherToInputs = () => {
    if (weatherData) {
      setTemperature(weatherData.temperature.toFixed(1));
      setHumidity(weatherData.humidity.toFixed(0));
      setRainfall(weatherData.precipitation.toFixed(1));
    }
  };

  const handleRunDecision = async () => {
    if (!activeZone) {
      setEvalError('Please select or configure an active zone first.');
      return;
    }
    setEvaluating(true);
    setEvalError(null);

    try {
      const smVal = soilMoisture.trim() === '' ? null : parseFloat(soilMoisture) / 100.0;
      const tempVal = temperature.trim() === '' ? null : parseFloat(temperature);
      const rhVal = humidity.trim() === '' ? null : parseFloat(humidity);
      const rainVal = rainfall.trim() === '' ? null : parseFloat(rainfall);

      const payload = {
        zoneId: activeZone._id,
        soilMoisture: smVal,
        soilMoistureSource: smVal !== null ? moistureSource : 'missing',
        temperature: tempVal,
        temperatureSource: tempVal !== null ? 'measured' : 'missing',
        humidity: rhVal,
        humiditySource: rhVal !== null ? 'measured' : 'missing',
        rainfall: rainVal,
        rainfallSource: rainVal !== null ? 'measured' : 'missing',
        weatherAgeSeconds: weatherData?.age_seconds || 0,
        weatherForecast: weatherData
      };

      const res = await axios.post('/api/decisions/evaluate', payload);
      setEvaluationResult(res.data);
    } catch (err: any) {
      console.error('Decision evaluation error:', err);
      setEvalError(err.response?.data?.error || 'Decision evaluation engine failed.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleCsvImport = async () => {
    if (!activeZone || !activeFarm) return;
    setCsvStatus(null);

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        setCsvStatus('CSV must contain a header and at least 1 row.');
        return;
      }

      // Expected headers: soil_moisture,temperature,humidity,rainfall,timestamp
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 4) {
          rows.push({
            soil_moisture: parts[0],
            temperature: parts[1],
            humidity: parts[2],
            rainfall: parts[3],
            timestamp: parts[4] || new Date().toISOString(),
            source: 'manual'
          });
        }
      }

      const res = await axios.post('/api/readings/csv-import', {
        zoneId: activeZone._id,
        farmId: activeFarm._id,
        rows
      });

      setCsvStatus(`Successfully ingested ${res.data.count} telemetry records!`);
      // Update form to last row
      if (rows.length > 0) {
        const last = rows[rows.length - 1];
        setSoilMoisture(last.soil_moisture);
        setTemperature(last.temperature);
        setHumidity(last.humidity);
        setRainfall(last.rainfall);
      }
    } catch (err: any) {
      setCsvStatus(`Import error: ${err.response?.data?.error || err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Irrigation Intelligence Decision Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluates data reliability, computes FAO-56 water balance, and estimates conformal uncertainty intervals.
          </p>
        </div>

        {/* Zone Selector Pill */}
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm">
          <Layers className="w-4 h-4 text-forest-700" />
          <span className="text-xs text-slate-500">Zone:</span>
          <select
            value={activeZone?._id || ''}
            onChange={(e) => {
              const sel = zones.find(z => z._id === e.target.value);
              if (sel) setActiveZone(sel);
            }}
            className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
          >
            {zones.map((z) => (
              <option key={z._id} value={z._id}>
                {z.name} ({z.cropName}, {z.growthStage})
              </option>
            ))}
          </select>
        </div>
      </div>

      {evalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{evalError}</span>
        </div>
      )}

      {/* Top Split: Live Weather + Telemetry Input Gating */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Open-Meteo Weather Tile */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CloudSun className="w-5 h-5 text-sky-600" />
                <span className="font-bold text-sm text-slate-900">Open-Meteo Weather</span>
              </div>
              <button
                onClick={fetchWeather}
                disabled={weatherLoading}
                className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
                title="Refresh Live Weather"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin text-forest-600' : ''}`} />
              </button>
            </div>

            {weatherData ? (
              <div className="mt-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Telemetry Status:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${weatherData.is_stale ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {weatherData.is_stale ? 'STALE (> 3h old)' : 'FRESH SYNC'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Current Ambient Temp:</span>
                  <span className="font-bold text-slate-900">{weatherData.temperature}°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Relative Humidity:</span>
                  <span className="font-bold text-slate-900">{weatherData.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Forecast Rain (24h):</span>
                  <span className="font-bold text-slate-900">{weatherData.daily_precip_forecast_mm} mm</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Reference ET0 (FAO):</span>
                  <span className="font-bold text-forest-800">{weatherData.daily_et0_openmeteo_mm} mm/day</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Wind Velocity (2m):</span>
                  <span className="font-bold text-slate-900">{weatherData.wind_speed.toFixed(1)} m/s</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                {weatherLoading ? 'Syncing microclimate telemetry...' : 'Weather data not loaded.'}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={handleApplyWeatherToInputs}
              disabled={!weatherData}
              className="w-full py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold rounded-lg text-xs transition border border-sky-200"
            >
              Sync Weather to Decision Inputs
            </button>
            <span className="block text-[10px] text-slate-400 text-center mt-1.5">
              Open-Meteo CC-BY 4.0 License • Attribution Verified
            </span>
          </div>
        </div>

        {/* Input & Telemetry Ingestion Panel */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            {/* Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setInputTab('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    inputTab === 'manual'
                      ? 'bg-forest-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Manual / Sensor Telemetry
                </button>
                <button
                  onClick={() => setInputTab('csv')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    inputTab === 'csv'
                      ? 'bg-forest-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  CSV Batch Import
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Rule #2: Provenance Tagging Mandatory
              </span>
            </div>

            {inputTab === 'manual' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>Soil Moisture (% Volumetric θ)</span>
                      <span className="text-[10px] text-forest-700 font-semibold">Active Root Zone</span>
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="60"
                        value={soilMoisture}
                        onChange={(e) => setSoilMoisture(e.target.value)}
                        placeholder="e.g. 24.5"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                      />
                      <select
                        value={moistureSource}
                        onChange={(e) => setMoistureSource(e.target.value)}
                        className="text-[11px] px-2 bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 focus:outline-none"
                      >
                        <option value="measured">Measured (FDR)</option>
                        <option value="manual">Manual Feel</option>
                        <option value="estimated">Estimated</option>
                        <option value="demo">Demo Data</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ambient Temperature (°C)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="e.g. 31.0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Relative Humidity (%)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={humidity}
                      onChange={(e) => setHumidity(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Precipitation / Forecast Rain (mm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={rainfall}
                      onChange={(e) => setRainfall(e.target.value)}
                      placeholder="e.g. 0.0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-forest-700 flex-shrink-0" />
                    <span>
                      Soil Profile: <strong className="capitalize">{activeZone?.soilType?.replace('_', ' ') || 'Loam'}</strong> (FC: 27%, PWP: 12%, Sat: 47%)
                    </span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    Kc: 1.15 (Mid)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  Paste comma-separated readings formatted as: <code className="bg-slate-100 px-1 rounded font-mono">soil_moisture,temperature,humidity,rainfall,timestamp</code>
                </p>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder={`soil_moisture,temperature,humidity,rainfall,timestamp\n0.28,30.2,46,0.0,2026-10-31T08:00:00Z\n0.27,31.5,42,0.0,2026-10-31T12:00:00Z\n0.25,29.8,49,2.5,2026-10-31T16:00:00Z`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleCsvImport}
                    className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-lg text-xs transition flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Ingest Batch Telemetry</span>
                  </button>
                  {csvStatus && (
                    <span className="text-xs font-semibold text-forest-800">{csvStatus}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              Evaluated via deterministic FAO-56 Engine (Python FastAPI)
            </div>
            <button
              onClick={handleRunDecision}
              disabled={evaluating}
              className="px-6 py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center space-x-2 disabled:opacity-60"
            >
              {evaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Computing Water Balance & Conformal Bounds...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-forest-300" />
                  <span>Run Decision Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Decision Results Output Section */}
      {evaluationResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Decision Output Banner */}
          <ConfidenceBadge
            decision={evaluationResult.decision}
            confidenceBand={evaluationResult.confidence_band}
            reliabilityScore={evaluationResult.reliability.reliability_score}
            size="lg"
          />

          {/* 3-Column Diagnostic Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Pre-Decision Reliability Card (Module B) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-forest-700" />
                    <h3 className="font-bold text-sm text-slate-900">Data Reliability Score</h3>
                  </div>
                  <span className="text-xs font-bold text-forest-700">
                    {(evaluationResult.reliability.reliability_score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-medium text-slate-500">Evaluation Formula:</div>
                  <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 block mt-1">
                    {evaluationResult.reliability.formula}
                  </code>
                </div>

                <div className="mt-4">
                  <span className="text-xs font-bold text-slate-700 block mb-2">
                    Penalty Breakdown ({evaluationResult.reliability.penalties.length} applied):
                  </span>
                  {evaluationResult.reliability.penalties.length === 0 ? (
                    <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-800 text-xs flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero anomalies. Telemetry fully plausible.</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                      {evaluationResult.reliability.penalties.map((p: any, i: number) => (
                        <div key={i} className="p-2 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-900 flex justify-between">
                          <span>{p.description}</span>
                          <span className="font-bold text-rose-700">-{(p.penalty * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Minimum safe threshold to recommend: <strong className="text-slate-800">65%</strong>
              </div>
            </div>

            {/* 2. Hydrologic Water Balance (Module G) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Droplet className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">FAO-56 Water Balance</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    ETc: {evaluationResult.water_balance.etc_mm} mm/d
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Root-Zone Depletion (Dr):</span>
                    <span className="font-bold text-slate-900">{evaluationResult.water_balance.dr_mm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Readily Available Water (RAW):</span>
                    <span className="font-bold text-slate-900">{evaluationResult.water_balance.raw_mm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Available Water (TAW):</span>
                    <span className="font-bold text-slate-900">{evaluationResult.water_balance.taw_mm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Effective Rainfall Offset:</span>
                    <span className="font-bold text-sky-700">-{evaluationResult.water_balance.p_eff_mm} mm</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Net Irrigation Requirement:</span>
                    <span className="font-extrabold text-blue-700 text-sm">
                      {evaluationResult.water_balance.net_irrigation_req_mm} mm
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Crop Stress Ratio:</span>
                <span className={`font-bold ${evaluationResult.water_balance.stress_ratio > 1.0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {evaluationResult.water_balance.stress_ratio}x RAW
                </span>
              </div>
            </div>

            {/* 3. Uncertainty & Monte-Carlo Bounds (Module A) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-sm text-slate-900">Uncertainty & Coverage</h3>
                  </div>
                  <span className="text-xs font-bold text-purple-700">
                    P(Irrigate): {(evaluationResult.uncertainty.p_irrigate * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">90% Prediction Interval:</span>
                    <span className="font-mono font-bold text-slate-900">
                      [{evaluationResult.uncertainty.dr_interval_90.lower} – {evaluationResult.uncertainty.dr_interval_90.upper}] mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Interval Spread Width:</span>
                    <span className="font-bold text-slate-900">
                      {evaluationResult.uncertainty.dr_interval_90.width_mm} mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Straddles Threshold?</span>
                    <span className={`font-bold ${evaluationResult.uncertainty.straddles_raw_threshold ? 'text-amber-700' : 'text-slate-800'}`}>
                      {evaluationResult.uncertainty.straddles_raw_threshold ? 'Yes (Boundary Risk)' : 'No (Clear Separation)'}
                    </span>
                  </div>
                </div>

                {evaluationResult.abstention_reason && (
                  <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs">
                    <span className="font-bold block">Abstention Triggered:</span>
                    {evaluationResult.abstention_reason}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                1,000 Monte Carlo draws • Distribution-free conformal bounds
              </div>
            </div>
          </div>

          {/* Farmer-Centric Explainability Panel (Module E) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-forest-700" />
                  <span>Explainability & Counterfactual Recourse</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Translates complex hydrologic equations into plain language and actionable physical thresholds
                </p>
              </div>

              {/* Language toggle for summary */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setLangView('en')}
                  className={`px-2.5 py-1 text-xs font-bold rounded ${
                    langView === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLangView('hi')}
                  className={`px-2.5 py-1 text-xs font-bold rounded ${
                    langView === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>

            {/* Plain language summary box */}
            <div className="p-4 bg-forest-50/70 border border-forest-200 rounded-xl mb-6 text-sm text-forest-950 font-medium leading-relaxed">
              {langView === 'hi'
                ? evaluationResult.explanation.summary.hi
                : evaluationResult.explanation.summary.en}
            </div>

            {/* Counterfactual Tipping Points */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                What Would Change This Recommendation? (Counterfactual Tipping Points)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {evaluationResult.explanation.counterfactuals.map((cf: any, i: number) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="font-bold text-slate-900">
                      {langView === 'hi' && cf.trigger_hi ? cf.trigger_hi : cf.trigger}
                    </div>
                    <div className="mt-2 text-slate-500 flex items-center justify-between text-[11px]">
                      <span>Current: <strong>{cf.current_value}</strong></span>
                      <span className="font-bold text-forest-700">→ Flips to {cf.flips_decision_to}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Drivers Ranked */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Key Hydrologic Driver Decomposition
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {evaluationResult.explanation.drivers.map((drv: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="text-slate-500 text-[11px]">
                      {langView === 'hi' && drv.name_hi ? drv.name_hi : drv.name}
                    </div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {drv.value_mm} {drv.unit}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      {langView === 'hi' && drv.impact_hi ? drv.impact_hi : drv.impact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

