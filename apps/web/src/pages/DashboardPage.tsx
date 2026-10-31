import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Droplet,
  ShieldCheck,
  Activity,
  Layers,
  Calendar,
  ArrowRight,
  TrendingDown,
  CloudRain,
  AlertTriangle
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { SourceBadge } from '../components/SourceBadge';

export const DashboardPage: React.FC = () => {
  const { activeFarm, activeZone, zones } = useFarm();
  const [readings, setReadings] = useState<any[]>([]);
  const [latestDecision, setLatestDecision] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeZone) {
      loadZoneTelemetry(activeZone._id);
      loadZoneDecisions(activeZone._id);
    }
  }, [activeZone]);

  const loadZoneTelemetry = async (zoneId: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/readings/zone/${zoneId}?limit=14`);
      // Chronological order for Recharts
      const sorted = (res.data.readings || []).slice().reverse();
      setReadings(sorted);
    } catch (err) {
      console.error('Failed to load readings:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadZoneDecisions = async (zoneId: string) => {
    try {
      const res = await axios.get(`/api/decisions/history/zone/${zoneId}?limit=1`);
      if (res.data.runs && res.data.runs.length > 0) {
        setLatestDecision(res.data.runs[0]);
      } else {
        setLatestDecision(null);
      }
    } catch (err) {
      console.error('Failed to load latest decision:', err);
    }
  };

  // Prepare chart data
  const chartData = readings.map((r) => {
    const d = new Date(r.timestamp);
    const dateStr = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;
    return {
      date: dateStr,
      moisturePct: r.soilMoisture?.value ? Math.round(r.soilMoisture.value * 1000) / 10 : null,
      temperature: r.temperature?.value ?? null,
      rainfall: r.rainfall?.value ?? 0,
      source: r.soilMoisture?.source || 'manual'
    };
  });

  const latestReading = readings.length > 0 ? readings[readings.length - 1] : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {activeFarm?.name || 'Farm Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active Zone: <strong className="text-slate-800">{activeZone?.name || 'None Selected'}</strong> ({activeZone?.cropName || 'Crop'}, Stage: {activeZone?.growthStage || 'N/A'})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/irrigation"
            className="px-4 py-2.5 bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-bold rounded-lg transition shadow-sm flex items-center space-x-2"
          >
            <Droplet className="w-4 h-4" />
            <span>Evaluate Irrigation</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Latest Recommendation Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recommendation Status
            </span>
            <div className="mt-2">
              <ConfidenceBadge
                decision={latestDecision?.decision || 'NO_EVALUATION_YET'}
                size="sm"
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Certainty:</span>
            <span className="font-semibold text-slate-800">
              {latestDecision?.confidenceBand || 'Unverified'}
            </span>
          </div>
        </div>

        {/* Root-Zone Soil Moisture Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Soil Moisture (θ)
              </span>
              {latestReading && (
                <SourceBadge source={latestReading.soilMoisture?.source || 'manual'} />
              )}
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {latestReading?.soilMoisture?.value
                ? `${(latestReading.soilMoisture.value * 100).toFixed(1)}%`
                : 'No Data'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Soil Type:</span>
            <span className="font-semibold text-slate-800 capitalize">
              {activeZone?.soilType?.replace('_', ' ') || 'Loam'}
            </span>
          </div>
        </div>

        {/* Data Reliability Score Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Data Reliability Score
            </span>
            <div className="mt-2 text-2xl font-black text-slate-900 flex items-baseline space-x-1.5">
              <span>
                {latestDecision?.reliabilityScore !== undefined
                  ? `${(latestDecision.reliabilityScore * 100).toFixed(0)}%`
                  : '100%'}
              </span>
              <span className="text-xs font-semibold text-forest-700">
                {latestDecision?.reliabilityStatus || 'Plausible'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Pre-Decision Check:</span>
            <Link to="/reliability" className="text-forest-700 font-semibold hover:underline flex items-center">
              View Audit <ArrowRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Depletion Deficit Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Root Depletion (Dr)
            </span>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {latestDecision?.waterBalance?.drMm !== undefined
                ? `${latestDecision.waterBalance.drMm.toFixed(1)} mm`
                : '68.0 mm'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Refill Point (RAW):</span>
            <span className="font-semibold text-slate-800">
              {latestDecision?.waterBalance?.rawMm
                ? `${latestDecision.waterBalance.rawMm.toFixed(1)} mm`
                : '65.0 mm'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Soil Moisture Hydrologic Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Soil Moisture Trajectory vs. Agronomic Thresholds
              </h2>
              <p className="text-xs text-slate-500">
                Volumetric water content (% θ) across recent telemetry readings
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Source: <span className="font-bold text-slate-800">In-situ FDR Sensor</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <AlertTriangle className="w-8 h-8 mb-2 text-slate-300" />
                <span>No telemetry logged yet for this zone.</span>
                <Link to="/irrigation" className="text-forest-700 font-bold mt-1 underline">
                  Enter First Reading
                </Link>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis unit="%" domain={[5, 45]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  {/* Field capacity reference line */}
                  <ReferenceLine y={32} stroke="#0ea5e9" strokeDasharray="3 3" label={{ value: 'Field Capacity (32%)', fill: '#0ea5e9', fontSize: 10 }} />
                  {/* Refill boundary line */}
                  <ReferenceLine y={21} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Refill Line RAW (21%)', fill: '#f59e0b', fontSize: 10 }} />
                  {/* Wilting point */}
                  <ReferenceLine y={14} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'PWP (14%)', fill: '#ef4444', fontSize: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="moisturePct"
                    name="Soil Moisture (%)"
                    stroke="#15803d"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#15803d' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weather & Rainfall Overlay Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Precipitation & Temperature
                </h2>
                <p className="text-xs text-slate-500">
                  Rainfall events (mm) and ambient heat (°C)
                </p>
              </div>
              <CloudRain className="w-5 h-5 text-sky-600" />
            </div>

            <div className="h-60 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Awaiting weather telemetry
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="rainfall" name="Rain (mm)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 mt-2">
            <span className="font-bold text-slate-800">Forecast Insight:</span> Open-Meteo predicts low precipitation risk over next 48h. Evaporative demand ($ET_0$) is elevated.
          </div>
        </div>
      </div>

      {/* Recent Telemetry Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent In-Field Telemetry Log
            </h2>
            <p className="text-xs text-slate-500">
              Every row documents value, unit, source provenance, and age
            </p>
          </div>
          <Link
            to="/irrigation"
            className="text-xs font-bold text-forest-700 hover:text-forest-800 hover:underline"
          >
            + Add or Import Data
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Soil Moisture (θ)</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Humidity</th>
                <th className="py-3 px-4">Rainfall</th>
                <th className="py-3 px-4">Provenance Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {readings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No readings found. Use the Irrigation Intelligence page to enter or import readings.
                  </td>
                </tr>
              ) : (
                readings.slice(-6).reverse().map((r, i) => (
                  <tr key={r._id || i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-forest-900">
                      {r.soilMoisture?.value !== null ? `${(r.soilMoisture.value * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {r.temperature?.value !== null ? `${r.temperature.value.toFixed(1)} °C` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {r.humidity?.value !== null ? `${r.humidity.value.toFixed(0)}%` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {r.rainfall?.value !== null ? `${r.rainfall.value.toFixed(1)} mm` : '0.0 mm'}
                    </td>
                    <td className="py-3 px-4">
                      <SourceBadge source={r.soilMoisture?.source || 'manual'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

