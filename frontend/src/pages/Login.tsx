import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  LockKeyhole,
  Info,
} from 'lucide-react';
import { loginApi, saveAuthSession } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { FormField } from '../components/ui/FormField';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
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
      setError('Please enter your mobile number (or username) and password.');
      toast.warning('Please enter your mobile number (or username) and password.');
      return;
    }

    if (!isAdmin && !/^\d{10}$/.test(value)) {
      setError('Enter a valid 10-digit mobile number, or the Admin username.');
      toast.warning('Enter a valid 10-digit mobile number, or the Admin username.');
      return;
    }

    setLoading(true);
    try {
      const auth = await loginApi(value, password);
      saveAuthSession(auth);
      setLoginSuccess(true);
      toast.success(`Welcome back, ${auth.user?.name || 'Farmer'}!`, 'Login Successful');

      setTimeout(() => {
        navigate(auth.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify your credentials.';
      setError(msg);
      toast.error(msg, 'Authentication Failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071C17] text-[#F3EBDD] flex flex-col justify-between selection:bg-[#00B884] selection:text-slate-950">
      
      {/* HEADER */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0A211B]/80 backdrop-blur-md sticky top-0 z-30 shadow-md">
        <Link to="/" className="hover:opacity-90 transition">
          <AgriLogo size="md" variant="emerald" />
        </Link>
        <Link
          to="/"
          className="text-xs font-bold text-[#A8B9AE] hover:text-[#F3EBDD] transition flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
        >
          ← Back to Overview
        </Link>
      </header>

      {/* MAIN AUTHENTICATION CARD */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full rounded-3xl border border-white/10 bg-[#102D25] shadow-2xl shadow-black/60 p-8 sm:p-10 relative">
          
          {loginSuccess && (
            <div className="absolute inset-0 z-30 bg-[#0A211B]/95 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-[#00B884] flex items-center justify-center text-[#00B884] mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#F3EBDD]">Authentication Verified</h3>
              <p className="text-xs text-[#00B884] font-bold mt-1">Opening Farmer Command Center...</p>
            </div>
          )}

          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <AgriLogo size="lg" variant="emerald" />
            </div>
            <h2 className="text-2xl font-black text-[#F3EBDD] tracking-tight">Farmer & Admin Login</h2>
            <p className="text-xs text-[#A8B9AE] mt-1">
              Enter your credentials to access your farm intelligence decision system.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Identifier Input */}
            <FormField
              label="Mobile Number / Username"
              name="identifier"
              id="login-identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="10-digit mobile or Admin"
              autoComplete="username"
              icon={<User className="w-4 h-4 text-[#00B884]" />}
              required
            />

            {/* Password Input */}
            <FormField
              label="Password"
              name="password"
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
              autoComplete="current-password"
              icon={<LockKeyhole className="w-4 h-4 text-[#00B884]" />}
              required
            />

            {/* Error Alert */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-semibold flex items-start gap-2"
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#00B884] to-[#12C995] hover:brightness-110 text-slate-950 py-3.5 font-black text-sm shadow-lg shadow-emerald-950/50 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-[#A8B9AE]">
            New to AgriNivara?{' '}
            <Link
              to="/signup"
              className="font-bold text-[#00B884] hover:text-[#12C995] underline underline-offset-4 ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
            >
              Create Account
            </Link>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-white/5 text-center text-xs text-[#738A7C] bg-[#0A211B]/60">
        AgriNivara • AI-Powered Farm Decision Support System
      </footer>

    </div>
  );
}
