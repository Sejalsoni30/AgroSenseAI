import React, { useState } from 'react';
import axios from 'axios';
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Sprout,
  Activity,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { useFarm, Zone } from '../context/FarmContext';

export const FarmManagementPage: React.FC = () => {
  const { farms, activeFarm, setActiveFarm, zones, refreshFarms, refreshZones } = useFarm();
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Farm Form State
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [areaHa, setAreaHa] = useState('10.0');

  // New Zone Form State
  const [zoneName, setZoneName] = useState('');
  const [soilType, setSoilType] = useState<'sandy' | 'sandy_loam' | 'loam' | 'clay_loam' | 'silty_clay' | 'clay'>('loam');
  const [cropName, setCropName] = useState('wheat');
  const [growthStage, setGrowthStage] = useState<'initial' | 'development' | 'mid' | 'late'>('development');
  const [zoneArea, setZoneArea] = useState('3.0');
  const [rootDepth, setRootDepth] = useState('1.0');
  const [irrigationType, setIrrigationType] = useState<'drip' | 'sprinkler' | 'flood' | 'furrow'>('drip');
  const [sensorId, setSensorId] = useState('');

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post('/api/farms', {
        name: farmName,
        location: {
          address: farmAddress || 'Agricultural Plot',
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          altitudeM: 200
        },
        totalAreaHa: parseFloat(areaHa)
      });
      setShowAddFarm(false);
      setFarmName('');
      await refreshFarms();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create farm');
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFarm) return;
    setError(null);

    try {
      await axios.post('/api/farms/zones', {
        farmId: activeFarm._id,
        name: zoneName,
        soilType,
        cropName,
        growthStage,
        areaHa: parseFloat(zoneArea),
        rootDepthM: parseFloat(rootDepth),
        irrigationType,
        sensorId: sensorId || undefined
      });
      setShowAddZone(false);
      setZoneName('');
      setSensorId('');
      await refreshZones(activeFarm._id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create zone');
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to remove this zone and its telemetry history?')) return;
    try {
      await axios.delete(`/api/farms/zones/${zoneId}`);
      if (activeFarm) await refreshZones(activeFarm._id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete zone');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Farms & Irrigation Management Zones
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure soil hydraulic properties, crop coefficients (Kc), and root zone depths per FAO-56 standards.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddFarm(true)}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold rounded-lg transition shadow-sm flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Add Farm</span>
          </button>
          {activeFarm && (
            <button
              onClick={() => setShowAddZone(true)}
              className="px-3.5 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs sm:text-sm font-bold rounded-lg transition shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Zone to {activeFarm.name}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Farms List / Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {farms.map((f) => {
          const isSelected = activeFarm?._id === f._id;
          return (
            <div
              key={f._id}
              onClick={() => setActiveFarm(f)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                isSelected
                  ? 'bg-forest-50/50 border-forest-600 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">{f.name}</span>
                    {f.isDemo && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1 rounded">
                        DEMO
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{f.location?.address || 'Site Location'}</span>
                  </div>
                </div>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-forest-600 text-white flex items-center justify-center text-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Total Area: {f.totalAreaHa} ha</span>
                <span>Lat: {f.location?.latitude?.toFixed(2)}°</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zones Section for Selected Farm */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-forest-700" />
              <span>Field Zones in {activeFarm?.name || 'Selected Farm'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Each zone maintains independent soil physical parameters and crop stage water balances
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
            {zones.length} Zones Configured
          </span>
        </div>

        {zones.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Sprout className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No field zones found for this farm.</p>
            <p className="mt-1">Click "Add Zone" above to define soil texture and crop parameters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {zones.map((z) => (
              <div
                key={z._id}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{z.name}</h3>
                      <span className="text-[11px] font-semibold text-forest-800 capitalize bg-forest-100 px-2 py-0.5 rounded mt-1 inline-block">
                        {z.cropName} • Stage: {z.growthStage}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteZone(z._id)}
                      title="Delete Zone"
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Soil Texture:</span>
                      <span className="font-semibold capitalize text-slate-800">{z.soilType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Root Depth (Zr):</span>
                      <span className="font-semibold text-slate-800">{z.rootDepthM} m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Management Area:</span>
                      <span className="font-semibold text-slate-800">{z.areaHa} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Irrigation System:</span>
                      <span className="font-semibold capitalize text-slate-800">{z.irrigationType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hardware Sensor ID:</span>
                      <span className="font-mono font-medium text-slate-700">{z.sensorId || 'None (Manual)'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">FAO-56 Integrated</span>
                  <span className="font-bold text-forest-700 hover:underline cursor-pointer">
                    View Readings →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Farm Modal */}
      {showAddFarm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-900">Add New Agricultural Farm</h3>
              <button onClick={() => setShowAddFarm(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateFarm} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Sunrise Valley Orchard"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Address</label>
                <input
                  type="text"
                  value={farmAddress}
                  onChange={(e) => setFarmAddress(e.target.value)}
                  placeholder="e.g. Ludhiana Field 4"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Area (Hectares)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={areaHa}
                  onChange={(e) => setAreaHa(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFarm(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-lg text-xs transition shadow-sm"
                >
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {showAddZone && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-base text-slate-900">
                Add Field Zone to {activeFarm?.name}
              </h3>
              <button onClick={() => setShowAddZone(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateZone} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zone Identifier / Name</label>
                <input
                  type="text"
                  required
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  placeholder="e.g. Block C - North Drip Sector"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type (Hydrology)</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600 capitalize"
                  >
                    <option value="sandy">Sandy Soil</option>
                    <option value="sandy_loam">Sandy Loam</option>
                    <option value="loam">Loam</option>
                    <option value="clay_loam">Clay Loam</option>
                    <option value="silty_clay">Silty Clay</option>
                    <option value="clay">Heavy Clay</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Crop (FAO-56 Kc)</label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600 capitalize"
                  >
                    <option value="wheat">Wheat</option>
                    <option value="tomato">Tomato</option>
                    <option value="cotton">Cotton</option>
                    <option value="corn">Corn (Maize)</option>
                    <option value="rice">Rice</option>
                    <option value="potato">Potato</option>
                    <option value="sugarcane">Sugarcane</option>
                    <option value="soybean">Soybean</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Growth Stage</label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600 capitalize"
                  >
                    <option value="initial">Initial (Emergence)</option>
                    <option value="development">Crop Development</option>
                    <option value="mid">Mid-Season (Peak Bloom/Grain)</option>
                    <option value="late">Late Season (Maturity)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation Method</label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600 capitalize"
                  >
                    <option value="drip">Drip Irrigation</option>
                    <option value="sprinkler">Center Pivot / Sprinkler</option>
                    <option value="flood">Surface Flood</option>
                    <option value="furrow">Furrow</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Root Depth Zr (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    max="3.0"
                    required
                    value={rootDepth}
                    onChange={(e) => setRootDepth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zone Area (ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={zoneArea}
                    onChange={(e) => setZoneArea(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Hardware Sensor ID (Optional)</label>
                <input
                  type="text"
                  value={sensorId}
                  onChange={(e) => setSensorId(e.target.value)}
                  placeholder="e.g. FDR-NODE-049"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-forest-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddZone(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-lg text-xs transition shadow-sm"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

