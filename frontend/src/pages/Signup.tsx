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
  Activity,
  Layers,
} from 'lucide-react';
import { saveAuthSession, signupApi } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';

export default function Signup() {
  const navigate = useNavigate();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !/^\d{10}$/.test(form.mobile)) {
      setError('Please enter a valid full name and 10-digit mobile number.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const auth = await signupApi(
        form.name.trim(),
        form.mobile.trim(),
        form.location.trim() || 'India',
        form.password
      );
      saveAuthSession(auth);
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Unable to create farmer account.');
      setLoading(false);
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
          to="/login"
          className="text-xs font-bold text-slate-400 hover:text-emerald-400 transition"
        >
          Already registered? <span className="text-emerald-400 font-extrabold">Sign In →</span>
        </Link>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl shadow-slate-950/80">
          
          {/* LEFT: Startup Onboarding & Value Proposition */}
          <div className="lg:col-span-5 relative p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-emerald-950/90 via-slate-900/95 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-400/30 text-emerald-300 text-[11px] font-black tracking-widest uppercase">
                <Sparkles className="w-3 h-3" /> Farmer Onboarding
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Unlock High-Precision Farm Intelligence
              </h2>
              <p className="text-xs text-slate-300">
                Join thousands of forward-thinking farmers optimizing their yield with AgriNivara's explainable AI models.
              </p>
            </div>

            <div className="my-8 space-y-4">
              {[
                { title: 'Personalized Crop Analysis', desc: 'Customized recommendations based on your local soil and climate.', icon: Sprout },
                { title: 'Early Disease Detection', desc: 'Instant diagnosis and biological treatments via smartphone photo.', icon: ShieldCheck },
                { title: 'Hyperlocal Meteorological Alerts', desc: 'Avoid nutrient runoff with real-time irrigation advisories.', icon: Activity },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">{item.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300">
              <b>Privacy Guarantee:</b> Your farm telemetry and geolocation data remain 100% private to your account.
            </div>
          </div>

          {/* RIGHT: Onboarding Form */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-950/90 relative">
            
            {success && (
              <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-4 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">Farmer Account Created!</h3>
                <p className="text-xs text-emerald-400 font-bold mt-1">Preparing your personalized Command Center...</p>
              </div>
            )}

            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">Create Farmer Account</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your details to configure your AI agricultural workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              {/* Mobile Number & Location Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.mobile}
                    onChange={(e) => update('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    Farm Location / District
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => update('location', e.target.value)}
                    placeholder="e.g. Warangal, Telangana"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              {/* Password & Confirm Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
                    Create Password
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Min 6 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <LockKeyhole className="w-3.5 h-3.5 text-emerald-400" />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => update('confirm', e.target.value)}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3.5 font-black text-slate-950 text-sm shadow-xl shadow-emerald-500/20 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Farm Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Enter Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-black text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1"
              >
                Log In
              </Link>
            </div>

          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-4 border-t border-slate-800 text-center text-xs text-slate-500">
        AgriNivara • Secured AI Agriculture Decision Support Platform
      </footer>
    </div>
  );
}
