import React, { useState } from 'react';
import axios from 'axios';
import {
  SlidersHorizontal,
  RefreshCw,
  Cpu,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { SourceBadge } from '../components/SourceBadge';

export const WhatIfSimulatorPage: React.FC = () => {
  const { activeZone, zones, setActiveZone } = useFarm();

  // Modification sliders state
  const [rainModifier, setRainModifier] = useState<number>(0);
  const [tempDelta, setTempDelta] = useState<number>(0);
  const [moistureOverride, setMoistureOverride] = useState<number>(24);
  const [stageOverride, setStageOverride] = useState<string>('development');
  const [sensorOffline, setSensorOffline] = useState<boolean>(false);

  // Simulation execution state
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!activeZone) return;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        zoneId: activeZone._id,
        currentInputs: {
          soilMoisture: 0.24,
          temperature: 29.0,
          humidity: 48.0,
          rainfall: 0.0
        },
        modifications: {
          rainfall: rainModifier,
          temperature_delta: tempDelta,
          soil_moisture: sensorOffline ? null : moistureOverride / 100.0,
          growth_stage: stageOverride,
          sensor_offline: sensorOffline
        }
      };

      const res = await axios.post('/api/whatif/simulate', payload);
      setSimulationResult(res.data);
    } catch (err: any) {
      console.error('Simulation error:', err);
      setError(err.response?.data?.error || 'Simulation sandbox execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
            <SlidersHorizontal className="w-6 h-6 text-purple-700" />
            <span>Interactive What-If Simulation Sandbox</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Module F: Test hypothetical climate scenarios and probe disconnections without affecting production history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-lg flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-purple-700" />
            <span>SANDBOX ISOLATED • NO DB WRITES</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Control Sliders + Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-slate-900">
              Scenario Parameter Sliders
            </h2>
            <p className="text-[11px] text-slate-500">
              Modify environmental variables to inspect recommendation sensitivity
            </p>
          </div>

          {/* Slider 1: Rain modifier */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Incoming Rainfall Tomorrow:</span>
              <span className="font-bold text-blue-700">{rainModifier} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={rainModifier}
              onChange={(e) => setRainModifier(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0 mm (Dry)</span>
              <span>20 mm (Moderate)</span>
              <span>40 mm (Storm)</span>
            </div>
          </div>

          {/* Slider 2: Temperature Delta */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Temperature Shift:</span>
              <span className={`font-bold ${tempDelta > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {tempDelta > 0 ? `+${tempDelta}` : tempDelta}°C
              </span>
            </div>
            <input
              type="range"
              min="-4"
              max="8"
              step="1"
              value={tempDelta}
              onChange={(e) => setTempDelta(parseFloat(e.target.value))}
              className="w-full accent-forest-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>-4°C (Cooling)</span>
              <span>0°C (Baseline)</span>
              <span>+8°C (Heatwave)</span>
            </div>
          </div>

          {/* Slider 3: Soil moisture override */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Soil Moisture (% θ):</span>
              <span className="font-bold text-forest-800">{moistureOverride}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="1"
              disabled={sensorOffline}
              value={moistureOverride}
              onChange={(e) => setMoistureOverride(parseFloat(e.target.value))}
              className="w-full accent-forest-600 cursor-pointer disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>10% (PWP)</span>
              <span>27% (FC)</span>
              <span>45% (Sat)</span>
            </div>
          </div>

          {/* Selector 4: Growth stage */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Simulate Growth Stage (Kc Impact)
            </label>
            <select
              value={stageOverride}
              onChange={(e) => setStageOverride(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-purple-600"
            >
              <option value="initial">Initial Emergence (Kc 0.35)</option>
              <option value="development">Crop Development (Kc 0.75)</option>
              <option value="mid">Mid-Season Peak Demand (Kc 1.15)</option>
              <option value="late">Late Season Maturity (Kc 0.45)</option>
            </select>
          </div>

          {/* Toggle 5: Sensor offline */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Simulate Sensor Offline</span>
              <span className="text-[10px] text-slate-500">Test platform abstention on dropped telemetry</span>
            </div>
            <input
              type="checkbox"
              checked={sensorOffline}
              onChange={(e) => setSensorOffline(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Evaluating Scenario...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>

        {/* Output Comparison Column */}
        <div className="lg:col-span-2 space-y-5">
          {simulationResult ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Delta Summary Banner */}
              <div className={`p-4 rounded-xl border-2 flex items-center justify-between ${
                simulationResult.delta.decision_flipped
                  ? 'bg-amber-50 border-amber-400 text-amber-950'
                  : 'bg-emerald-50 border-emerald-400 text-emerald-950'
              }`}>
                <div className="flex items-center space-x-3">
                  {simulationResult.delta.decision_flipped ? (
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">
                      Scenario Comparison Impact
                    </span>
                    <span className="font-bold text-sm">
                      {simulationResult.delta.message}
                    </span>
                  </div>
                </div>

                <SourceBadge source="simulated" />
              </div>

              {/* Side-by-Side Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Baseline Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-700">Baseline (Actual Today)</span>
                      <SourceBadge source="measured" />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="text-[11px] text-slate-500 block">Recommended Action:</span>
                        <div className="mt-1">
                          <ConfidenceBadge decision={simulationResult.baseline.decision} size="sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                        <div className="flex justify-between">
                          <span>Root Depletion (Dr):</span>
                          <span className="font-bold text-slate-900">{simulationResult.baseline.dr_mm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Refill Threshold (RAW):</span>
                          <span className="font-bold text-slate-900">{simulationResult.baseline.raw_mm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crop Water Demand (ETc):</span>
                          <span className="font-bold text-slate-900">{simulationResult.baseline.etc_mm} mm/d</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Reliability Score:</span>
                          <span className="font-bold text-forest-700">
                            {(simulationResult.baseline.reliability_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulated Scenario Card */}
                <div className="bg-purple-50/40 p-5 rounded-2xl border-2 border-purple-300 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                      <span className="font-bold text-sm text-purple-950">Hypothetical Scenario</span>
                      <SourceBadge source="simulated" />
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <span className="text-[11px] text-purple-700 block">Simulated Decision:</span>
                        <div className="mt-1">
                          <ConfidenceBadge decision={simulationResult.simulated.decision} size="sm" />
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-purple-200">
                        <div className="flex justify-between">
                          <span>Simulated Depletion (Dr):</span>
                          <span className="font-bold text-purple-900">{simulationResult.simulated.dr_mm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Refill Threshold (RAW):</span>
                          <span className="font-bold text-purple-900">{simulationResult.simulated.raw_mm} mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Simulated ETc Demand:</span>
                          <span className="font-bold text-purple-900">{simulationResult.simulated.etc_mm} mm/d</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Simulated Reliability:</span>
                          <span className="font-bold text-purple-900">
                            {(simulationResult.simulated.reliability_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-purple-200 text-[11px] text-purple-800 font-medium">
                    {simulationResult.simulated.summary?.en}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center flex flex-col items-center justify-center text-slate-400">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="font-bold text-base text-slate-700">Sandbox Ready</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Adjust parameters on the left (e.g. increase rainfall or simulate a sensor dropout) and execute simulation to inspect sensitivity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

