import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Leaf,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  X,
  UserCheck,
  ExternalLink,
  Mail,
  Lock,
  User,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../config/firebase';

export const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<'farmer' | 'researcher' | 'agronomist'>('farmer');
  const [regLanguage, setRegLanguage] = useState<'en' | 'hi'>('en');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Forgot password modal/subview state
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'register' || tabParam === 'login') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setSearchParams({ tab });
    setError(null);
    setSuccess(null);
    setIsForgotView(false);
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPassword
      });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        preferredLanguage: regLanguage
      });
      setSuccess('Account created successfully! Logging you in...');
      setTimeout(() => {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. An account with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Google Authentication via Firebase SDK
  const handleGoogleAuth = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // 1. Trigger official Google Account Selection popup
      const firebaseResult = await signInWithGoogle();
      const user = firebaseResult.user;
      const idToken = firebaseResult.idToken;

      if (!user.email) {
        throw new Error('Google account did not return a valid email address.');
      }

      const res = await axios.post('/api/auth/google', {
        credential: idToken,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || undefined,
        uid: user.uid,
        role: regRole,
        preferredLanguage: regLanguage
      });

      setSuccess(`Authenticated as ${user.email}! Opening AgroSense AI Dashboard...`);
      setTimeout(() => {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      }, 500);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled. Please choose your Google account to open the dashboard.');
      } else if (
        err.code === 'auth/operation-not-allowed' ||
        err.message?.includes('operation-not-allowed') ||
        err.message?.includes('CONFIGURATION_NOT_FOUND') ||
        err.code === 'auth/configuration-not-found' ||
        err.code === 'auth/internal-error'
      ) {
        setError(
          'Google Sign-In is disabled in your Firebase Console for project agrosenseai-d4f4d. Please click "Open Firebase Console to Enable Google" below to turn it ON. Once turned ON, the Google account selection popup (like your 2nd image) will open automatically!'
        );
      } else {
        setError(err.response?.data?.error || err.message || 'Google authentication encountered an error.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Forgot Password Request
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/forgot-password', {
        email: forgotEmail.trim()
      });
      setSuccess(res.data.message);
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken);
        setForgotStep('reset');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/reset-password', {
        token: resetToken,
        newPassword
      });
      setSuccess(res.data.message);
      setTimeout(() => {
        setIsForgotView(false);
        setForgotStep('request');
        setActiveTab('login');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Quick fill demo credentials
  const handleFillDemo = () => {
    setLoginEmail('demo@agrosense.ai');
    setLoginPassword('demo123');
    setError(null);
  };

  // Helper: Go back to previous page or home
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-forest-50/30 to-emerald-50/40 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 relative">
      {/* Top Global Navigation Bar with Previous Page Button */}
      <div className="w-full max-w-md mx-auto mb-4 sm:mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-forest-800 shadow-xs hover:shadow-sm text-xs font-bold transition group cursor-pointer"
          title="Return to previous page"
        >
          <ArrowLeft className="w-4 h-4 text-forest-700 group-hover:-translate-x-0.5 transition-transform" />
          <span>Previous Page</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-forest-700 hover:bg-white/60 transition"
        >
          <span>AgroSense Home</span>
        </Link>
      </div>

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-forest-700 group-hover:bg-forest-800 transition flex items-center justify-center text-white shadow-lg shadow-forest-900/20">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            AgroSense<span className="text-forest-600">AI</span>
          </span>
        </Link>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium">
          Confidence-Aware & Explainable Irrigation Intelligence Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Main Combined Card */}
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl shadow-forest-950/10 rounded-3xl border border-slate-200/90 sm:px-10 relative overflow-hidden">
          {/* Subtle Green Ambient Accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-forest-200/40 rounded-full blur-3xl pointer-events-none" />

          {/* Quick Demo Credentials Pill (Visible on Login Tab) */}
          {!isForgotView && activeTab === 'login' && (
            <div className="mb-6 p-3 bg-forest-50 border border-forest-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-forest-900 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-forest-700" />
                  <span>One-Click Demo Access</span>
                </div>
                <div className="text-[11px] text-forest-700">
                  Pre-configured test farms & demo zones
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-3 py-1.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Fill Demo
              </button>
            </div>
          )}

          {/* Alert Banners */}
          {error && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex flex-col space-y-2 animate-in fade-in">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
              {error.includes('Firebase Console') && (
                <a
                  href="https://console.firebase.google.com/project/agrosenseai-d4f4d/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 font-bold text-forest-800 hover:text-forest-900 bg-white border border-forest-300 px-3 py-1.5 rounded-xl shadow-xs self-start transition hover:shadow-sm"
                >
                  <span>Open Firebase Console to Enable Google</span>
                  <ExternalLink className="w-3.5 h-3.5 text-forest-700" />
                </a>
              )}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Switchable Authentication Subviews */}
          {isForgotView ? (
            /* --- Forgot Password Subview --- */
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIsForgotView(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-bold text-base text-slate-900">Reset Your Password</h3>
              </div>

              {forgotStep === 'request' ? (
                <form onSubmit={handleForgotRequest} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter the email address registered with your AgroSense AI account. We'll generate a secure, time-limited reset token.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Registered Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="farmer@domain.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{loading ? 'Generating Token...' : 'Send Reset Link'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-500 block">Security Reset Token (Active):</span>
                    <code className="font-mono font-bold text-forest-800 truncate block mt-0.5">
                      {resetToken}
                    </code>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      New Password (min 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                  >
                    <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* --- Combined Tab View (Login vs Register) --- */
            <div>
              {/* Dual Switchable Tab Bar */}
              <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl mb-6 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-forest-800 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition duration-150 flex items-center justify-center space-x-2 cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-forest-800 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* TAB 1: LOGIN */}
              {activeTab === 'login' && (
                <div className="space-y-4">
                  {/* Primary Google Login Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-forest-600/30 hover:border-forest-600 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition flex items-center justify-center space-x-3 shadow-xs hover:shadow-sm group cursor-pointer disabled:opacity-60"
                    >
                      <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Sign In with Google</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-500 mt-1.5 font-medium">
                      Select your Google email account to access dashboard
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                      <span className="bg-white px-2.5 text-slate-400">or sign in with password</span>
                    </div>
                  </div>

                  <form className="space-y-4" onSubmit={handleLoginSubmit}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="agronomist@farm.org"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          title={showLoginPassword ? 'Hide password' : 'Show password'}
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 text-forest-700 rounded focus:ring-forest-500 accent-forest-700 cursor-pointer"
                        />
                        <span>Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotView(true);
                          setForgotEmail(loginEmail);
                        }}
                        className="font-semibold text-forest-700 hover:text-forest-800 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    {/* Sign In Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-sm transition shadow-md shadow-forest-900/10 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{loading ? 'Authenticating...' : 'Sign In with Password'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: REGISTER */}
              {activeTab === 'register' && (
                <div className="space-y-4">
                  {/* Primary Google Register Button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border-2 border-forest-600/30 hover:border-forest-600 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 transition flex items-center justify-center space-x-3 shadow-xs hover:shadow-sm group cursor-pointer disabled:opacity-60"
                    >
                      <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                      </svg>
                      <span>Sign Up with Google</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-500 mt-1.5 font-medium">
                      One-click account registration using Google
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
                      <span className="bg-white px-2.5 text-slate-400">or register with email</span>
                    </div>
                  </div>

                  <form className="space-y-3.5" onSubmit={handleRegisterSubmit}>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Dr. Ramesh Sharma"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="ramesh@krishi.res.in"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                            title={showRegPassword ? 'Hide password' : 'Show password'}
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role and Language Selectors */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Role / भूमिका
                        </label>
                        <select
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 cursor-pointer"
                        >
                          <option value="farmer">🌾 Farmer / Grower</option>
                          <option value="researcher">🔬 Researcher</option>
                          <option value="agronomist">🌱 Agronomist</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                          Language / भाषा
                        </label>
                        <select
                          value={regLanguage}
                          onChange={(e) => setRegLanguage(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-forest-600 cursor-pointer"
                        >
                          <option value="en">English (Default)</option>
                          <option value="hi">हिन्दी (Hindi)</option>
                        </select>
                      </div>
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start space-x-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 text-forest-700 rounded focus:ring-forest-500 accent-forest-700 cursor-pointer"
                        />
                        <span>
                          I agree to the{' '}
                          <Link to="/terms" target="_blank" className="font-bold text-forest-700 hover:underline">
                            Terms & Conditions
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" target="_blank" className="font-bold text-forest-700 hover:underline">
                            Privacy Policy
                          </Link>.
                        </span>
                      </label>
                    </div>

                    {/* Create Account Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 px-4 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl text-sm transition shadow-md shadow-forest-900/10 flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{loading ? 'Creating Profile...' : 'Create Account'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* Bottom Quick Return Navigation Link */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center space-x-1.5 font-bold text-slate-600 hover:text-forest-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-forest-700" />
                  <span>Previous Page</span>
                </button>
                <Link to="/" className="font-semibold text-slate-500 hover:text-forest-700 transition">
                  Back to Homepage →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          <span>Grounded in FAO-56 Agronomic Hydrology • Protected by JWT &amp; Bcrypt</span>
        </div>
      </div>
    </div>
  );
};

