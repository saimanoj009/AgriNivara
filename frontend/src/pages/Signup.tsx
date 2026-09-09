import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  MapPin,
  LockKeyhole,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  Info,
  Sprout,
  ShieldCheck,
  Droplets,
} from 'lucide-react';
import { saveAuthSession, signupApi } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { UnifiedLocationSelector } from '../components/UnifiedLocationSelector';
import { FormField } from '../components/ui/FormField';
import { useToast } from '../context/ToastContext';

export default function Signup() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    location: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Password Strength Logic
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-teal-400' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-400' };
  };

  const passwordStrength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !/^\d{10}$/.test(form.mobile)) {
      setError('Please enter a valid full name and 10-digit mobile number.');
      toast.warning('Please enter a valid full name and 10-digit mobile number.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      toast.warning('Password must contain at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const auth = await signupApi(
        form.name.trim(),
        form.mobile.trim(),
        form.location.trim() || 'Warangal, Telangana',
        form.password
      );
      saveAuthSession(auth);
      setSuccess(true);
      toast.success(`Welcome to AgriNivara, ${auth.user?.name || form.name}!`, 'Account Created');

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err: any) {
      const msg = err.message || 'Unable to create farmer account.';
      setError(msg);
      toast.error(msg, 'Registration Failed');
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
          to="/login"
          className="text-xs font-bold text-[#A8B9AE] hover:text-[#F3EBDD] transition flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
        >
          Already registered? <span className="text-[#00B884] font-extrabold">Sign In →</span>
        </Link>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-white/10 bg-[#102D25] shadow-2xl shadow-black/60">
          
          {/* LEFT: Farmer Value Proposition */}
          <div className="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-[#0E2D24] via-[#0A211B] to-[#071C17] border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-[#00B884] text-[11px] font-black tracking-wider uppercase border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5 text-[#00B884]" /> Farmer Registration
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#F3EBDD] tracking-tight leading-tight">
                Empower your farm with intelligent AI.
              </h2>
              <p className="text-xs sm:text-sm text-[#A8B9AE] leading-relaxed">
                Receive personalized crop suitability advisories, leaf disease diagnostics, and weather-aware irrigation schedules tailored to your land.
              </p>
            </div>

            <div className="my-8 space-y-3">
              {[
                {
                  title: 'Soil-to-Crop Alignment',
                  desc: 'Evaluate soil chemistry against proven regional crop requirements.',
                  icon: Sprout,
                  bg: 'bg-emerald-950/60',
                  color: 'text-[#00B884]',
                },
                {
                  title: 'Water Efficiency Engine',
                  desc: 'Irrigate when your crop actually needs water, avoiding waste and runoff.',
                  icon: Droplets,
                  bg: 'bg-teal-950/60',
                  color: 'text-[#2DD4BF]',
                },
                {
                  title: 'Instant Crop Protection',
                  desc: 'Detect fungal and bacterial leaf pathogens before they spread.',
                  icon: ShieldCheck,
                  bg: 'bg-emerald-950/60',
                  color: 'text-[#00B884]',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#0A211B]/80 border border-white/10 shadow-xs">
                    <div className={`p-2 rounded-xl ${item.bg} ${item.color} border border-white/5 shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F3EBDD]">{item.title}</h4>
                      <p className="text-[11px] text-[#A8B9AE] mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/10 text-xs text-[#738A7C]">
              Free and open platform built for Indian smallholders.
            </div>
          </div>

          {/* RIGHT: Registration Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 relative">
            
            {success && (
              <div className="absolute inset-0 z-30 bg-[#0A211B]/95 rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border-2 border-[#00B884] flex items-center justify-center text-[#00B884] mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-[#F3EBDD]">Farmer Profile Created</h3>
                <p className="text-xs text-[#00B884] font-bold mt-1">Initializing Personalized Farm Intelligence...</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-black text-[#F3EBDD]">Create Your Account</h3>
              <p className="text-xs text-[#A8B9AE] mt-1">
                Enter your farm information to unlock localized agronomic insights.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <FormField
                label="Farmer Full Name"
                name="name"
                id="signup-name"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="E.g., Ramesh Kumar"
                autoComplete="name"
                icon={<User className="w-4 h-4 text-[#00B884]" />}
                required
              />

              {/* Mobile Number */}
              <FormField
                label="10-Digit Mobile Number"
                name="mobile"
                id="signup-mobile"
                type="tel"
                value={form.mobile}
                onChange={(e) => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                hint="Used for login"
                autoComplete="tel"
                icon={<Phone className="w-4 h-4 text-[#00B884]" />}
                required
              />

              {/* Farm Location */}
              <div className="space-y-1.5">
                <label htmlFor="signup-location-selector" className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block">
                  Farm District / Location
                </label>
                <UnifiedLocationSelector
                  value={form.location}
                  onChange={(val) => update('location', val)}
                  placeholder="Search village, mandal, or district..."
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <FormField
                  label="Password"
                  name="password"
                  id="signup-password"
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  icon={<LockKeyhole className="w-4 h-4 text-[#00B884]" />}
                  required
                />
                {/* Password Strength Indicator */}
                {form.password && (
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#a8b9ae]">Password Strength:</span>
                      <span className="font-semibold text-[#f3ebdd]">{passwordStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0c241e] rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-all ${
                            step <= passwordStrength.score ? passwordStrength.color : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <FormField
                label="Confirm Password"
                name="confirm"
                id="signup-confirm"
                type="password"
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
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
                className="w-full rounded-xl bg-gradient-to-r from-[#00B884] to-[#12C995] hover:brightness-110 text-slate-950 py-3.5 font-black text-sm shadow-lg shadow-emerald-950/50 transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Registering Farmer Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-[#A8B9AE]">
              Already have an AgriNivara account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#00B884] hover:text-[#12C995] underline underline-offset-4 ml-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
              >
                Sign In
              </Link>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-white/5 text-center text-xs text-[#738A7C] bg-[#0A211B]/60">
        AgriNivara • Smart India Hackathon 2026 Innovation
      </footer>

    </div>
  );
}
