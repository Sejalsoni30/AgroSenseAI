import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { AppLayout } from './components/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DashboardPage } from './pages/DashboardPage';
import { FarmManagementPage } from './pages/FarmManagementPage';
import { IrrigationIntelligencePage } from './pages/IrrigationIntelligencePage';
import { ReliabilityCenterPage } from './pages/ReliabilityCenterPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { WaterManagementPage } from './pages/WaterManagementPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { FarmerAssistantPage } from './pages/FarmerAssistantPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Loading AgroSenseAI...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?tab=login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <FarmProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <Routes>
            {/* Public Marketing & Combined Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<Navigate to="/auth?tab=login" replace />} />
            <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Protected App Routes inside unified layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/irrigation" element={<IrrigationIntelligencePage />} />
              <Route path="/farms" element={<FarmManagementPage />} />
              <Route path="/reliability" element={<ReliabilityCenterPage />} />
              <Route path="/what-if" element={<WhatIfSimulatorPage />} />
              <Route path="/water" element={<WaterManagementPage />} />
              <Route path="/history" element={<DecisionHistoryPage />} />
              <Route path="/assistant" element={<FarmerAssistantPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FarmProvider>
    </AuthProvider>
  );
}

export default App;

