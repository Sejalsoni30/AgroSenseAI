import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Droplets,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  BarChart3,
  History,
  Languages,
  LogOut,
  Settings,
  Leaf,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('agrosense_lang', nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { to: '/irrigation', label: t('nav.irrigationIntel', 'Irrigation Intelligence'), icon: Droplets },
    { to: '/farms', label: t('nav.farmManagement', 'Farm & Zones'), icon: Layers },
    { to: '/reliability', label: t('nav.reliabilityCenter', 'Data Reliability'), icon: ShieldCheck },
    { to: '/what-if', label: t('nav.whatIfSimulator', 'What-If Simulator'), icon: SlidersHorizontal },
    { to: '/water', label: t('nav.waterManagement', 'Water Management'), icon: BarChart3 },
    { to: '/history', label: t('nav.decisionHistory', 'Audit & History'), icon: History },
    { to: '/assistant', label: t('nav.farmerAssistant', 'Farmer Assistant'), icon: Sparkles },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-forest-600 flex items-center justify-center text-white shadow-md shadow-forest-900/50">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                AgroSense<span className="text-forest-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase block font-medium">
                Irrigation Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-forest-700 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User profile & footer controls */}
        <div className="p-3 border-t border-slate-800 space-y-2 bg-slate-950/40">
          {/* Bilingual toggle button */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
          >
            <div className="flex items-center space-x-2">
              <Languages className="w-4 h-4 text-forest-400" />
              <span>Language / भाषा</span>
            </div>
            <span className="font-bold text-forest-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700">
              {i18n.language === 'hi' ? 'हिन्दी' : 'English'}
            </span>
          </button>

          {/* User info & logout */}
          {user ? (
            <div className="pt-2 flex items-center justify-between px-2">
              <div className="truncate mr-2">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user.role}</div>
              </div>
              <button
                onClick={handleLogout}
                title={t('nav.logout', 'Logout')}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="pt-1">
              <NavLink
                to="/login"
                className="block text-center w-full py-2 bg-forest-600 hover:bg-forest-500 text-white text-xs font-bold rounded-lg transition"
              >
                {t('nav.login', 'Sign In')}
              </NavLink>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

