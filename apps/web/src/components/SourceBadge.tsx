import React from 'react';
import { Activity, Edit3, Cloud, HelpCircle, Cpu, Database } from 'lucide-react';

export type DataSourceType = 'measured' | 'manual' | 'api' | 'estimated' | 'simulated' | 'demo' | string;

interface SourceBadgeProps {
  source: DataSourceType;
  ageSeconds?: number;
  className?: string;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({ source, ageSeconds, className = '' }) => {
  const s = source?.toLowerCase() || 'manual';

  const formatAge = (sec?: number) => {
    if (!sec || sec < 60) return '';
    if (sec < 3600) return ` (${Math.round(sec / 60)}m ago)`;
    return ` (${(sec / 3600).toFixed(1)}h ago)`;
  };

  switch (s) {
    case 'measured':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 ${className}`}>
          <Activity className="w-3 h-3 text-emerald-700" />
          <span>MEASURED{formatAge(ageSeconds)}</span>
        </span>
      );
    case 'api':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-300 ${className}`}>
          <Cloud className="w-3 h-3 text-sky-700" />
          <span>OPEN-METEO API{formatAge(ageSeconds)}</span>
        </span>
      );
    case 'estimated':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-400 dashed ${className}`}>
          <HelpCircle className="w-3 h-3 text-amber-700" />
          <span>ESTIMATED (FALLBACK)</span>
        </span>
      );
    case 'simulated':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-900 border-2 border-purple-400 shadow-sm ${className}`}>
          <Cpu className="w-3 h-3 text-purple-700" />
          <span>SIMULATED SCENARIO</span>
        </span>
      );
    case 'demo':
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-200 text-amber-950 border border-amber-400 ${className}`}>
          <Database className="w-3 h-3 text-amber-800" />
          <span>DEMO DATA</span>
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <Edit3 className="w-3 h-3 text-slate-500" />
          <span>MANUAL ENTRY</span>
        </span>
      );
  }
};

