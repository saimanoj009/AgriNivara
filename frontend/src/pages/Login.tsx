import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  Activity,
  CloudSun,
  Sprout,
  CheckCircle2,
  LockKeyhole,
  Info,
} from 'lucide-react';
import { loginApi, saveAuthSession } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const value = identifier.trim();
    const isAdmin = value.toLowerCase() === 'admin';

    if (!value || !password) {
      setError('Please enter your username / 10-digit mobile and password.');
      return;
    }

    if (!isAdmin && !/^\d{10}$/.test(value)) {
      setError('Enter a valid 10-digit mobile number, or use the Admin username.');
      return;
    }

    setLoading(true);
    try {
      const auth = await loginApi(value, password);
      saveAuthSession(auth);
      setLoginSuccess(true);

      // Smooth brief transition before routing
      setTimeout(() => {
        navigate(auth.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // Quick Demo Autofills for SIH Judges
  const fillDemo = (role: 'farmer' | 'admin') => {
    setError('');
    if (role === 'admin') {
      setIdentifier('Admin');
      setPassword('admin123');
    } else {
      setIdentifier('9876543210');
      setPassword('farmer123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <Link to="/" className="hover:opacity-90 transition">
          <AgriLogo size="md" variant="dark" />
        </Link>
        <Link
          to="/"
          className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          ← Back to Homepage
        </Link>
      </header>

      {/* MAIN SPLIT-SCREEN AUTH */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-slate-950/80">
          
          {/* ================================================================= */}
          {/* LEFT COLUMN: Animated Agricultural AI Neural Visualization        */}
          {/* ================================================================= */}
          <div className="lg:col-span-6 relative p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            
            {/* Ambient Lighting */}
            <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 text-[11px] font-black tracking-widest uppercase">
                <Sparkles className="w-3 h-3" /> Neural Agriculture Core
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Smarter decisions for every farm.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Log in to access your farm's real-time crop suitability, disease diagnostic vision, and climate risk advisories.
              </p>
            </div>

            {/* Visual AI Flow Chain */}
            <div className="relative z-10 my-8 space-y-3">
              {[
                { label: 'Soil Telemetry (NPK & pH)', val: '90:42:43 • pH 6.5', icon: Activity, color: 'text-amber-400' },
                { label: 'Live Agro-Weather Matrix', val: '26.8°C • 82% Humidity', icon: CloudSun, color: 'text-teal-400' },
                { label: 'Vision Pathogen Diagnostics', val: 'Zero Blight Vectors', icon: ShieldCheck, color: 'text-emerald-400' },
                { label: 'Explainable AI Decision', val: 'Rice Paddy (94.2% Fit)', icon: Sprout, color: 'text-lime-400' },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${step.color}`} />
                      <span className="text-xs font-bold text-white">{step.label}</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      {step.val}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Account Selection */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Fast Sign-In Access:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('farmer')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold transition border border-slate-700"
                >
                  🌾 Farmer Account
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-bold transition border border-slate-700"
                >
                  🛡️ Administrator
                </button>
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* RIGHT COLUMN: Minimalist Glassmorphic Authentication Form         */}
          {/* ================================================================= */}
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center bg-slate-950/90 relative">
            
            {loginSuccess && (
              <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">Authentication Verified</h3>
                <p className="text-xs text-emerald-400 font-bold mt-1">Initializing Farm Command Center...</p>
              </div>
            )}

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Welcome Back</h3>
              <p className="text-xs text-slate-400 mt-1">
                Continue your journey toward intelligent, high-yield agriculture.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-7 space-y-5">
              
              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Mobile Number / Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="10-digit mobile (e.g. 9876543210) or Admin"
                  autoComplete="username"
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
                    Password
                  </label>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  autoComplete="current-password"
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3.5 font-black text-slate-950 text-sm shadow-xl shadow-emerald-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
              New to AgriNivara?{' '}
              <Link
                to="/signup"
                className="font-black text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1"
              >
                Create Farmer Account
              </Link>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER STRIP */}
      <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        AgriNivara • Secured AI Agriculture Decision Support Platform
      </footer>

    </div>
  );
}
