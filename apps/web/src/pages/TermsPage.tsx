import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertOctagon, CheckCircle2, Shield } from 'lucide-react';

export const TermsPage: React.FC = () => {
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
            Operational Agreement
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last Updated: October 31, 2026 • AgroSense AI Platform
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-forest-700" />
              <span>1. Scientific Decision-Support Disclaimer</span>
            </h2>
            <p>
              AgroSense AI provides an agronomic decision-support platform grounded in FAO-56 hydrological models and conformal uncertainty intervals. 
              The platform outputs recommendations (`IRRIGATE`, `NO_IRRIGATION_NEEDED`, or `INSUFFICIENT_DATA_VERIFY_MANUALLY`).
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 font-medium">
              <strong>Operational Notice:</strong> Recommendations are advisory. Farm managers, growers, and agronomists must maintain visual field oversight. When the system outputs <code>INSUFFICIENT_DATA_VERIFY_MANUALLY</code>, manual verification of in-situ soil moisture is mandatory prior to valve actuation.
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-forest-700" />
              <span>2. Permissible Use & Account Responsibility</span>
            </h2>
            <p>
              Users agree to provide accurate field parameters (e.g. soil texture, crop growth stage) to ensure hydrologic equations conserve physical mass. Users are responsible for maintaining the confidentiality of their credentials and API tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-forest-700" />
              <span>3. External Weather API Terms</span>
            </h2>
            <p>
              Weather forecasts and historical reanalysis are provided via Open-Meteo under the Creative Commons Attribution 4.0 International license. Automated requests are cached locally (15-minute TTL) to maintain service integrity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <AlertOctagon className="w-5 h-5 text-forest-700" />
              <span>4. Limitation of Agronomic Liability</span>
            </h2>
            <p>
              While AgroSense AI implements rigorous pre-decision data reliability screening and conformal prediction intervals, environmental factors such as unexpected cloud bursts, severe canal outages, or localized hardware probe detachment remain subject to physical grower verification.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

