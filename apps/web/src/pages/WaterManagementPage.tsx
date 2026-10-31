import React from 'react';
import {
  Droplet,
  ShieldAlert,
  BarChart3,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Info,
  Calendar
} from 'lucide-react';
import { useFarm } from '../context/FarmContext';

export const WaterManagementPage: React.FC = () => {
  const { activeFarm, activeZone } = useFarm();

  // Reference hydrologic parameters for active zone
  const fc = activeZone?.soilType === 'clay_loam' ? 32 : activeZone?.soilType === 'sandy_loam' ? 18 : 27;
  const pwp = activeZone?.soilType === 'clay_loam' ? 17 : activeZone?.soilType === 'sandy_loam' ? 8 : 12;
  const sat = activeZone?.soilType === 'clay_loam' ? 49 : activeZone?.soilType === 'sandy_loam' ? 43 : 47;
  const tawMm = (fc - pwp) * 10.0 * (activeZone?.rootDepthM || 1.0);
  const rawMm = tawMm * 0.55;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Water Budget & Hydrologic Risk Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            FAO-56 mass-balance accounting, stress indicators, and leaching risk control for {activeZone?.name || 'Selected Zone'}
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-forest-700" />
          <span>Seasonal Cycle: Rabi 2026</span>
        </div>
      </div>

      {/* Seasonal Water Budget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Seasonal Water Allocation
          </span>
          <div className="mt-2 text-2xl font-black text-slate-900">
            450.0 <span className="text-sm font-semibold text-slate-500">mm / ha</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total permitted groundwater & canal quota
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Applied Water to Date
          </span>
          <div className="mt-2 text-2xl font-black text-blue-700">
            185.0 <span className="text-sm font-semibold text-slate-500">mm / ha</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Cumulative: <strong>41.1%</strong></span>
            <span className="text-emerald-700 font-bold">On Budget</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Remaining Reserve
          </span>
          <div className="mt-2 text-2xl font-black text-forest-800">
            265.0 <span className="text-sm font-semibold text-slate-500">mm / ha</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Sufficient for ~49 days at average ETc
          </div>
        </div>
      </div>

      {/* Hydrologic Dual Risk Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Underwatering Risk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-base text-slate-900">Underwatering / Crop Stress Risk</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                LOW RISK (12%)
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Calculated when root depletion Dr exceeds Readily Available Water (RAW). When Dr &gt; RAW, stomatal closure begins, reducing transpiration and photosynthesis.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
              Risk_under = max(0.0, (Dr - RAW) / (TAW - RAW)) * 100%
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Current Status: Safe vegetative zone</span>
            <span className="font-bold text-emerald-700">No yield penalty</span>
          </div>
        </div>

        {/* Overwatering / Leaching Risk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Droplet className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-base text-slate-900">Overwatering / Leaching Risk</h2>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                ZERO RISK (0%)
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed">
              Triggers when irrigation or heavy rainfall pushes root-zone moisture above Field Capacity ($\theta_{fc}$), driving deep percolation, fertilizer leaching, and root hypoxia.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
              Risk_over = max(0.0, (I_proposed - Dr) / TAW) * 100%
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Deep Percolation (DP): 0.0 mm</span>
            <span className="font-bold text-emerald-700">Optimal aeration</span>
          </div>
        </div>
      </div>

      {/* Soil Retention Physical Profile */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="font-bold text-base text-slate-900 mb-1">
          Soil Retention & Available Water Capacity Spectrum
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Grounded in FAO-56 Table 19 physical characteristics for {activeZone?.soilType?.replace('_', ' ') || 'Loam'}
        </p>

        <div className="space-y-4">
          {/* Visual Spectrum Bar */}
          <div className="relative h-10 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-300">
            {/* Wilting zone */}
            <div style={{ width: `${pwp}%` }} className="bg-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-900">
              PWP ({pwp}%)
            </div>
            {/* Readily available zone */}
            <div style={{ width: `${fc - pwp}%` }} className="bg-emerald-300 flex items-center justify-center text-[10px] font-bold text-emerald-950">
              Available Water Capacity (AWC = {fc - pwp}%)
            </div>
            {/* Saturation zone */}
            <div style={{ width: `${sat - fc}%` }} className="bg-sky-200 flex items-center justify-center text-[10px] font-bold text-sky-950">
              Gravitational Water ({sat - fc}%)
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Permanent Wilting Point (PWP):</span>
              <span className="font-bold text-slate-900 text-sm">{pwp}% θ</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Field Capacity (FC):</span>
              <span className="font-bold text-slate-900 text-sm">{fc}% θ</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Total Available Water (TAW):</span>
              <span className="font-bold text-slate-900 text-sm">{tawMm.toFixed(1)} mm</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block">Readily Available Water (RAW):</span>
              <span className="font-bold text-forest-700 text-sm">{rawMm.toFixed(1)} mm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
