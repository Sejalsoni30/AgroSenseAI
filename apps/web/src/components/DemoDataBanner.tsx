import React from 'react';
import { Database, AlertTriangle } from 'lucide-react';

interface DemoDataBannerProps {
  isDemo?: boolean;
}

export const DemoDataBanner: React.FC<DemoDataBannerProps> = ({ isDemo = true }) => {
  if (!isDemo) return null;

  return (
    <div className="bg-amber-50 border-y border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center space-x-2 font-medium">
        <Database className="w-4 h-4 text-amber-700 flex-shrink-0" />
        <span className="font-bold tracking-wide uppercase bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px]">
          DEMO DATA ACTIVE
        </span>
        <span>
          Showing simulated calibration & benchmark records. All values carry <code className="bg-amber-100 px-1 rounded">source: "demo"</code>.
        </span>
      </div>
      <div className="flex items-center space-x-1.5 text-amber-700 text-[11px]">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>No live field sensors connected to this demo profile</span>
      </div>
    </div>
  );
};

