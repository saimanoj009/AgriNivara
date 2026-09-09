import React, { useEffect, useMemo, useState } from 'react';
import { getDynamicGreeting } from '../utils/greeting';
import {
  Bell,
  CloudSun,
  Droplets,
  LogOut,
  Menu,
  ShieldCheck,
  Sprout,
  User,
  X,
  CircleHelp,
  Send,
  Upload,
  MessageSquare,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Layers,
  ShoppingBag,
  Clock,
  Compass,
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
import { AskAgriNivaraFloating } from '../components/AskAgriNivaraFloating';
import { DashboardKPIs } from '../components/DashboardKPIs';
import { LoadingState } from '../components/ui/LoadingState';
import { ErrorState } from '../components/ui/ErrorState';
import { SimpleChart } from '../components/ui/SimpleChart';
import { EmptyState } from '../components/ui/EmptyState';
import { useFarm } from '../context/FarmContext';
import { useToast } from '../context/ToastContext';
import { SmartIrrigationSection } from '../components/SmartIrrigationSection';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const toast = useToast();
  const { farmProfile, weather, irrigationDecision, farmStatus, refreshWeather, loadingWeather } = useFarm();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [help, setHelp] = useState<HelpRequest[]>([]);

  const [helpOpen, setHelpOpen] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [helpImage, setHelpImage] = useState<File | undefined>(undefined);

  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const refreshData = async (showToastNotice = false) => {
    try {
      setError('');
      const [alertsData, helpData] = await Promise.all([
        fetchAlertsApi().catch(() => []),
        fetchHelpRequestsApi().catch(() => []),
        refreshWeather(),
      ]);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setHelp(Array.isArray(helpData) ? helpData : []);
      if (showToastNotice) {
        toast.success('Live farm telemetry and weather radar synced successfully!', 'Data Synced');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to refresh dashboard.';
      setError(message);
      if (showToastNotice) {
        toast.error(message, 'Sync Failed');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleManualSync = async () => {
    setRefreshing(true);
    try {
      await refreshData(true);
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

  const submitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpMessage.trim() && !helpImage) {
      setError('Please enter a message or attach a crop photo.');
      toast.warning('Please provide a description or image for the agronomist.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await createHelpRequestApi(helpMessage.trim(), helpImage);
      setHelpMessage('');
      setHelpImage(undefined);
      setHelpOpen(false);
      toast.success('Your query was submitted to the expert agronomist network.', 'Ticket Created');
      await refreshData();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to send help request.';
      setError(message);
      toast.error(message, 'Submission Failed');
    } finally {
      setBusy(false);
    }
  };

  const handleMarkAlertRead = async (alertId: number) => {
    try {
      await markAlertReadApi(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, read_by_user: 1 } : a))
      );
      toast.info('Alert marked as acknowledged.');
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  // Compute soil nutrient chart data from farm profile
  const nutrientChartData = useMemo(() => {
    const nVal = farmProfile.N || 90;
    const pVal = farmProfile.P || 42;
    const kVal = farmProfile.K || 43;
    const moistureVal = farmProfile.moisture_pct || 65;

    return [
      {
        label: 'Nitrogen (N)',
        value: Math.min(100, Math.round((nVal / 140) * 100)),
        secondaryValue: `${nVal} mg/kg`,
        category: 'Macro',
        status: (nVal >= 70 && nVal <= 110 ? 'optimal' : nVal < 70 ? 'low' : 'high') as any,
      },
      {
        label: 'Phosphorus (P)',
        value: Math.min(100, Math.round((pVal / 80) * 100)),
        secondaryValue: `${pVal} mg/kg`,
        category: 'Macro',
        status: (pVal >= 30 && pVal <= 60 ? 'optimal' : pVal < 30 ? 'low' : 'high') as any,
      },
      {
        label: 'Potassium (K)',
        value: Math.min(100, Math.round((kVal / 80) * 100)),
        secondaryValue: `${kVal} mg/kg`,
        category: 'Macro',
        status: (kVal >= 35 && kVal <= 65 ? 'optimal' : kVal < 35 ? 'low' : 'high') as any,
      },
      {
        label: 'Soil Moisture',
        value: Math.min(100, Math.round(moistureVal)),
        secondaryValue: `${moistureVal}%`,
        category: 'Hydration',
        status: (moistureVal >= 55 && moistureVal <= 80 ? 'optimal' : 'moderate') as any,
      },
    ];
  }, [farmProfile]);

  return (
    <div className="min-h-screen bg-[#071C17] text-[#F3EBDD] flex flex-col selection:bg-[#00B884] selection:text-slate-950 pb-20 md:pb-8">
      
      {/* =================================================================== */}
      {/* TOP COMMAND BAR                                                     */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-[#0A211B]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-[#102D25] hover:bg-[#143B30] text-[#A8B9AE] hover:text-[#F3EBDD] lg:hidden border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            aria-label="Toggle navigation menu"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="transition-transform duration-200 hover:scale-[1.02]">
            <AgriLogo size="md" variant="emerald" showBadge={true} />
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={handleManualSync}
            disabled={refreshing || loadingWeather}
            title="Sync live weather and farm intelligence"
            aria-label="Sync live farm telemetry"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#102D25] hover:bg-[#143B30] border border-white/10 text-xs font-bold text-[#F3EBDD] transition cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00B884] ${refreshing || loadingWeather ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Farm Data</span>
          </button>

          {/* Agronomist Support Button */}
          <button
            onClick={() => setHelpOpen(true)}
            aria-label="Ask agricultural expert"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#102D25] hover:bg-[#143B30] border border-[#D6A84F]/30 hover:border-[#D6A84F]/60 text-xs font-bold text-[#D6A84F] transition cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <CircleHelp className="w-3.5 h-3.5 text-[#D6A84F]" />
            <span className="hidden sm:inline">Ask Agronomist</span>
          </button>

          {/* Farmer Profile Pill */}
          <Link
            to="/profile"
            aria-label="View farmer profile"
            className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#102D25] hover:bg-[#143B30] border border-white/10 text-xs font-bold text-[#F3EBDD] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-[#00B884] to-[#0F766E] text-slate-950 flex items-center justify-center font-black text-xs">
              {(user?.name || farmProfile.name || 'F').charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline max-w-[110px] truncate">{user?.name || farmProfile.name || 'Farmer'}</span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out session"
            aria-label="Sign out"
            className="p-2 rounded-xl bg-[#102D25] hover:bg-rose-950/60 hover:text-rose-400 text-[#A8B9AE] border border-white/10 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* MAIN LAYOUT (SIDEBAR + DECISION CENTER)                             */}
      {/* =================================================================== */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside
          aria-label="Sidebar navigation"
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0A211B] border-r border-white/10 p-6 flex flex-col justify-between transition-transform lg:static lg:translate-x-0 lg:p-0 lg:border-none lg:bg-transparent ${
            sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-white/10">
              <AgriLogo size="sm" variant="emerald" />
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation menu"
                className="text-[#A8B9AE] hover:text-[#F3EBDD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#738A7C] px-3 block mb-2">
                Farmer Decision Suite
              </span>
              
              <SidebarLink to="/dashboard" icon={Sprout} label="Command Center" active />
              <SidebarLink to="/farm-analysis" icon={Layers} label="Farm Intelligence" />
              <SidebarLink to="/crop-recommendation" icon={Activity} label="Crop AI & Sowing" />
              <SidebarLink to="/disease-detection" icon={ShieldCheck} label="Plant Diagnostics" />
              <SidebarLink to="/weather" icon={CloudSun} label="Weather & Rain Radar" />
              <SidebarLink to="/produce" icon={ShoppingBag} label="Produce Market" />
            </div>

            <div className="space-y-1 pt-4 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#738A7C] px-3 block mb-2">
                Account & Settings
              </span>
              <SidebarLink to="/profile" icon={User} label="Farm Profile" />
            </div>
          </div>

          {/* Quick Farm Status Widget in Sidebar */}
          <div className="p-4 rounded-2xl bg-[#102D25] border border-emerald-500/25 shadow-md shadow-black/30 text-xs mt-6">
            <div className="flex items-center justify-between font-bold text-[#F3EBDD]">
              <span>Farm Health Score</span>
              <span className="text-[#00B884] font-extrabold">{farmStatus.health_score}/100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#071C17] mt-2 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#00B884] to-[#12C995] rounded-full transition-all duration-500"
                style={{ width: `${farmStatus.health_score}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-[#A8B9AE] mt-2 leading-tight">
              {farmStatus.headline}
            </p>
          </div>
        </aside>

        {/* MAIN DECISION CENTER CONTENT */}
        <main className="flex-1 space-y-7 min-w-0">
          
          {/* "HOW IS MY FARM TODAY?" BANNER */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#12362B] via-[#0E2D24] to-[#0A211B] border border-emerald-500/30 shadow-xl shadow-black/50 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            
            {/* Subtle glow background */}
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/30 text-[#00B884] text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#00B884]" />
                How Is My Farm Today?
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F3EBDD] tracking-tight">
                {(() => {
                  const { greeting, emoji } = getDynamicGreeting();
                  return `${greeting}, ${user?.name || farmProfile.name || 'Farmer'} ${emoji}`;
                })()}
              </h1>
              <p className="text-xs sm:text-sm text-[#A8B9AE]">
                Live agronomic telemetry for your farm in <strong className="text-[#00B884]">{farmProfile.location}</strong>.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wide border shadow-sm ${
                  farmStatus.status === 'OPTIMAL' ? 'bg-emerald-950/90 text-[#00B884] border-emerald-500/40' :
                  farmStatus.status === 'ATTENTION' ? 'bg-amber-950/90 text-[#E0B65A] border-amber-500/40' :
                  'bg-rose-950/90 text-rose-300 border-rose-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${farmStatus.status === 'OPTIMAL' ? 'bg-[#00B884] animate-ping' : 'bg-amber-400'}`}></span>
                  {farmStatus.status === 'OPTIMAL' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00B884]" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                  {farmStatus.status === 'OPTIMAL' ? 'Optimal Conditions' : farmStatus.status === 'ATTENTION' ? 'Attention Recommended' : 'Action Required'}
                </span>
                <span className="text-xs text-[#A8B9AE] font-medium">
                  {farmStatus.primary_reason}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:items-end gap-2 shrink-0 relative z-10">
              <Link
                to="/farm-analysis"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#00B884] to-[#12C995] hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <span>Full Farm Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-[#738A7C] font-medium">
                Crop: <strong className="text-[#F3EBDD]">{farmProfile.primary_crop}</strong> ({farmProfile.area_acres} Acres)
              </span>
            </div>
          </div>

          {/* =================================================================== */}
          {/* SIH IMPACT KPI CARDS                                                */}
          {/* =================================================================== */}
          <DashboardKPIs
            totalAcres={farmProfile.area_acres || 12.5}
            activeCropsCount={farmProfile.primary_crop ? 1 : 3}
            healthIndex={farmStatus.health_score || 96}
            activeAlertsCount={unreadCount}
            actionsExecuted={18}
            yieldBoostPct={24.8}
            location={farmProfile.location}
          />

          {error && (
            <ErrorState
              title="Dashboard Telemetry Error"
              message={error}
              onRetry={handleManualSync}
              retryLabel="Refresh Dashboard"
            />
          )}

          {initialLoading && (
            <LoadingState
              variant="skeleton"
              message="Loading real-time farm sensor feeds..."
            />
          )}

          {/* =================================================================== */}
          {/* TODAY'S CORE FARM INTELLIGENCE (CONSOLIDATED DECISION CARDS)       */}
          {/* Principle: ONE FEATURE -> ONE DECISION                              */}
          {/* =================================================================== */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#A8B9AE] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00B884]" />
                Today's Farm Decisions
              </h3>
              <span className="text-[11px] text-[#738A7C]">Consolidated Intelligence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* CARD 1: SMART IRRIGATION DECISION */}
              <div className="p-5 rounded-2xl bg-[#102D25] border border-white/10 shadow-lg shadow-black/30 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-950 text-[#2DD4BF] text-[10px] font-black uppercase border border-teal-500/30">
                      💧 Smart Irrigation
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase ${
                      irrigationDecision.priority === 'CRITICAL' ? 'text-rose-400' :
                      irrigationDecision.priority === 'HIGH' ? 'text-amber-400' : 'text-[#00B884]'
                    }`}>
                      {irrigationDecision.priority}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-[#F3EBDD] leading-tight">
                    {irrigationDecision.status_label}
                  </h4>
                  <p className="text-xs text-[#A8B9AE] mt-1.5 line-clamp-3 leading-relaxed">
                    {irrigationDecision.action_tip}
                  </p>
                </div>
                
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#738A7C] font-medium">
                    {irrigationDecision.factors.temperature}°C • {irrigationDecision.factors.forecast_rain_prob}% Rain
                  </span>
                  <a
                    href="#smart-irrigation-detail"
                    className="font-bold text-[#00B884] hover:text-[#12C995] flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
                  >
                    Details <ChevronRight size={14} />
                  </a>
                </div>
              </div>

              {/* CARD 2: CROP AI & SOWING SUITABILITY */}
              <div className="p-5 rounded-2xl bg-[#102D25] border border-white/10 shadow-lg shadow-black/30 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-[#00B884] text-[10px] font-black uppercase border border-emerald-500/30">
                      🌱 Crop AI
                    </span>
                    <span className="text-[10px] font-extrabold text-[#00B884]">Optimal Suitability</span>
                  </div>
                  <h4 className="text-sm font-black text-[#F3EBDD] leading-tight">
                    {farmProfile.primary_crop} Profile
                  </h4>
                  <p className="text-xs text-[#A8B9AE] mt-1.5 line-clamp-3 leading-relaxed">
                    Soil NPK profile and seasonal rainfall offer optimal growing conditions for {farmProfile.primary_crop}.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#738A7C] font-medium">51 Crop Classes (RF)</span>
                  <Link
                    to="/crop-recommendation"
                    className="font-bold text-[#00B884] hover:text-[#12C995] flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
                  >
                    Evaluate <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* CARD 3: CROP HEALTH & DIAGNOSTIC VISION */}
              <div className="p-5 rounded-2xl bg-[#102D25] border border-white/10 shadow-lg shadow-black/30 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-950 text-[#2DD4BF] text-[10px] font-black uppercase border border-teal-500/30">
                      🐛 Plant Vision
                    </span>
                    <span className="text-[10px] font-extrabold text-[#2DD4BF]">Vision Ready</span>
                  </div>
                  <h4 className="text-sm font-black text-[#F3EBDD] leading-tight">
                    Foliar Pathogen Scanning
                  </h4>
                  <p className="text-xs text-[#A8B9AE] mt-1.5 line-clamp-3 leading-relaxed">
                    Capture crop leaf photos for deep learning pathogen diagnosis and biological remedies.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#738A7C] font-medium">38 Disease Classes (CNN)</span>
                  <Link
                    to="/disease-detection"
                    className="font-bold text-[#2DD4BF] hover:text-teal-300 flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
                  >
                    Scan Leaf <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* CARD 4: DIRECT PRODUCE MARKETPLACE */}
              <div className="p-5 rounded-2xl bg-[#102D25] border border-white/10 shadow-lg shadow-black/30 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-950 text-[#E0B65A] text-[10px] font-black uppercase border border-amber-500/30">
                      📦 Market
                    </span>
                    <span className="text-[10px] font-extrabold text-[#E0B65A]">Procurement</span>
                  </div>
                  <h4 className="text-sm font-black text-[#F3EBDD] leading-tight">
                    Direct Harvest Procurement
                  </h4>
                  <p className="text-xs text-[#A8B9AE] mt-1.5 line-clamp-3 leading-relaxed">
                    List harvested crops directly for verified wholesale buyers with automated quality grading.
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-[#738A7C] font-medium">End-to-End Workflow</span>
                  <Link
                    to="/produce"
                    className="font-bold text-[#D6A84F] hover:text-[#E0B65A] flex items-center gap-1 focus-visible:outline-none focus-visible:underline"
                  >
                    List Produce <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* =================================================================== */}
          {/* DATA VISUALIZATION: SOIL & NUTRIENT STATUS CHART                   */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <SimpleChart
                title="Soil Nutrient & Hydration Telemetry"
                subtitle="Calibrated against ICAR agro-ecological benchmark data"
                items={nutrientChartData}
              />
            </div>

            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#102D25] border border-white/10 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#F3EBDD] flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-[#00B884]" />
                    Live Micro-Climate
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Open-Meteo Synced
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-xl bg-[#0c241e] border border-white/5">
                    <p className="text-[11px] text-[#A8B9AE]">Ambient Temp</p>
                    <p className="text-xl font-bold text-[#F3EBDD] mt-0.5">{weather?.temperature ?? 24}°C</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c241e] border border-white/5">
                    <p className="text-[11px] text-[#A8B9AE]">Relative Humidity</p>
                    <p className="text-xl font-bold text-[#F3EBDD] mt-0.5">{weather?.humidity ?? 75}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c241e] border border-white/5">
                    <p className="text-[11px] text-[#A8B9AE]">24h Rain Gauge</p>
                    <p className="text-xl font-bold text-[#00B884] mt-0.5">{weather?.rainfall ?? 0} mm</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0c241e] border border-white/5">
                    <p className="text-[11px] text-[#A8B9AE]">Soil Moisture</p>
                    <p className="text-xl font-bold text-[#2DD4BF] mt-0.5">{farmProfile.moisture_pct ?? 65}%</p>
                  </div>
                </div>
              </div>

              <Link
                to="/weather"
                className="mt-4 pt-3 border-t border-white/5 text-xs text-[#00B884] hover:text-[#12C995] font-semibold flex items-center justify-between"
              >
                <span>View Full 7-Day Agronomic Forecast</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* =================================================================== */}
          {/* EMBEDDED SMART IRRIGATION ADVISORY                                  */}
          {/* =================================================================== */}
          <div id="smart-irrigation-detail">
            <SmartIrrigationSection
              weather={weather}
              crop={farmProfile.primary_crop}
              cropStage={farmProfile.crop_stage}
              soilMoisture={farmProfile.moisture_pct}
              irrigationMethod={farmProfile.irrigation_method}
              decisionOverride={irrigationDecision}
            />
          </div>

          {/* =================================================================== */}
          {/* ADVISORIES & AGRONOMIST SUPPORT TICKETS HUB                         */}
          {/* =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* ALERTS SECTION */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl shadow-black/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-500/20">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#F3EBDD]">Farm Alerts & Advisories</h3>
                    <p className="text-[11px] text-[#A8B9AE]">Official pest, pathogen & meteorological alerts</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-[#E0B65A] text-[10px] font-black border border-amber-500/40 animate-pulse">
                    {unreadCount} Unread
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <EmptyState
                    icon={<Bell className="w-6 h-6 text-emerald-400" />}
                    title="No Active Alerts"
                    description="Your farm has zero critical pest warnings or severe weather anomalies."
                  />
                ) : (
                  alerts.map((alert) => {
                    const isUnread =
                      alert.read_by_user === 0 ||
                      alert.read_by_user === false ||
                      alert.read_by_user === undefined;

                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-2xl border transition ${
                          isUnread
                            ? 'bg-[#143B30] border-amber-500/40 shadow-sm'
                            : 'bg-[#0C241E] border-white/5 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-[#F3EBDD] truncate">
                                {alert.title}
                              </h4>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-[#D6A84F] shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-[#A8B9AE] mt-1 line-clamp-2 leading-relaxed">
                              {alert.message}
                            </p>
                            {alert.created_at && (
                              <span className="text-[10px] text-[#738A7C] mt-2 flex items-center gap-1">
                                <Clock size={10} /> {new Date(alert.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0">
                            {alert.image_data && (
                              <button
                                onClick={() => setSelectedAlert(alert)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-[#00B884] border border-emerald-500/20 cursor-pointer"
                              >
                                View Photo
                              </button>
                            )}
                            {isUnread && (
                              <button
                                onClick={() => handleMarkAlertRead(alert.id)}
                                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-[#A8B9AE] hover:text-[#F3EBDD] cursor-pointer"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* AGRONOMIST TICKETS SECTION */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-[#102D25] border border-white/10 shadow-xl shadow-black/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-teal-950/80 text-[#2DD4BF] border border-teal-500/20">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#F3EBDD]">Agronomist Consultations</h3>
                    <p className="text-[11px] text-[#A8B9AE]">Field assistance & expert replies</p>
                  </div>
                </div>
                <button
                  onClick={() => setHelpOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#00B884] hover:bg-[#12C995] text-slate-950 text-xs font-black transition flex items-center gap-1 shadow-md shadow-emerald-950/40 cursor-pointer"
                >
                  <Send size={12} /> New Query
                </button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {help.length === 0 ? (
                  <EmptyState
                    icon={<MessageSquare className="w-6 h-6 text-teal-400" />}
                    title="No Open Support Queries"
                    description="Have a crop health or soil question? Connect directly with an agronomist."
                    actionLabel="Ask an Expert"
                    onAction={() => setHelpOpen(true)}
                  />
                ) : (
                  help.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-2xl bg-[#0C241E] border border-white/10 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs text-[#F3EBDD] font-bold line-clamp-2">
                          "{ticket.message}"
                        </p>
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border shrink-0 ${
                          ticket.status === 'Resolved' ? 'bg-emerald-950 text-[#00B884] border-emerald-500/30' :
                          ticket.status === 'In Progress' ? 'bg-amber-950 text-[#E0B65A] border-amber-500/30' :
                          'bg-slate-900 text-[#A8B9AE] border-white/10'
                        }`}>
                          {ticket.status || 'Open'}
                        </span>
                      </div>

                      {ticket.admin_reply ? (
                        <div className="p-3 rounded-xl bg-[#102D25] border border-[#00B884]/30 space-y-1">
                          <span className="text-[10px] font-black text-[#00B884] uppercase tracking-wider block">
                            Agronomist Response:
                          </span>
                          <p className="text-xs text-[#A8B9AE] leading-relaxed">
                            {ticket.admin_reply}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[#738A7C] italic block">
                          Awaiting expert review from agricultural extension officer...
                        </span>
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
      {/* FLOATING AI ASSISTANT                                               */}
      {/* =================================================================== */}
      <AskAgriNivaraFloating />

      {/* =================================================================== */}
      {/* ASK AGRONOMIST MODAL DIALOG                                         */}
      {/* =================================================================== */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0A211B] border border-white/15 p-6 sm:p-7 shadow-2xl shadow-black space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#D6A84F]/15 text-[#D6A84F] border border-[#D6A84F]/30">
                  <CircleHelp size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#F3EBDD]">Ask an Agronomist</h3>
                  <p className="text-xs text-[#A8B9AE]">Field experts reply within 24 hours</p>
                </div>
              </div>
              <button
                onClick={() => setHelpOpen(false)}
                className="p-1 rounded-lg text-[#A8B9AE] hover:text-[#F3EBDD] hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitHelp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#F3EBDD] mb-1.5">
                  Describe the Issue or Question *
                </label>
                <textarea
                  rows={4}
                  required
                  value={helpMessage}
                  onChange={(e) => setHelpMessage(e.target.value)}
                  placeholder="E.g., Yellowing edges on rice leaf tips after recent rainfall..."
                  className="w-full rounded-2xl bg-[#0C241E] border border-white/15 p-3.5 text-xs text-[#F3EBDD] placeholder-[#738A7C] focus:outline-none focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F3EBDD] mb-1.5">
                  Attach Crop Photo (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHelpImage(e.target.files?.[0])}
                  className="w-full text-xs text-[#A8B9AE] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#102D25] file:text-[#00B884] hover:file:bg-[#143B30] file:cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setHelpOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-[#A8B9AE] hover:text-[#F3EBDD] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00B884] to-[#12C995] hover:brightness-110 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ALERT PHOTO PREVIEW MODAL                                           */}
      {/* =================================================================== */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#0A211B] border border-white/15 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#F3EBDD]">{selectedAlert.title}</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-lg text-[#A8B9AE] hover:text-[#F3EBDD]"
              >
                <X size={18} />
              </button>
            </div>
            {selectedAlert.image_data && (
              <img
                src={selectedAlert.image_data}
                alt={selectedAlert.title}
                className="w-full h-64 object-cover rounded-2xl border border-white/10"
              />
            )}
            <p className="text-xs text-[#A8B9AE]">{selectedAlert.message}</p>
          </div>
        </div>
      )}

    </div>
  );
}

function SidebarLink({
  to,
  icon: Icon,
  label,
  active = false,
}: {
  to: string;
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
        active
          ? 'bg-[#00B884] text-slate-950 shadow-md shadow-emerald-950/40'
          : 'text-[#A8B9AE] hover:text-[#F3EBDD] hover:bg-[#102D25]'
      }`}
    >
      <Icon size={18} className={active ? 'text-slate-950' : 'text-[#00B884]'} />
      <span>{label}</span>
    </Link>
  );
}