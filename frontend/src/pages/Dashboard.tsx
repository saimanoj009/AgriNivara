import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CloudSun,
  Leaf,
  LogOut,
  Menu,
  ShieldCheck,
  Sprout,
  TrendingUp,
  User,
  X,
  CircleHelp,
  Send,
  Upload,
  MessageSquare,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Activity,
  Droplets,
  ThermometerSun,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createHelpRequestApi,
  fetchAlertsApi,
  fetchHelpRequestsApi,
  getAuthUser,
  logout,
  markAlertReadApi,
} from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

interface Alert {
  id: number;
  title: string;
  message: string;
  image_data?: string | null;
  created_at?: string;
  read_by_user?: number | boolean;
}

interface HelpRequest {
  id: number;
  user_id?: number;
  name?: string;
  mobile?: string;
  message?: string;
  image_data?: string | null;
  status?: string;
  admin_reply?: string | null;
  created_at?: string;
}

interface AuthUser {
  id?: string | number;
  name?: string;
  mobile?: string;
  location?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getAuthUser() as AuthUser | null;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [help, setHelp] = useState<HelpRequest[]>([]);

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [helpImage, setHelpImage] = useState<File | undefined>(undefined);

  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Selected Alert for viewing modal
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const refresh = async () => {
    try {
      setError('');
      const [alertsData, helpData] = await Promise.all([
        fetchAlertsApi(),
        fetchHelpRequestsApi(),
      ]);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setHelp(Array.isArray(helpData) ? helpData : []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to refresh dashboard.';
      setError(message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const refreshFeedback = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const unreadCount = alerts.filter(
    (alert) =>
      alert.read_by_user === 0 ||
      alert.read_by_user === false ||
      alert.read_by_user === undefined
  ).length;

  const latestHelp = help.length > 0 ? help[0] : undefined;

  const farmScore = useMemo(() => {
    const base = 88 + Math.min(6, alerts.length) - (latestHelp?.status === 'Open' ? 3 : 0);
    return Math.max(70, Math.min(98, base));
  }, [alerts.length, latestHelp?.status]);

  const submitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim() && !helpImage) {
      setError('Please enter a message or attach an image.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await createHelpRequestApi(helpMessage.trim(), helpImage);
      setHelpMessage('');
      setHelpImage(undefined);
      setHelpOpen(false);
      await refresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to send help request.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAlertRead = async (alertId: number) => {
    try {
      await markAlertReadApi(alertId);
      setAlerts((previous) =>
        previous.map((alert) =>
          alert.id === alertId ? { ...alert, read_by_user: 1 } : alert
        )
      );
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to mark alert as read.';
      setError(message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* =================================================================== */}
      {/* TOP COMMAND BAR                                                     */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/">
            <AgriLogo size="md" variant="dark" showBadge={true} />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={refreshFeedback}
            disabled={refreshing}
            title="Sync Live Farm Telemetry"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

          {/* Quick Help Modal Trigger */}
          <button
            onClick={() => setHelpOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-xs font-bold text-emerald-300 transition"
          >
            <CircleHelp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Agronomist Support</span>
          </button>

          {/* User Profile Pill */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-850 transition"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs">
              {(user?.name || 'F').charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline max-w-[100px] truncate">{user?.name || 'Farmer'}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Log out session"
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN LAYOUT (SIDEBAR + COMMAND CENTER)                              */}
      {/* =================================================================== */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between transition-transform lg:static lg:translate-x-0 lg:p-0 lg:border-none lg:bg-transparent ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-slate-800">
              <AgriLogo size="sm" variant="dark" />
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3">
                Farm Intelligence
              </span>
              
              <SidebarLink to="/dashboard" icon={Sprout} label="Command Center" active />
              <SidebarLink to="/crop-recommendation" icon={Activity} label="AI Crop Advisory" />
              <SidebarLink to="/disease-detection" icon={ShieldCheck} label="Plant Diagnostics" />
              <SidebarLink to="/weather" icon={CloudSun} label="Weather Hub" />
              <SidebarLink to="/yield-prediction" icon={TrendingUp} label="Yield Estimator" />
            </div>

            <div className="space-y-1 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3">
                Account & Operations
              </span>
              <SidebarLink to="/profile" icon={User} label="Farmer Profile" />
            </div>
          </div>

          {/* Quick Farm Status Widget in Sidebar */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/20 text-xs mt-6">
            <div className="flex items-center justify-between font-bold text-slate-300">
              <span>Farm Health Index</span>
              <span className="text-emerald-400 font-extrabold">{farmScore}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-950 mt-2 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${farmScore}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Optimal conditions across soil and climate parameters.</p>
          </div>
        </aside>

        {/* MAIN COMMAND CENTER CONTENT */}
        <main className="flex-1 space-y-7 min-w-0">
          
          {/* GREETING & HEADER BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-500/30 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles className="w-3 h-3" /> Live Farm Telemetry
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Good morning, {user?.name || 'Farmer'} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Here's what your farm in <b className="text-emerald-400">{user?.location || 'Warangal, Telangana'}</b> needs to know today.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <Link
                to="/crop-recommendation"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
              >
                <span>Run New Farm Analysis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-bold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-rose-400 hover:text-white"><X size={16} /></button>
            </div>
          )}

          {/* =================================================================== */}
          {/* HIGH LEVEL FARM INTELLIGENCE STRIP                                  */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* RECOMMENDED CROP HERO CARD */}
            <div className="md:col-span-7 p-6 rounded-3xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border border-emerald-500/40 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Primary AI Recommendation</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">🌾 RICE (PADDY)</h3>
                  <p className="text-xs text-slate-300 mt-1">Best agronomic match for current moisture and nitrogen profile.</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-emerald-400">
                    <AnimatedCounter value={94} suffix="%" />
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">AI Suitability</span>
                </div>
              </div>

              {/* Multi-factor Score Breakdown */}
              <div className="grid grid-cols-4 gap-2 mt-6 pt-4 border-t border-slate-800/80 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Soil NPK</span>
                  <b className="text-xs text-emerald-400">96% Fit</b>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Weather</span>
                  <b className="text-xs text-teal-400">92% Fit</b>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Precipitation</span>
                  <b className="text-xs text-emerald-400">89% Fit</b>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[9px] text-slate-400 uppercase block font-bold">Soil pH</span>
                  <b className="text-xs text-lime-400">6.5 (Optimal)</b>
                </div>
              </div>
            </div>

            {/* FARM HEALTH SCORE DIAL CARD */}
            <div className="md:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comprehensive Farm Health</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold">
                    HEALTHY
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-3">
                  <span className="text-4xl font-black text-white"><AnimatedCounter value={farmScore} suffix="/100" /></span>
                  <span className="text-xs font-bold text-emerald-400">+4% this week</span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Soil Chemistry & Micronutrients</span>
                  <span className="text-white font-bold">92%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full w-[92%]"></div>
                </div>

                <div className="flex justify-between text-slate-400 font-medium pt-1">
                  <span>Pathogen & Pest Resistance</span>
                  <span className="text-white font-bold">88%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div className="h-full bg-teal-400 rounded-full w-[88%]"></div>
                </div>
              </div>
            </div>

          </div>

          {/* =================================================================== */}
          {/* TODAY'S PRIORITIZED AI INSIGHT CARDS                                */}
          {/* =================================================================== */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Today's Farm Intelligence Insights
              </h3>
              <span className="text-xs text-slate-500">Prioritized by AI Decision Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Card 1: Important Alert */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase">
                    Weather Advisory
                  </span>
                  <Droplets className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-xs font-black text-white">Heavy Rain Expected in 14h</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Postpone urea top-dressing and irrigation by 24 hours to prevent fertilizer leaching.
                </p>
              </div>

              {/* Card 2: Opportunity */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase">
                    Yield Opportunity
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-xs font-black text-white">Maize Suitability Up by 8%</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Current temperature cycle is ideal for intercropping with pulses or secondary maize plot.
                </p>
              </div>

              {/* Card 3: Disease Attention */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase">
                    Pathogen Watch
                  </span>
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                </div>
                <h4 className="text-xs font-black text-white">High Humidity Fungal Risk</h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  82% humidity may promote early blight. Inspect leaf undersides using Diagnostic Vision.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* QUICK ACCESS AI TOOLS GRID                                          */}
          {/* =================================================================== */}
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-wide uppercase mb-3">
              AI Agricultural Tools Suite
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ToolCard
                to="/crop-recommendation"
                icon={Sprout}
                title="Crop Intelligence"
                desc="Multi-factor suitability analysis"
                badge="RECOMMENDER"
              />
              <ToolCard
                to="/disease-detection"
                icon={ShieldCheck}
                title="Plant Health Diagnostics"
                desc="Instant foliar vision scanning"
                badge="DIAGNOSTICS"
              />
              <ToolCard
                to="/weather"
                icon={CloudSun}
                title="Agro-Weather Hub"
                desc="Hyperlocal decision forecasts"
                badge="REALTIME"
              />
              <ToolCard
                to="/yield-prediction"
                icon={TrendingUp}
                title="Yield Estimator"
                desc="Acreage & health forecasting"
                badge="PLANNING"
              />
            </div>
          </div>

          {/* =================================================================== */}
          {/* ALERTS & HELP REQUESTS HUB                                          */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            
            {/* ALERTS SECTION */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Official Farm Advisories</h3>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30">
                    {unreadCount} UNREAD
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    No active advisories for your region. Farm is operating normally.
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setSelectedAlert(alert);
                        handleMarkAlertRead(alert.id);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        alert.read_by_user
                          ? 'bg-slate-950/40 border-slate-800/80 text-slate-400'
                          : 'bg-emerald-950/40 border-emerald-500/30 text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <b className="text-xs text-white block">{alert.title}</b>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {alert.created_at ? new Date(alert.created_at).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alert.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AGRONOMIST HELP REQUESTS */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Agronomist Help Tickets</h3>
                </div>
                <button
                  onClick={() => setHelpOpen(true)}
                  className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition"
                >
                  + New Request
                </button>
              </div>

              <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {help.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 text-xs">
                    <CircleHelp className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    No open support tickets. Need help with soil or pests? Click <b>+ New Request</b>.
                  </div>
                ) : (
                  help.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold text-slate-400">TICKET #{item.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.status === 'In Progress'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-teal-500/20 text-teal-300'
                        }`}>
                          {item.status || 'Open'}
                        </span>
                      </div>
                      <p className="text-slate-200 mt-1 font-medium">{item.message || 'Image submission'}</p>
                      {item.admin_reply && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-[11px]">
                          <b className="block text-[10px] font-black uppercase text-emerald-400">Agronomist Reply:</b>
                          {item.admin_reply}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* =================================================================== */}
      {/* HELP REQUEST SUBMISSION MODAL                                       */}
      {/* =================================================================== */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-3xl bg-slate-900 border border-emerald-500/30 p-6 sm:p-8 relative shadow-2xl animate-in zoom-in-95">
            <button
              onClick={() => setHelpOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CircleHelp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Ask AgriNivara Agronomist</h3>
                <p className="text-xs text-slate-400">Submit a query with an optional crop photo</p>
              </div>
            </div>

            <form onSubmit={submitHelp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Describe your farm issue:</label>
                <textarea
                  rows={4}
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  placeholder="e.g. Yellowing leaf spots observed on paddy crops after recent rain..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Attach Crop / Soil Image (Optional):</label>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 hover:bg-slate-950 text-xs font-bold text-slate-300 cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>{helpImage ? helpImage.name : 'Choose leaf or soil photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setHelpImage(e.target.files?.[0])}
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{busy ? 'Submitting...' : 'Send Help Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ALERT DETAIL MODAL                                                  */}
      {/* =================================================================== */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
            >
              <X size={18} />
            </button>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block mb-1">
              Official Advisory Detail
            </span>
            <h3 className="text-lg font-black text-white">{selectedAlert.title}</h3>
            <p className="text-xs text-slate-300 mt-3 leading-relaxed">{selectedAlert.message}</p>
            {selectedAlert.image_data && (
              <img
                src={selectedAlert.image_data}
                alt="Advisory visual"
                className="mt-4 max-h-56 w-full object-cover rounded-xl border border-slate-800"
              />
            )}
            <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, active = false }: { to: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
        active
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/50'
          : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
      <span>{label}</span>
    </Link>
  );
}

function ToolCard({ to, icon: Icon, title, desc, badge }: { to: string; icon: any; title: string; desc: string; badge: string }) {
  return (
    <Link
      to={to}
      className="group p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850/80 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{badge}</span>
        </div>
        <h4 className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">{title}</h4>
        <p className="text-[11px] text-slate-400 mt-1 leading-normal">{desc}</p>
      </div>
      <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Launch Tool</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    </Link>
  );
}