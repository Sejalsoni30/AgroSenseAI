import React from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf,
  Mail,
  Github,
  Linkedin,
  Instagram,
  ArrowUpRight,
  ShieldCheck,
  Droplet
} from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-md shadow-forest-900/50">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                AgroSense<span className="text-forest-400">AI</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              Confidence-aware & explainable precision irrigation decision-support platform grounded in FAO-56 hydrology and conformal prediction.
            </p>

            <div className="pt-2 text-xs font-semibold text-forest-400 flex items-center space-x-1.5">
              <Droplet className="w-3.5 h-3.5" />
              <span>Smart Farming. Better Tomorrow.</span>
            </div>

            {/* Social Media & Developer Links */}
            <div className="pt-2 flex items-center space-x-3 text-slate-400">
              <a
                href="https://github.com/Sejalsoni30"
                target="_blank"
                rel="noopener noreferrer"
                title="Sejal Soni on GitHub"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-forest-900/60 hover:text-white border border-slate-800 transition"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/sejal-soni-361897303"
                target="_blank"
                rel="noopener noreferrer"
                title="Sejal Soni on LinkedIn"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-blue-900/60 hover:text-white border border-slate-800 transition"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/webcraft_studio_404?vrfl=dmd4bmd2bGRubWxy"
                target="_blank"
                rel="noopener noreferrer"
                title="WebCraft Studio on Instagram"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-pink-900/60 hover:text-white border border-slate-800 transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:sejalsoni372@gmail.com"
                title="Email Sejal Soni (sejalsoni372@gmail.com)"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-emerald-900/60 hover:text-white border border-slate-800 transition"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-forest-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-forest-400 transition text-left">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-forest-400 transition text-left">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-forest-400 transition text-left">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('technology')} className="hover:text-forest-400 transition text-left">
                  Technology
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="hover:text-forest-400 transition text-left">
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Platform
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/irrigation" className="hover:text-forest-400 transition">
                  Irrigation Intelligence
                </Link>
              </li>
              <li>
                <Link to="/reliability" className="hover:text-forest-400 transition">
                  Data Reliability
                </Link>
              </li>
              <li>
                <button onClick={() => scrollToSection('interactive-demo')} className="hover:text-forest-400 transition text-left">
                  AI Recommendations
                </button>
              </li>
              <li>
                <Link to="/what-if" className="hover:text-forest-400 transition">
                  What-If Simulator
                </Link>
              </li>
              <li>
                <Link to="/water" className="hover:text-forest-400 transition">
                  Water Management
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-forest-400 transition">
                  Farmer Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Resources
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => scrollToSection('research')} className="hover:text-forest-400 transition text-left">
                  Research & Innovation
                </button>
              </li>
              <li>
                <a
                  href="https://www.fao.org/land-water/databases-and-software/crop-information/crop-evapotranspiration/en/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-forest-400 transition inline-flex items-center space-x-1"
                >
                  <span>FAO-56 Documentation</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </li>
              <li>
                <button onClick={() => scrollToSection('faq')} className="hover:text-forest-400 transition text-left">
                  FAQs
                </button>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-forest-400 transition">
                  Help Center (Assistant)
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-forest-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-forest-400 transition">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Account */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Account
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/auth?tab=login" className="hover:text-forest-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/auth?tab=register" className="hover:text-forest-400 transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/auth?tab=login" className="hover:text-forest-400 transition">
                  Forgot Password
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-forest-400 transition">
                  User Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-forest-400" />
            <span>
              &copy; {currentYear} AgroSense AI • Developed by{' '}
              <a
                href="https://github.com/Sejalsoni30"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-slate-400 hover:text-forest-400 transition underline underline-offset-2"
              >
                Sejal Soni
              </a>
              . Grounded in FAO-56 Hydrology & Conformal Prediction.
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/privacy" className="hover:text-slate-300 transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-300 transition">
              Terms & Conditions
            </Link>
            <a
              href="mailto:sejalsoni372@gmail.com"
              className="hover:text-slate-300 transition font-medium"
            >
              sejalsoni372@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

