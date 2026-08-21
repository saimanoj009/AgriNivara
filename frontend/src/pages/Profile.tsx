import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  Calendar,
  Layers,
  Sprout,
  CheckCircle2,
} from 'lucide-react';
import { getAuthUser, logout } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';

export default function Profile() {
  const navigate = useNavigate();
  const user = getAuthUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-slate-800 transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <AgriLogo size="sm" variant="dark" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold border border-rose-900/60 transition cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* PROFILE HEADER CARD */}
        <GlassCard variant="emerald" className="p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center text-3xl font-black shadow-2xl shadow-emerald-500/40">
              {(user?.name || 'F').charAt(0).toUpperCase()}
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                <ShieldCheck size={12} /> Verified Farm Owner
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name || 'Farmer'}</h1>
              <p className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
                <MapPin size={14} className="text-emerald-400" />
                {user?.location || 'Warangal, Telangana'}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard icon={User} title="Full Name" value={user?.name || '—'} />
          <InfoCard icon={Phone} title="Registered Mobile" value={user?.mobile || '—'} />
          <InfoCard icon={MapPin} title="Farm Location / District" value={user?.location || 'India'} />
          <InfoCard icon={Sprout} title="Account Classification" value="Direct Agricultural Producer" />
        </div>

        {/* TELEMETRY PREFERENCES */}
        <GlassCard variant="dark" className="p-6 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            Platform Configuration & Preferences
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <b className="text-white block">Hyperlocal Weather Telemetry</b>
                <span className="text-slate-400 text-[11px]">Realtime Open-Meteo satellite synoptic sync</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">ENABLED</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <b className="text-white block">Explainable AI (XAI) Transparency Layer</b>
                <span className="text-slate-400 text-[11px]">Mathematical feature bound validation</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div>
                <b className="text-white block">Multilingual Voice Synthesis</b>
                <span className="text-slate-400 text-[11px]">English, Telugu (తెలుగు), Hindi (हिन्दी)</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">READY</span>
            </div>
          </div>
        </GlassCard>

      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value }: { icon: any; title: string; value: string }) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3.5">
      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{title}</span>
        <p className="text-sm font-black text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}
