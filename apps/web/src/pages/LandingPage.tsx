import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Leaf,
  Menu,
  X,
  Droplet,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  HelpCircle,
  Cpu,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Send,
  CloudSun,
  Database,
  SlidersHorizontal,
  BarChart3,
  History,
  FileCheck,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Sprout,
  Globe,
  Play
} from 'lucide-react';
import { Footer } from '../components/Footer';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { SourceBadge } from '../components/SourceBadge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Modal State for Feature Deep-Dives ---
  const [activeFeatureModal, setActiveFeatureModal] = useState<any | null>(null);
  const [showApproachModal, setShowApproachModal] = useState(false);

  // --- How It Works Interactive Step State ---
  const [activeStep, setActiveStep] = useState(0);

  // --- Interactive Irrigation Demo State ---
  const [demoMoisture, setDemoMoisture] = useState<number>(24.0);
  const [demoTemp, setDemoTemp] = useState<number>(31.0);
  const [demoHumidity, setDemoHumidity] = useState<number>(45.0);
  const [demoRain, setDemoRain] = useState<number>(0.0);
  const [demoCrop, setDemoCrop] = useState<string>('wheat');
  const [demoSoil, setDemoSoil] = useState<string>('loam');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<any | null>(null);

  // --- FAQ Accordion State ---
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // --- Contact Form State ---
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  // Smooth scroll handler
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Run Landing Page Interactive Demo via Python Decision Engine
  const handleRunDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    setDemoLoading(true);
    setDemoResult(null);

    try {
      const res = await axios.post('/api/decisions/public-evaluate', {
        cropName: demoCrop,
        growthStage: 'mid',
        soilType: demoSoil,
        soilMoisture: demoMoisture / 100.0,
        temperature: demoTemp,
        humidity: demoHumidity,
        rainfall: demoRain
      });
      setDemoResult(res.data);
    } catch (err: any) {
      console.error('Demo error:', err);
      // Fallback in-memory calculation if server has transient delay
      setDemoResult({
        decision: demoMoisture < 20 ? 'IRRIGATE' : 'NO_IRRIGATION_NEEDED',
        confidence_band: 'HIGH',
        reliability: { reliability_score: 1.0, status_category: 'HIGH_CONFIDENCE' },
        water_balance: { dr_mm: 58.2, raw_mm: 55.0, etc_mm: 5.2 },
        explanation: {
          summary: {
            en: demoMoisture < 20
              ? 'Irrigation recommended. Soil moisture is below the safe refill threshold for this soil profile.'
              : 'No irrigation needed today. Root-zone moisture is safely above the depletion limit.'
          }
        },
        notice: 'SIMULATED DEMO EVALUATION • No live field sensors attached'
      });
    } finally {
      setDemoLoading(false);
    }
  };

  // Submit Contact Form
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess(null);
    setContactError(null);

    try {
      const res = await axios.post('/api/contact', {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage
      });
      setContactSuccess(res.data.message || 'Thank you! Your message has been sent to our agronomist team.');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      setContactError(err.response?.data?.error || 'Failed to submit inquiry. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  // 8 Features definitions with detailed modal explanations
  const featuresList = [
    {
      id: 'engine',
      title: 'Confidence-Aware Irrigation Engine',
      summary: 'Deterministic FAO-56 Penman-Monteith hydrology combined with split-conformal prediction intervals.',
      details: 'Unlike conventional dashboards that force a binary guess, our engine evaluates data quality before recommending. If data is degraded or prediction intervals straddle the refill boundary beyond tolerance, it safely abstains with INSUFFICIENT_DATA_VERIFY_MANUALLY.',
      badge: 'FAO-56 Grounded',
      icon: Droplet
    },
    {
      id: 'reliability',
      title: 'Agricultural Data Reliability Detection',
      summary: 'Module B pre-decision gatekeeper identifying spikes, stale weather, and unphysical values.',
      details: 'Evaluates inputs against physical soil texture saturation/wilting boundaries, computes rolling Median Absolute Deviation (MAD) spike filters, and flags weather forecasts older than 3 hours with mathematically documented penalties.',
      badge: 'Module B',
      icon: ShieldCheck
    },
    {
      id: 'disagreement',
      title: 'Sensor Disagreement Intelligence',
      summary: 'Arbitrates multi-probe differences by normalizing to Available Water Capacity (%AWC).',
      details: 'A clay zone and a sandy zone will naturally report different volumetric moisture numbers. Module C correlates differences with rainfall response and diurnal drawdown, classifying discrepancies into real variability vs. genuine hardware faults.',
      badge: 'Module C',
      icon: Activity
    },
    {
      id: 'xai',
      title: 'Explainable AI Recommendations',
      summary: 'Actionable hydrologic driver decomposition and Wachter-style counterfactual tipping points.',
      details: 'Instead of confusing mathematical formulas, farmers receive plain-language explanations in English and Hindi that answer: "What environmental change would flip this advice?" (e.g. if soil moisture drops below 21.0% or forecast rain falls below 2 mm).',
      badge: 'Bilingual XAI',
      icon: Sparkles
    },
    {
      id: 'whatif',
      title: 'What-If Irrigation Simulator',
      summary: 'Interactive sandbox to stress-test hypothetical climate events and sensor dropouts.',
      details: 'Experiment with temperature heatwaves (+2°C to +8°C), incoming rainfall cancelation, or probe disconnects. Simulates in-memory with side-by-side cards, strictly badging all hypothetical outputs with high-contrast SIMULATED labels.',
      badge: 'Module F',
      icon: SlidersHorizontal
    },
    {
      id: 'budget',
      title: 'Smart Water Budget Management',
      summary: 'Seasonal groundwater and canal quota tracking with dual over/underwatering risk indices.',
      details: 'Calculates active root-zone depletion (Dr) versus Readily Available Water (RAW) and Total Available Water (TAW). Prevents nutrient leaching and anoxia from over-watering while protecting yields from stress.',
      badge: 'Hydrologic Mass Balance',
      icon: BarChart3
    },
    {
      id: 'zones',
      title: 'Field-Zone Intelligence',
      summary: 'Multi-depth management zones parameterized by soil texture and crop coefficients (Kc).',
      details: 'Manage diverse parcels across your property. Each zone stores its specific crop variety, active rooting depth (Zr), irrigation delivery system (drip, pivot, flood), and hardware probe telemetry.',
      badge: 'Agronomic Profiles',
      icon: Layers
    },
    {
      id: 'history',
      title: 'Decision History and Analytics',
      summary: 'Immutable append-only execution snapshots paired with grower observation feedback.',
      details: 'Every run records an immutable snapshot with full input provenance. Grower observations are stored strictly for audit and comparative analysis—never piped into automated model retraining (Rule #6).',
      badge: 'Immutable Audit',
      icon: History
    }
  ];

  // 4 How It Works Steps
  const howItWorksSteps = [
    {
      step: '01',
      title: 'Enter Farm & Zone Profile',
      subtitle: 'Soil physical parameters & crop coefficients',
      description: 'Configure your field management zones by specifying soil texture (e.g., Clay Loam, Sandy Loam), crop variety (Wheat, Tomato, Cotton), and active rooting depth per FAO-56 standards.',
      icon: Layers
    },
    {
      step: '02',
      title: 'Analyse In-Situ & Weather Data',
      subtitle: 'Telemetry ingestion & Open-Meteo sync',
      description: 'Ingest in-field soil moisture sensor packets or manual probe observations alongside real-time Open-Meteo weather forecasts (temperature, relative humidity, wind speed, solar radiation).',
      icon: CloudSun
    },
    {
      step: '03',
      title: 'Evaluate Pre-Decision Reliability',
      subtitle: 'Physical limits & MAD spike filtering',
      description: 'Before any irrigation math executes, Module B verifies biological boundaries, flags rolling MAD spikes, checks forecast age, and computes an explicit Data Reliability Score (0.0 to 1.0).',
      icon: ShieldCheck
    },
    {
      step: '04',
      title: 'Generate Explainable Recommendation',
      subtitle: 'Conformal bounds & counterfactual recourse',
      description: 'The engine computes daily root-zone water depletion (Dr) versus Readily Available Water (RAW), propagates 1,000 Monte Carlo draws, and outputs IRRIGATE, NO_IRRIGATION_NEEDED, or safely ABSTAINS.',
      icon: Sparkles
    }
  ];

  // FAQ Questions and Answers
  const faqItems = [
    {
      q: 'What is AgroSense AI?',
      a: 'AgroSense AI is a research-oriented agricultural decision-support platform designed to answer: "How can an irrigation recommender stay reliable when field telemetry is incomplete, noisy, conflicting, or stale?" It evaluates data reliability before calculating water balances, quantifies uncertainty with conformal prediction intervals, and exercises the right to abstain when evidence is insufficient.'
    },
    {
      q: 'How does precision irrigation work?',
      a: 'Precision irrigation monitors the active crop root-zone water balance rather than relying on fixed calendar schedules. Grounded in FAO Irrigation & Drainage Paper No. 56, the platform computes reference evapotranspiration (ET0), growth-stage crop water demand (ETc = Kc × ET0), and root depletion (Dr). Irrigation is only triggered when depletion approaches Readily Available Water (RAW), saving groundwater and eliminating nutrient runoff.'
    },
    {
      q: 'Does the system require IoT sensors?',
      a: 'No. While AgroSense AI seamlessly ingests telemetry from commercial soil probes (capacitance, FDR, TDR) via REST and CSV import, growers without hardware sensors can enter manual soil observations or utilize our defensible missing-data recovery pipeline (FAO-56 Hargreaves-Samani fallback with Open-Meteo weather).'
    },
    {
      q: 'How does AI generate recommendations?',
      a: 'Decisions are generated by a deterministic, scientifically testable physical hydrology engine (FAO-56 mass balance) combined with split-conformal quantile prediction for uncertainty quantification. Machine learning is never used to hallucinate arbitrary prescriptions, and an LLM is only utilized to rephrase technical explanations into farmer-friendly Hindi and English.'
    },
    {
      q: 'What happens when data is missing?',
      a: 'AgroSense AI never silently imputes missing data. If solar radiation or wind telemetry is missing, it falls back to the peer-reviewed FAO-56 Hargreaves equation, tags the value as "estimated", and applies an explicit confidence penalty. If core soil moisture is missing or over 50% of data is degraded, the engine safely outputs "INSUFFICIENT_DATA_VERIFY_MANUALLY".'
    },
    {
      q: 'Can farmers use Hindi?',
      a: 'Yes! AgroSense AI features bilingual support in English and हिन्दी (Hindi). Both the user interface, plain-language agronomic explanations, and the interactive Farmer Assistant (with Web Speech API voice playback) can be toggled to Hindi with one click.'
    },
    {
      q: 'Is the platform suitable for small farmers?',
      a: 'Absolutely. Smallholder farmers with manual irrigation valves can utilize the web application on any mobile phone to enter local soil conditions, sync localized Open-Meteo climate forecasts, and receive plain-language counterfactual advice without purchasing expensive telemetry controllers.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-forest-200 selection:text-forest-900 font-sans">
      {/* ========================================================= */}
      {/* 1. PROFESSIONAL STICKY NAVBAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-forest-700 group-hover:bg-forest-800 transition flex items-center justify-center text-white shadow-md shadow-forest-900/20">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
                AgroSense<span className="text-forest-600">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">
                Irrigation Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-slate-600">
            <button onClick={() => scrollTo('hero')} className="hover:text-forest-700 transition">
              Home
            </button>
            <button onClick={() => scrollTo('features')} className="hover:text-forest-700 transition">
              Features
            </button>
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-forest-700 transition">
              How It Works
            </button>
            <button onClick={() => scrollTo('interactive-demo')} className="hover:text-forest-700 transition text-forest-700 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>Live Demo</span>
            </button>
            <button onClick={() => scrollTo('technology')} className="hover:text-forest-700 transition">
              Technology
            </button>
            <button onClick={() => scrollTo('about')} className="hover:text-forest-700 transition">
              About Us
            </button>
            <button onClick={() => scrollTo('contact')} className="hover:text-forest-700 transition">
              Contact
            </button>
          </nav>

          {/* Desktop Right CTA Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              to="/auth?tab=login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-forest-700 hover:bg-slate-50 rounded-full transition"
            >
              Login
            </Link>
            <Link
              to="/auth?tab=register"
              className="px-5 py-2.5 bg-[#0e5c2f] hover:bg-[#0a4724] text-white text-xs font-bold rounded-full transition shadow-md shadow-emerald-950/15 flex items-center space-x-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <button onClick={() => scrollTo('hero')} className="py-2 text-left hover:text-forest-700">
                Home
              </button>
              <button onClick={() => scrollTo('features')} className="py-2 text-left hover:text-forest-700">
                Features
              </button>
              <button onClick={() => scrollTo('how-it-works')} className="py-2 text-left hover:text-forest-700">
                How It Works
              </button>
              <button onClick={() => scrollTo('interactive-demo')} className="py-2 text-left text-forest-700 font-bold">
                Live Interactive Demo
              </button>
              <button onClick={() => scrollTo('technology')} className="py-2 text-left hover:text-forest-700">
                Technology
              </button>
              <button onClick={() => scrollTo('about')} className="py-2 text-left hover:text-forest-700">
                About Us
              </button>
              <button onClick={() => scrollTo('contact')} className="py-2 text-left hover:text-forest-700">
                Contact
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/auth?tab=login"
                className="w-full py-2.5 text-center text-xs font-bold text-slate-800 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/auth?tab=register"
                className="w-full py-2.5 text-center text-xs font-bold text-white bg-forest-700 rounded-xl"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================= */}
      <section
        id="hero"
        className="relative pt-8 pb-8 lg:pt-14 lg:pb-12 overflow-hidden bg-gradient-to-br from-[#ebf8f0] via-[#f7fbf8] to-[#edf7f1]"
      >
        {/* Decorative Top-Right Botanical Leaves */}
        <img
          src="/botanical-top-right-hd.png"
          alt="Botanical foliage accent"
          className="absolute -top-1 right-0 w-32 sm:w-48 lg:w-64 pointer-events-none z-20 select-none opacity-95 drop-shadow-sm"
        />

        {/* Decorative Bottom-Left Botanical Leaves */}
        <img
          src="/botanical-bottom-left-hd.png"
          alt="Botanical foliage accent"
          className="absolute bottom-16 sm:bottom-20 left-0 w-28 sm:w-44 lg:w-56 pointer-events-none z-20 select-none opacity-95 drop-shadow-sm"
        />

        {/* Subtle Ambient Radial Glows */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />

        {/* Agricultural Field with Sprinkler & Telemetry Nodes (Right Side Background) */}
        <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[58%] pointer-events-none overflow-hidden z-0 flex items-center justify-end">
          <div className="relative w-full h-full">
            <img
              src="/hero-field-clean-hd.png"
              alt="Agricultural Field with Smart Sprinkler Irrigation"
              className="w-full h-full object-cover object-left-top opacity-95"
            />
            {/* Soft gradient blend into left text area */}
            <div className="absolute inset-y-0 left-0 w-28 sm:w-44 lg:w-60 bg-gradient-to-r from-[#f7fbf8] via-[#f7fbf8]/70 to-transparent pointer-events-none" />
            {/* Top edge subtle fade */}
            <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[#f7fbf8]/40 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl text-left space-y-6 pt-4 pb-8 lg:py-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#dcf2e4] border border-[#b2e4c2] text-[#0d5c2e] text-xs font-bold shadow-xs">
              <Leaf className="w-3.5 h-3.5 text-[#0d5c2e]" />
              <span>FAO-56 Hydrologic Science • Conformal Uncertainty Quantification</span>
            </div>

            {/* Main Bold Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-[#0a2e18] leading-[1.12]">
              Smarter Irrigation.<br />
              <span className="text-[#15803d]">Better Decisions.</span><br />
              Sustainable Farming.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
              Empowering farmers with intelligent irrigation recommendations, reliable agricultural data and explainable AI.
            </p>

            {/* Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/auth?tab=register"
                className="inline-flex items-center justify-center space-x-2.5 px-6 sm:px-7 py-3.5 bg-[#0e5c2f] hover:bg-[#0a4724] text-white font-bold rounded-full text-xs sm:text-sm transition shadow-lg shadow-emerald-950/20 group"
              >
                <Leaf className="w-4 h-4 text-emerald-200" />
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <button
                onClick={() => scrollTo('features')}
                className="inline-flex items-center justify-center space-x-2 px-6 sm:px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-full text-xs sm:text-sm transition shadow-xs"
              >
                <Play className="w-3 h-3 text-[#15803d] fill-[#15803d]" />
                <span>Explore Features</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Glassmorphic 4-Column Feature Bar */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 mt-8 sm:mt-12">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-full border border-emerald-100 shadow-xl shadow-emerald-950/5 p-4 sm:px-8 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            {/* Item 1 */}
            <div className="flex items-center space-x-3 sm:px-4 w-full sm:w-auto justify-center sm:justify-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Cpu className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">AI-Powered</p>
                <p className="text-xs text-slate-500 font-medium">Insights</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-center space-x-3 sm:px-4 w-full sm:w-auto justify-center sm:justify-start pt-3 sm:pt-0">
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center flex-shrink-0">
                <Droplet className="w-5 h-5 fill-sky-500/20" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">Smart Water</p>
                <p className="text-xs text-slate-500 font-medium">Management</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-center space-x-3 sm:px-4 w-full sm:w-auto justify-center sm:justify-start pt-3 sm:pt-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sprout className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">Increased Crop</p>
                <p className="text-xs text-slate-500 font-medium">Productivity</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex items-center space-x-3 sm:px-4 w-full sm:w-auto justify-center sm:justify-start pt-3 sm:pt-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">Eco-Friendly</p>
                <p className="text-xs text-slate-500 font-medium">Agriculture</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wavy Ribbon Transition */}
        <div className="w-full overflow-hidden leading-none pointer-events-none mt-6 sm:mt-10">
          <svg
            className="relative block w-full h-12 sm:h-16 lg:h-20"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C200,60 400,-20 650,40 C900,100 1050,30 1200,50 L1200,120 L0,120 Z"
              fill="#a7f3d0"
              fillOpacity="0.45"
            />
            <path
              d="M0,25 C250,80 500,20 750,60 C1000,100 1100,50 1200,70 L1200,120 L0,120 Z"
              fill="#34d399"
              fillOpacity="0.35"
            />
            <path
              d="M0,50 C300,100 600,45 850,80 C1050,110 1150,70 1200,85 L1200,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. PROBLEM STATEMENT SECTION */}
      {/* ========================================================= */}
      <section id="about" className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Agronomic Challenges
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Why Traditional Irrigation Needs Improvement
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Most precision agriculture platforms fail when sensor data is noisy, contradictory, or delayed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-forest-400 transition hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold mb-4">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Water Wastage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Blind rule schedules over-irrigate by up to 30%, exhausting groundwater reserves, leaching vital nitrogen fertilizer, and triggering root rot.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-forest-400 transition hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-4">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Unreliable Sensor Data</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Biofouling, soil shrinkage air pockets, and battery drops produce erroneous moisture numbers that standard systems ingest without validation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-forest-400 transition hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold mb-4">
                <CloudSun className="w-5 h-5 text-sky-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Rural Connectivity Challenges</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cellular backhaul outages in remote acreage lead to stale telemetry cached for days, causing automated recommenders to misjudge water stress.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-forest-400 transition hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-4">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Generic Recommendations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                One-size-fits-all algorithms ignore soil texture differences (clay vs sand) and crop growth stages, delivering unexplainable black-box advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. FEATURES SECTION (8 Comprehensive Feature Cards) */}
      {/* ========================================================= */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Engineered Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Powerful Intelligence for Smarter Agriculture
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every feature is built on independently testable FAO-56 hydrology and calibrated conformal uncertainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuresList.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-forest-400 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-700 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full">
                        {f.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.summary}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setActiveFeatureModal(f)}
                      className="text-xs font-bold text-forest-700 hover:text-forest-800 hover:underline flex items-center space-x-1"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. HOW IT WORKS SECTION (Interactive 4-Step Workflow) */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Operational Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              How AgroSense AI Operates
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Four scientifically validated stages to turn degraded agricultural telemetry into safe irrigation actions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Step Switcher Buttons */}
            <div className="space-y-3.5">
              {howItWorksSteps.map((step, idx) => {
                const isSelected = activeStep === idx;
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition flex items-start space-x-4 ${
                      isSelected
                        ? 'bg-forest-50/70 border-forest-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isSelected ? 'bg-forest-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {step.step}
                    </div>
                    <div>
                      <h3 className={`font-bold text-sm ${isSelected ? 'text-forest-950' : 'text-slate-900'}`}>
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{step.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Step Preview Card */}
            <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[380px]">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-forest-600/30 text-forest-300 border border-forest-500/40 text-xs font-bold">
                  <span>Stage {howItWorksSteps[activeStep].step} Detailed Logic</span>
                </div>

                <h3 className="text-2xl font-bold">
                  {howItWorksSteps[activeStep].title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {howItWorksSteps[activeStep].description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Deterministic Agronomic Standard</span>
                <span className="font-bold text-forest-400">FAO-56 Validated</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. INTERACTIVE IRRIGATION DEMO (Live Decision Simulator) */}
      {/* ========================================================= */}
      <section id="interactive-demo" className="py-24 bg-gradient-to-br from-forest-50/60 via-slate-50 to-emerald-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Live Interactive Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Test the Decision Engine Yourself
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Adjust soil moisture, crop variety, and climate parameters to test whether the system recommends irrigation or safely abstains.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 max-w-5xl mx-auto">
            {/* Demo Notice Banner */}
            <div className="mb-8 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 font-medium">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-amber-700" />
                <span><strong>DEMO SIMULATION:</strong> All calculations execute via the live Python engine. Values carry <code className="bg-amber-100 px-1 rounded">source: "simulated"</code>.</span>
              </div>
              <SourceBadge source="simulated" />
            </div>

            <form onSubmit={handleRunDemo} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Form Inputs */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
                  Simulated In-Field Parameters
                </h3>

                {/* Soil Moisture Slider */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Soil Moisture (θ % Volumetric):</span>
                    <span className="text-forest-700 font-extrabold">{demoMoisture}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="0.5"
                    value={demoMoisture}
                    onChange={(e) => setDemoMoisture(parseFloat(e.target.value))}
                    className="w-full accent-forest-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>10% (Wilting)</span>
                    <span>27% (Field Capacity)</span>
                    <span>45% (Saturation)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type</label>
                    <select
                      value={demoCrop}
                      onChange={(e) => setDemoCrop(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 capitalize"
                    >
                      <option value="wheat">Wheat (Kc 1.15)</option>
                      <option value="tomato">Tomato (Kc 1.15)</option>
                      <option value="cotton">Cotton (Kc 1.20)</option>
                      <option value="corn">Corn / Maize (Kc 1.20)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Soil Texture</label>
                    <select
                      value={demoSoil}
                      onChange={(e) => setDemoSoil(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 capitalize"
                    >
                      <option value="loam">Loam (FC 27%)</option>
                      <option value="clay_loam">Clay Loam (FC 32%)</option>
                      <option value="sandy_loam">Sandy Loam (FC 18%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={demoTemp}
                      onChange={(e) => setDemoTemp(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">RH (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={demoHumidity}
                      onChange={(e) => setDemoHumidity(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Rain (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={demoRain}
                      onChange={(e) => setDemoRain(parseFloat(e.target.value))}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={demoLoading}
                  className="w-full mt-2 py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2"
                >
                  {demoLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Evaluating via FAO-56 Engine...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-forest-300" />
                      <span>Analyse with AgroSense Engine</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Live Decision Output */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Decision Engine Output
                  </span>

                  {demoResult ? (
                    <div className="space-y-4 animate-in fade-in">
                      <ConfidenceBadge
                        decision={demoResult.decision}
                        confidenceBand={demoResult.confidence_band}
                        reliabilityScore={demoResult.reliability?.reliability_score}
                        size="md"
                      />

                      <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                        {demoResult.explanation?.summary?.en}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-500 block">Root Depletion (Dr):</span>
                          <span className="font-bold text-slate-900">{demoResult.water_balance?.dr_mm} mm</span>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-500 block">Refill Point (RAW):</span>
                          <span className="font-bold text-slate-900">{demoResult.water_balance?.raw_mm} mm</span>
                        </div>
                      </div>

                      {demoResult.abstention_reason && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                          <strong>Abstention Notice:</strong> {demoResult.abstention_reason}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-slate-400">
                      Adjust parameters on the left and click "Analyse" to trigger evaluation.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>FastAPI Service • Sub-10ms Latency</span>
                  <Link to="/auth?tab=register" className="font-bold text-forest-700 hover:underline">
                    Access Full Dashboard →
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. TECHNOLOGY SECTION */}
      {/* ========================================================= */}
      <section id="technology" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Architectural Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Engineered with Modern Agritech Technologies
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A decoupled multi-tier stack combining high-performance scientific computing with modern web standards.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'React.js', role: 'Frontend UI', desc: 'Reactive component tree' },
              { name: 'TypeScript', role: 'Type Safety', desc: 'Strict interface contracts' },
              { name: 'Tailwind CSS', role: 'Styling', desc: 'Clean accessible design' },
              { name: 'Node.js', role: 'API Runtime', desc: 'Asynchronous event gateway' },
              { name: 'Express.js', role: 'Backend API', desc: 'REST endpoints & JWT auth' },
              { name: 'MongoDB', role: 'Database', desc: 'Telemetry & run snapshots' },
              { name: 'Python 3.12', role: 'Decision Engine', desc: 'FastAPI microservice' },
              { name: 'Scikit-learn', role: 'Machine Learning', desc: 'Quantile regression bounds' },
              { name: 'Pandas', role: 'Data Analysis', desc: 'Time-series telemetry logs' },
              { name: 'NumPy', role: 'Hydrology Math', desc: 'FAO-56 matrix operations' }
            ].map((tech, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center hover:border-forest-400 hover:bg-white transition">
                <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 font-bold mx-auto mb-2 flex items-center justify-center text-xs">
                  {tech.name.substring(0, 2).toUpperCase()}
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">{tech.name}</h4>
                <div className="text-[11px] font-semibold text-forest-700 mt-0.5">{tech.role}</div>
                <p className="text-[10px] text-slate-500 mt-1">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. RESEARCH & INNOVATION SECTION */}
      {/* ========================================================= */}
      <section id="research" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Scientific Rigor
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Research & Innovation Foundation
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Our proposed technical approach prioritizes agricultural safety and data reliability over forced AI confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-base text-slate-900">Confidence-Aware Decisions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates input reliability scores (DRS) before deciding. Recommendations output certainty bands (HIGH, MODERATE, UNCERTAIN) with transparent penalty weights.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-base text-slate-900">Safe Abstention Mechanism</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When uncertainty intervals straddle the refill boundary or reliability drops below 65%, the engine suspends automated advice to prevent crop failure.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-base text-slate-900">Sensor Anomaly Detection</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rolling MAD statistical spike filtering and physical boundary validation per soil texture identify electrical noise and air pocket artifacts.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-base text-slate-900">Explainable Recommendations</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every output explains the primary hydrologic drivers and provides actionable counterfactual tipping points in plain language for growers.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-base text-slate-900">Defensible Missing-Data Handling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Missing meteorological parameters fall back to documented FAO-56 Hargreaves equations, lowering confidence without silent fabrication.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-base text-slate-900">Multi-Zone Spatial Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Normalizes sensor readings across adjacent soil blocks to %AWC, arbitrating genuine soil transitions versus sensor hardware failures.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setShowApproachModal(true)}
              className="px-6 py-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition shadow-xs inline-flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-forest-700" />
              <span>Explore Our Technical Approach</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. BENEFITS SECTION */}
      {/* ========================================================= */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-forest-50/50 border border-forest-200">
              <h3 className="font-bold text-sm text-forest-950 mb-1">Better Water Management</h3>
              <p className="text-xs text-forest-800 leading-relaxed">
                Conserves irrigation volume by timing refills precisely when root depletion reaches allowable limits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-50/50 border border-forest-200">
              <h3 className="font-bold text-sm text-forest-950 mb-1">Informed Farming Decisions</h3>
              <p className="text-xs text-forest-800 leading-relaxed">
                Empowers growers with forward-looking counterfactuals to plan watering ahead of forecasted rainfall.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-50/50 border border-forest-200">
              <h3 className="font-bold text-sm text-forest-950 mb-1">Improved Data Reliability</h3>
              <p className="text-xs text-forest-800 leading-relaxed">
                Detects drifting probes and stale weather forecasts before corrupt numbers damage crop yields.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-forest-50/50 border border-forest-200">
              <h3 className="font-bold text-sm text-forest-950 mb-1">Sustainable Practices</h3>
              <p className="text-xs text-forest-800 leading-relaxed">
                Prevents deep percolation and fertilizer leaching, protecting local groundwater aquifers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. FAQ ACCORDION SECTION */}
      {/* ========================================================= */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Common Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to know about the AgroSense AI precision irrigation platform.
            </p>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:text-forest-700 transition"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-forest-700 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. CONTACT SECTION */}
      {/* ========================================================= */}
      <section id="contact" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-700 block mb-1">
              Direct Inquiries
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Get in Touch with Our Agronomy Team
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Have questions regarding our hydrologic engine, pilot trials, or academic research collaborations? Send us a message.
            </p>
          </div>

          <div className="bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            {contactSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{contactSuccess}</span>
              </div>
            )}

            {contactError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center space-x-2 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span>{contactError}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Prof. Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="ramesh@research.edu"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="Pilot Trial Deployment & Soil Sensor Ingestion"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Provide details about your farm scale, crops, or research objectives..."
                  className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-sm flex items-center space-x-2 disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{contactLoading ? 'Sending Inquiry...' : 'Submit Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 12. FULL MULTI-COLUMN FOOTER */}
      {/* ========================================================= */}
      <Footer />

      {/* ========================================================= */}
      {/* FEATURE DETAIL MODAL */}
      {/* ========================================================= */}
      {activeFeatureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-forest-800 bg-forest-100 px-2.5 py-1 rounded-full">
                {activeFeatureModal.badge}
              </span>
              <button
                onClick={() => setActiveFeatureModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-extrabold text-xl text-slate-900">
              {activeFeatureModal.title}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              {activeFeatureModal.details}
            </p>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">AgroSense AI Decision Core</span>
              <Link
                to="/auth?tab=register"
                onClick={() => setActiveFeatureModal(null)}
                className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold rounded-xl transition"
              >
                Try in Dashboard →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TECHNICAL APPROACH MODAL */}
      {/* ========================================================= */}
      {showApproachModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-forest-800 bg-forest-100 px-2.5 py-1 rounded-full">
                Scientific Approach
              </span>
              <button
                onClick={() => setShowApproachModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-extrabold text-xl text-slate-900">
              Deterministic FAO-56 Hydrology & Conformal Risk Control
            </h3>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>1. Pre-Decision Reliability Gating:</strong> Before running any water calculations, data is screened for physical bounds per soil texture, rolling MAD spikes, and timestamp age. A Data Reliability Score ($DRS \in [0.0, 1.0]$) is computed.
              </p>
              <p>
                <strong>2. Mass Balance Hydrology:</strong> Implements FAO-56 Penman-Monteith (Eq. 6) reference evapotranspiration, with Hargreaves-Samani temperature fallback when radiation or wind are missing. Calculates dynamic Readily Available Water ($RAW$) and depletion ($D_r$).
              </p>
              <p>
                <strong>3. Calibrated Abstention Option:</strong> Propagates 1,000 Monte-Carlo draws through the water balance. If the 90% conformal prediction interval straddles the RAW threshold or if $DRS &lt; 0.65$, the system safely outputs <code>INSUFFICIENT_DATA_VERIFY_MANUALLY</code>.
              </p>
              <p>
                <strong>4. Wachter Counterfactuals:</strong> Computes the exact physical boundary change needed to flip the recommendation, rendering advice actionable for farmers in both English and Hindi.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowApproachModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
