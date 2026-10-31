import React from 'react';
import { Menu, MapPin, ChevronDown, RefreshCw, CloudSun } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { farms, activeFarm, setActiveFarm, zones, activeZone, setActiveZone, refreshFarms, isLoading } = useFarm();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left: Mobile burger & Active farm selector */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Farm selector dropdown */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-forest-700 hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Farm
              </span>
              <div className="relative inline-block">
                <select
                  value={activeFarm?._id || ''}
                  onChange={(e) => {
                    const selected = farms.find(f => f._id === e.target.value);
                    if (selected) setActiveFarm(selected);
                  }}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-md pl-2 pr-7 py-1 focus:outline-none focus:ring-1 focus:ring-forest-600 cursor-pointer max-w-[200px] sm:max-w-[280px] truncate"
                >
                  {farms.length === 0 ? (
                    <option value="">No farms configured</option>
                  ) : (
                    farms.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Zone Selector */}
          {activeFarm && zones.length > 0 && (
            <div className="hidden md:flex flex-col border-l border-slate-200 pl-3">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Zone / Block
              </span>
              <div className="relative inline-block">
                <select
                  value={activeZone?._id || ''}
                  onChange={(e) => {
                    const selected = zones.find(z => z._id === e.target.value);
                    if (selected) setActiveZone(selected);
                  }}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-md pl-2 pr-7 py-1 focus:outline-none focus:ring-1 focus:ring-forest-600 cursor-pointer max-w-[200px] truncate"
                >
                  {zones.map((z) => (
                    <option key={z._id} value={z._id}>
                      {z.name} ({z.cropName})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Right side: quick stats & refresh */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => refreshFarms()}
            disabled={isLoading}
            title="Refresh Farm Data"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-forest-700' : ''}`} />
          </button>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-medium">
            <CloudSun className="w-3.5 h-3.5 text-forest-600" />
            <span>Open-Meteo Synced</span>
          </div>
        </div>
      </div>
    </header>
  );
};

