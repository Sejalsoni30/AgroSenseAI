import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-bold text-forest-700 hover:text-forest-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AgroSense AI</span>
        </Link>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
            Data Governance & Privacy
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Effective Date: October 31, 2026 • Version 1.2
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-forest-700" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              AgroSense AI processes agricultural telemetry and operational information necessary to calculate accurate crop water balances under FAO-56 standards:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li><strong>User Account Details:</strong> Name, email address, chosen role (farmer, researcher, agronomist), and preferred interface language.</li>
              <li><strong>Agronomic & Soil Profiles:</strong> Farm coordinates (latitude/longitude), soil texture classifications (e.g. clay loam, sandy loam), crop varieties, and active root-zone depths.</li>
              <li><strong>In-Field Sensor & Climate Telemetry:</strong> In-situ soil moisture readings, ambient temperature, relative humidity, and precipitation data.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-forest-700" />
              <span>2. Strict Non-Negotiable Integrity & Data Isolation</span>
            </h2>
            <p>
              In accordance with our core engineering rules:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li><strong>Zero Auto-Retraining on Unverified Feedback:</strong> Farmer observations and feedback entries are stored strictly for audit analysis and evaluation comparisons—they are never piped into automated machine learning model retraining.</li>
              <li><strong>Provenance Badging:</strong> Every telemetry record explicitly tracks whether it was <code>measured</code>, <code>manual</code>, <code>api</code>, <code>estimated</code>, or <code>simulated</code>.</li>
              <li><strong>Open-Meteo Weather Data:</strong> Meteorological forecast telemetry is fetched under the Creative Commons Attribution 4.0 (CC-BY 4.0) license with transparent attribution.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Eye className="w-5 h-5 text-forest-700" />
              <span>3. How We Protect Your Agricultural Data</span>
            </h2>
            <p>
              We implement industry-standard cryptographic protections:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li>All user passwords are encrypted using salted bcrypt hashing.</li>
              <li>API requests are secured using JSON Web Tokens (JWT) and HTTPS transport layer security.</li>
              <li>Farm telemetry snapshots are append-only to preserve immutable audit trails.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-forest-700" />
              <span>4. Contact Data Governance Officer</span>
            </h2>
            <p>
              For inquiries regarding data retention, farm telemetry export, or account deletion, contact our engineering team at <a href="mailto:privacy@agrosense.ai" className="text-forest-700 font-bold hover:underline">privacy@agrosense.ai</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

