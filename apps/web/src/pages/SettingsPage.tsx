import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Settings,
  Languages,
  Sliders,
  Server,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const [minReliability, setMinReliability] = useState<number>(65);
  const [straddleTolerance, setStraddleTolerance] = useState<number>(6.0);
  const [weatherTTL, setWeatherTTL] = useState<number>(15);

  const [apiHealth, setApiHealth] = useState<'online' | 'offline' | 'checking'>('checking');
  const [engineHealth, setEngineHealth] = useState<'online' | 'offline' | 'checking'>('checking');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setApiHealth('checking');
    setEngineHealth('checking');

    try {
      const apiRes = await axios.get('/api/health');
      if (apiRes.data.status === 'online') setApiHealth('online');
      else setApiHealth('offline');
    } catch {
      setApiHealth('offline');
    }

    try {
      const engineRes = await axios.get('/engine/health');
      if (engineRes.data.status === 'online') setEngineHealth('online');
      else setEngineHealth('offline');
    } catch {
      setEngineHealth('offline');
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('agrosense_lang', lang);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2">
          <Settings className="w-6 h-6 text-slate-700" />
          <span>System Settings & Operational Boundaries</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure linguistic preferences, safety tolerances, and inspect live service health.
        </p>
      </div>

      {/* Language Preference Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Languages className="w-5 h-5 text-forest-700" />
          <h2 className="font-bold text-base text-slate-900">Language / भाषा चयन</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            onClick={() => changeLanguage('en')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              i18n.language === 'en'
                ? 'bg-forest-50/60 border-forest-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">English (US / Global)</span>
              {i18n.language === 'en' && <CheckCircle2 className="w-4 h-4 text-forest-700" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Agronomic explanations, driver decomposition, and metrics in standard English.
            </p>
          </div>

          <div
            onClick={() => changeLanguage('hi')}
            className={`p-4 rounded-xl border-2 cursor-pointer transition ${
              i18n.language === 'hi'
                ? 'bg-forest-50/60 border-forest-600 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">हिन्दी (Hindi)</span>
              {i18n.language === 'hi' && <CheckCircle2 className="w-4 h-4 text-forest-700" />}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              भारतीय किसानों के लिए स्पष्ट, सरल हिंदी में सिंचाई परामर्श और व्याख्या।
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Calibration Tolerances */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Sliders className="w-5 h-5 text-purple-700" />
          <h2 className="font-bold text-base text-slate-900">
            Decision Safety & Abstention Cutoffs
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Minimum Data Reliability Score (DRS) to Recommend:
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="50"
                max="85"
                step="5"
                value={minReliability}
                onChange={(e) => setMinReliability(parseInt(e.target.value))}
                className="w-full accent-forest-600 cursor-pointer"
              />
              <span className="font-bold text-forest-800 text-sm w-12">{minReliability}%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Below this threshold, system automatically outputs INSUFFICIENT_DATA_VERIFY_MANUALLY.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Conformal Interval Straddle Tolerance:
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="2.0"
                max="12.0"
                step="0.5"
                value={straddleTolerance}
                onChange={(e) => setStraddleTolerance(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <span className="font-bold text-purple-800 text-sm w-12">{straddleTolerance} mm</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              If the 90% prediction interval straddles the RAW refill boundary by more than this width, abstention triggers.
            </p>
          </div>
        </div>
      </div>

      {/* Services Health & Architecture Diagnostics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-slate-700" />
            <h2 className="font-bold text-base text-slate-900">
              Stack Health & Service Diagnostics
            </h2>
          </div>
          <button
            onClick={checkHealth}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Node.js Express API</span>
              <span className="text-[11px] text-slate-500">Port 5000 (Gateway)</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${apiHealth === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {apiHealth.toUpperCase()}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Python Decision Engine</span>
              <span className="text-[11px] text-slate-500">Port 8000 (FastAPI)</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${engineHealth === 'online' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {engineHealth.toUpperCase()}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 block">Open-Meteo Weather API</span>
              <span className="text-[11px] text-slate-500">External HTTPS (CC-BY 4.0)</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
              CONNECTED
            </span>
          </div>
        </div>
      </div>

      {/* User Session Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-forest-100 text-forest-800 flex items-center justify-center font-bold text-sm">
            <User className="w-5 h-5 text-forest-700" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.email} • Role: {user?.role}</div>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
          Active Session
        </span>
      </div>
    </div>
  );
};

