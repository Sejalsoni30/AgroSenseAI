import React from 'react';
import { Droplet, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type DecisionType = 'IRRIGATE' | 'NO_IRRIGATION_NEEDED' | 'INSUFFICIENT_DATA_VERIFY_MANUALLY' | string;

interface ConfidenceBadgeProps {
  decision: DecisionType;
  confidenceBand?: string;
  reliabilityScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  decision,
  confidenceBand,
  reliabilityScore,
  size = 'md'
}) => {
  const { t } = useTranslation();

  const getStyleAndIcon = () => {
    switch (decision) {
      case 'IRRIGATE':
        return {
          bg: 'bg-blue-50 border-blue-400 text-blue-900',
          badgeBg: 'bg-blue-600 text-white',
          icon: <Droplet className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />,
          label: t('decision.IRRIGATE', 'IRRIGATE')
        };
      case 'NO_IRRIGATION_NEEDED':
        return {
          bg: 'bg-emerald-50 border-emerald-400 text-emerald-900',
          badgeBg: 'bg-emerald-700 text-white',
          icon: <CheckCircle2 className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />,
          label: t('decision.NO_IRRIGATION_NEEDED', 'NO IRRIGATION NEEDED')
        };
      case 'INSUFFICIENT_DATA_VERIFY_MANUALLY':
        return {
          bg: 'bg-amber-50 border-amber-400 text-amber-950',
          badgeBg: 'bg-amber-600 text-white',
          icon: <AlertOctagon className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />,
          label: t('decision.INSUFFICIENT_DATA_VERIFY_MANUALLY', 'INSUFFICIENT DATA (VERIFY MANUALLY)')
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-300 text-slate-800',
          badgeBg: 'bg-slate-600 text-white',
          icon: <HelpCircle className={size === 'lg' ? 'w-6 h-6' : 'w-4 h-4'} />,
          label: decision || 'AWAITING EVALUATION'
        };
    }
  };

  const config = getStyleAndIcon();

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold border ${config.bg}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <div className={`p-4 rounded-xl border-2 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${config.bg}`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 rounded-lg ${config.badgeBg}`}>
          {config.icon}
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            RECOMMENDED ACTION
          </div>
          <div className="text-xl font-bold tracking-tight">
            {config.label}
          </div>
        </div>
      </div>

      {(confidenceBand || typeof reliabilityScore === 'number') && (
        <div className="flex items-center space-x-3 text-xs border-t sm:border-t-0 sm:border-l border-slate-300 pt-2 sm:pt-0 sm:pl-4">
          {confidenceBand && (
            <div>
              <span className="text-slate-500 block">Certainty:</span>
              <span className="font-bold text-slate-800">{confidenceBand}</span>
            </div>
          )}
          {typeof reliabilityScore === 'number' && (
            <div>
              <span className="text-slate-500 block">Reliability:</span>
              <span className="font-bold text-slate-800">{(reliabilityScore * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

