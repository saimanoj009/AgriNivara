import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  LogOut,
  Bell,
  CircleHelp,
  Send,
  Image as ImageIcon,
  LayoutDashboard,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  BarChart3,
  MapPin,
  Filter,
  PackageCheck,
} from 'lucide-react';


import {
  fetchAdminStatsApi,
  fetchFarmersApi,
  fetchHelpRequestsApi,
  fetchAlertsApi,
  fetchAdminProduceApi,
  updateProduceStatusApi,
  logout,
  sendAdminAlertApi,
  updateHelpRequestApi,
  resetFarmerPasswordApi,
} from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [helps, setHelps] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [produceList, setProduceList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'produce' | 'farmers' | 'tickets' | 'alerts' | 'timeline'>('analytics');
  const [produceStatusReply, setProduceStatusReply] = useState<Record<number, string>>({});
  const [produceImageErrors, setProduceImageErrors] = useState<Record<number, boolean>>({});
  const [produceImageSrcMap, setProduceImageSrcMap] = useState<Record<number, string>>({});

  const getProducePhotoSrc = (p: any): string | null => {
    if (produceImageErrors[p.id]) return null;
    if (produceImageSrcMap[p.id]) return produceImageSrcMap[p.id];
    if (!p.photo_data || typeof p.photo_data !== 'string') return null;
    const trimmed = p.photo_data.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return trimmed;
    }
    return `data:image/jpeg;base64,${trimmed}`;
  };

  const handleProduceImageError = (p: any) => {
    const currentSrc = produceImageSrcMap[p.id] || (p.photo_data ? `data:image/jpeg;base64,${p.photo_data}` : '');
    if (currentSrc && currentSrc.includes('data:image/jpeg;base64,')) {
      setProduceImageSrcMap((prev) => ({ ...prev, [p.id]: currentSrc.replace('data:image/jpeg;', 'data:image/png;') }));
    } else {
      setProduceImageErrors((prev) => ({ ...prev, [p.id]: true }));
    }
  };

  // Broadcast Alert Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'normal'>('warning');
  const [image, setImage] = useState<File | undefined>();
  const [reply, setReply] = useState<Record<number, string>>({});

  const [farmerSearch, setFarmerSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Password Reset Modal
  const [resetModal, setResetModal] = useState<{ id: number; name: string } | null>(null);
  const [resetPwd, setResetPwd] = useState('');
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showResetPwd, setShowResetPwd] = useState(false);

  const loadData = async () => {
    try {
      setError('');
      const [s, f, h, a, p] = await Promise.all([
        fetchAdminStatsApi(),
        fetchFarmersApi(),
        fetchHelpRequestsApi(),
        fetchAlertsApi(),
        fetchAdminProduceApi().catch(() => []),
      ]);
      setStats(s);
      setFarmers(Array.isArray(f) ? f : []);
      setHelps(Array.isArray(h) ? h : []);
      setAlerts(Array.isArray(a) ? a : []);
      setProduceList(Array.isArray(p) ? p : []);
    } catch (e: any) {
      setError(e.message || 'Unable to sync admin operations telemetry.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Advisory title and message are required.');
      return;
    }
    setBusy(true);
    setError('');
    setSuccessMsg('');
    try {
      const formattedTitle = severity === 'critical' ? `🚨 [CRITICAL] ${title.trim()}` : severity === 'warning' ? `⚠️ [ADVISORY] ${title.trim()}` : title.trim();
      await sendAdminAlertApi(formattedTitle, message.trim(), target, image);
      setTitle('');
      setMessage('');
      setImage(undefined);
      setSuccessMsg('Advisory dispatched successfully to registered farmers.');
      setTimeout(() => setSuccessMsg(''), 4000);
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Unable to dispatch broadcast alert.');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateTicket = async (id: number, status: string) => {
    try {
      await updateHelpRequestApi(id, status, reply[id] || '');
      await loadData();
    } catch (e: any) {
      setError(e.message || 'Unable to update support ticket.');
    }
  };

  const handleUpdateProduceStatus = async (produceId: number, newStatus: string) => {
    try {
      await updateProduceStatusApi(produceId, newStatus, produceStatusReply[produceId] || '');
      await loadData();
      setSuccessMsg(`Produce submission status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e: any) {
      setError(e.message || 'Unable to update produce status.');
    }
  };

  const handleResetPassword = async () => {
    if (!resetModal) return;
    if (resetPwd.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
    setResetBusy(true);
    setResetError('');
    try {
      const result = await resetFarmerPasswordApi(resetModal.id, resetPwd);
      setSuccessMsg(result.message || 'Password reset successfully.');
      setTimeout(() => setSuccessMsg(''), 5000);
      setResetModal(null);
      setResetPwd('');
    } catch (e: any) {
      setResetError(e.message || 'Failed to reset password.');
    } finally {
      setResetBusy(false);
    }
  };

  const filteredFarmers = farmers.filter((f) => {
    const q = farmerSearch.toLowerCase();
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.mobile && f.mobile.includes(q)) ||
      (f.location && f.location.toLowerCase().includes(q))
    );
  });

  const filteredTickets = helps.filter((h) => {
    if (ticketFilter === 'open') return !h.status || h.status === 'Open';
    if (ticketFilter === 'in_progress') return h.status === 'In Progress';
    if (ticketFilter === 'resolved') return h.status === 'Resolved';
    return true;
  });

  const openTicketsCount = helps.filter((x) => x.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-[#071C17] text-[#F3EBDD] pb-20 selection:bg-[#00B884] selection:text-[#071C17]">
      
      {/* ========================================================================= */}
      {/* 1. ENTERPRISE HEADER                                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0A211B]/90 backdrop-blur-xl border-b border-[#143B30] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <AgriLogo size="sm" />
          <div className="h-5 w-px bg-[#143B30] hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-[#F3EBDD] uppercase tracking-wider">Operations Console</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00B884]/15 text-[#00B884] border border-[#00B884]/30">
              LIVE TELEMETRY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            title="Sync operations data"
            className="p-2 rounded-xl bg-[#102D25] hover:bg-[#143B30] text-[#A8B9AE] hover:text-[#00B884] border border-[#143B30] transition cursor-pointer"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-[#00B884]' : ''} />
          </button>

          <Link
            to="/admin/farmer-view"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#102D25] hover:bg-[#143B30] text-xs font-bold text-[#00B884] border border-[#143B30] transition"
          >
            <LayoutDashboard size={14} className="text-[#00B884]" />
            <span>Farmer Portal View</span>
          </Link>

          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-bold border border-rose-800/40 transition cursor-pointer"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 2. OPS OVERVIEW BANNER                                                    */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#00B884]">
              Regional Agricultural Intelligence
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3EBDD] tracking-tight mt-1">
              Agronomy Operations & Telemetry Hub
            </h1>
            <p className="text-xs text-[#A8B9AE] mt-1">
              Real-time monitoring of registered farmers, agronomic advisory logs, disease alerts, and agronomist support tickets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A8B9AE]">System Status:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00B884]/15 text-[#00B884] text-[11px] font-bold border border-[#00B884]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00B884] animate-ping"></span>
              Operational • v2.6.0
            </span>
          </div>

        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-[#00B884]/15 border border-[#00B884]/30 text-xs text-[#00B884] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00B884] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. TOP KPI METRIC CARDS                                                   */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Users}
            title="Registered Farmers"
            value={stats?.total_users ?? farmers.length}
            trend={farmers.length > 0 ? `${farmers.length} active accounts` : 'No farmers yet'}
            isPositive={farmers.length > 0}
          />
          <MetricCard
            icon={PackageCheck}
            title="Produce Submissions"
            value={produceList.length}
            trend={produceList.length > 0 ? `${produceList.length} listed batches` : 'No submissions yet'}
            isPositive={produceList.length > 0}
          />
          <MetricCard
            icon={CircleHelp}
            title="Open Tickets"
            value={openTicketsCount}
            trend={openTicketsCount > 0 ? `${openTicketsCount} awaiting response` : 'All resolved'}
            highlight={openTicketsCount > 0}
          />
          <MetricCard
            icon={Bell}
            title="Advisories Sent"
            value={alerts.length}
            trend={alerts.length > 0 ? `${alerts.length} dispatched` : 'None yet'}
            isPositive={true}
          />
        </div>

        {/* ========================================================================= */}
        {/* 4. TAB NAVIGATION                                                         */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#143B30] pb-3">
          {[
            { id: 'analytics', label: '1. Operations Analytics', count: null },
            { id: 'produce', label: '2. Produce Procurement Workspace', count: produceList.length },
            { id: 'farmers', label: '3. Farmer Directory', count: farmers.length },
            { id: 'tickets', label: '4. Support Tickets', count: openTicketsCount, badgeAlert: openTicketsCount > 0 },
            { id: 'alerts', label: '5. Advisory Dispatcher', count: alerts.length },
            { id: 'timeline', label: '6. Activity Timeline', count: null },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-[#00B884] to-[#00956B] text-[#071C17] font-extrabold shadow-md'
                  : 'bg-[#102D25] hover:bg-[#143B30] text-[#A8B9AE] hover:text-[#F3EBDD] border border-[#143B30]'
              }`}
            >
              <span>{t.label}</span>
              {t.count !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  t.badgeAlert
                    ? 'bg-amber-500 text-[#071C17]'
                    : activeTab === t.id ? 'bg-[#071C17] text-[#00B884]' : 'bg-[#0C241E] text-[#A8B9AE]'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OPERATIONS ANALYTICS                                               */}
        {/* ========================================================================= */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* PLATFORM OVERVIEW — REAL DATA ONLY */}
            <GlassCard variant="dark" className="lg:col-span-6 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Platform Activity Overview
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">Live Data</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Registered Farmers</span>
                    <b className="text-2xl font-black text-white mt-1 block">
                      {stats?.total_users ?? farmers.length ?? '—'}
                    </b>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Open Support Tickets</span>
                    <b className="text-2xl font-black text-white mt-1 block">
                      {helps.filter(x => x.status !== 'Resolved').length}
                    </b>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Active Advisories</span>
                    <b className="text-2xl font-black text-white mt-1 block">
                      {alerts.length}
                    </b>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Resolved Tickets</span>
                    <b className="text-2xl font-black text-white mt-1 block">
                      {helps.filter(x => x.status === 'Resolved').length}
                    </b>
                  </div>
                </div>

                {farmers.length === 0 && helps.length === 0 && alerts.length === 0 && (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    <BarChart3 className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                    <p>Analytics will appear as farmers use the platform.</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* RECENT SUPPORT TICKETS SUMMARY */}
            <GlassCard variant="dark" className="lg:col-span-6 p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <CircleHelp className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Recent Support Requests
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('tickets')}
                  className="text-[10px] text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {helps.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-xs">
                  <CircleHelp className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                  <p>No support requests yet.</p>
                  <p className="text-slate-600 mt-1">Farmer queries will appear here when submitted.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {helps.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex items-start justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 gap-3">
                      <div className="flex-1 min-w-0">
                        <b className="text-xs font-bold text-white block truncate">{h.name}</b>
                        <p className="text-[11px] text-slate-400 truncate">{h.message || 'Image query submitted'}</p>
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black ${
                        h.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : h.status === 'In Progress'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-sky-500/20 text-sky-300'
                      }`}>
                        {h.status || 'Open'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PRODUCE PROCUREMENT WORKSPACE                                      */}
        {/* ========================================================================= */}
        {activeTab === 'produce' && (
          <GlassCard variant="dark" className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-emerald-400" /> Produce Procurement & Direct Purchasing
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review crop listings submitted by farmers, schedule site inspections, and manage procurement status.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                {produceList.length} Total Submissions
              </span>
            </div>

            {produceList.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <PackageCheck className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-sm font-bold text-slate-300">No Produce Submissions Yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When farmers submit their harvest yields for direct sale, listings and quality specs will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {produceList.map((p) => (
                  <div key={p.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-white">{p.crop_name}</h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-bold">
                            {p.quantity} {p.unit}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            {p.quality_grade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          <strong>Farmer:</strong> {p.farmer_name} ({p.farmer_mobile}) • <strong>Location:</strong> {p.location} • <strong>Harvest:</strong> {p.harvest_date}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 text-[10px] font-extrabold uppercase block">Expected Price</span>
                        <span className="text-xl font-black text-emerald-400">₹{p.expected_price?.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ {p.unit}</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1 text-slate-300">
                        <p><strong>Storage Condition:</strong> {p.storage_condition}</p>
                        <p><strong>Moisture %:</strong> {p.moisture_pct ? `${p.moisture_pct}%` : 'Not specified'}</p>
                        {p.notes && <p><strong>Farmer Notes:</strong> {p.notes}</p>}
                      </div>

                      {/* Status Update Action Controls */}
                      <div className="space-y-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-slate-400 uppercase text-[10px]">Procurement State:</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                            p.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : p.status === 'Purchase Approved'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : p.status === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {p.status}
                          </span>
                        </div>

                        {p.status !== 'Completed' && p.status !== 'Rejected' && (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Procurement notes or dispatch details..."
                              value={produceStatusReply[p.id] || ''}
                              onChange={(e) => setProduceStatusReply({ ...produceStatusReply, [p.id]: e.target.value })}
                              className="flex-1 rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.status === 'Submitted' || p.status === 'Under Review' || p.status === 'Site Visit Requested' || p.status === 'Site Visit Completed' ? (
                            <>
                              <button
                                onClick={() => handleUpdateProduceStatus(p.id, 'Under Review')}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition cursor-pointer"
                              >
                                Under Review
                              </button>
                              <button
                                onClick={() => handleUpdateProduceStatus(p.id, 'Site Visit Requested')}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/30 transition cursor-pointer"
                              >
                                📍 Request Visit
                              </button>
                              <button
                                onClick={() => handleUpdateProduceStatus(p.id, 'Purchase Approved')}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shadow-sm transition cursor-pointer"
                              >
                                ✓ Approve Purchase
                              </button>
                              <button
                                onClick={() => handleUpdateProduceStatus(p.id, 'Rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[11px] font-bold border border-rose-500/30 transition cursor-pointer"
                              >
                                ✕ Reject
                              </button>
                            </>
                          ) : p.status === 'Purchase Approved' ? (
                            <button
                              onClick={() => {
                                if (window.confirm(`Mark produce sale for ${p.quantity} ${p.unit} of ${p.crop_name} as COMPLETED?`)) {
                                  handleUpdateProduceStatus(p.id, 'Completed');
                                }
                              }}
                              className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 size={14} />
                              <span>Mark Transaction Completed</span>
                            </button>
                          ) : p.status === 'Completed' ? (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold py-0.5">
                              <CheckCircle2 size={14} />
                              <span>Procurement Transaction Finalized & Paid</span>
                            </div>
                          ) : (
                            <span className="text-xs text-rose-400 font-medium">Submission Closed (Rejected)</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CROP IMAGE PREVIEW */}
                    <div className="border-t border-slate-800/60 pt-3 mt-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                        📷 Crop Photo
                      </span>
                      {(() => {
                        const photoSrc = getProducePhotoSrc(p);
                        if (photoSrc) {
                          return (
                            <img
                              src={photoSrc}
                              alt={`Crop specimen - ${p.crop_name}`}
                              className="max-h-56 w-auto rounded-xl border border-slate-700 object-cover shadow-lg"
                              onError={() => handleProduceImageError(p)}
                            />
                          );
                        }
                        return (
                          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 rounded-xl p-3 border border-slate-800">
                            <span>📷</span>
                            <span>No crop image available</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FARMER DIRECTORY TABLE                                             */}
        {/* ========================================================================= */}
        {activeTab === 'farmers' && (
          <GlassCard variant="dark" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Filter by name, mobile, location..."
                  value={farmerSearch}
                  onChange={(e) => setFarmerSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                />
              </div>
              <span className="text-xs text-slate-400 font-bold">
                Showing {filteredFarmers.length} of {farmers.length} registered farmers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-slate-500 uppercase text-[10px] font-extrabold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Farmer Profile</th>
                    <th className="p-3.5">Registered Mobile</th>
                    <th className="p-3.5">Farm Region</th>
                    <th className="p-3.5">Account Status</th>
                    <th className="p-3.5">Registered Date</th>
                    <th className="p-3.5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFarmers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">
                        No farmer profiles match the specified filter query.
                      </td>
                    </tr>
                  ) : (
                    filteredFarmers.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-900/60 transition">
                        <td className="p-3.5 font-bold text-white flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">
                            {(f.name || 'F').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span>{f.name}</span>
                            <span className="text-[10px] text-slate-500 block">ID: #{f.id}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300 font-mono">{f.mobile}</td>
                        <td className="p-3.5 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-emerald-400" />
                            <span>{f.location || 'Warangal, Telangana'}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active Producer
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-500 font-medium">
                          {f.created_at ? new Date(f.created_at).toLocaleDateString() : 'Active'}
                        </td>
                        <td className="p-3.5">
                          <button
                            id={`reset-pwd-btn-${f.id}`}
                            onClick={() => { setResetModal({ id: f.id, name: f.name }); setResetPwd(''); setResetError(''); setShowResetPwd(false); }}
                            className="px-3 py-1.5 rounded-lg text-[10px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
                          >
                            Reset Password
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: AGRONOMIST SUPPORT TICKETS                                         */}
        {/* ========================================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Filter className="w-4 h-4 text-emerald-400" />
                <span>Ticket Status Filter:</span>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: 'all', label: 'All Tickets' },
                  { id: 'open', label: 'Open' },
                  { id: 'in_progress', label: 'In Review' },
                  { id: 'resolved', label: 'Resolved' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTicketFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      ticketFilter === f.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <GlassCard variant="dark" className="p-12 text-center text-slate-500 text-xs">
                <CircleHelp className="w-10 h-10 mx-auto text-slate-700 mb-2" />
                No support tickets found matching current filter.
              </GlassCard>
            ) : (
              filteredTickets.map((h) => (
                <GlassCard key={h.id} variant="dark" className="p-6 sm:p-7 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                          TICKET #{h.id}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-slate-400">
                          {h.created_at ? new Date(h.created_at).toLocaleString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white mt-0.5">
                        {h.name} • {h.mobile}
                      </h4>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-center ${
                      h.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : h.status === 'In Progress'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    }`}>
                      {h.status || 'Open'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    "{h.message || 'Crop foliar diagnostic query submitted.'}"
                  </p>

                  {h.image_data && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                        Attached Specimen Image:
                      </span>
                      <img
                        src={h.image_data}
                        alt="Farmer crop specimen"
                        className="max-h-60 rounded-xl border border-slate-800 object-cover"
                      />
                    </div>
                  )}

                  <div className="pt-2 space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Agronomist Diagnostic Response:
                    </label>
                    <textarea
                      value={reply[h.id] ?? h.admin_reply ?? ''}
                      onChange={(e) => setReply({ ...reply, [h.id]: e.target.value })}
                      placeholder="Enter verified treatment recommendations, dosage guidelines, or agronomic feedback..."
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none font-medium"
                    ></textarea>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleUpdateTicket(h.id, 'In Progress')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black transition cursor-pointer"
                      >
                        Set In Review
                      </button>
                      <button
                        onClick={() => handleUpdateTicket(h.id, 'Resolved')}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition cursor-pointer"
                      >
                        Resolve & Send Response
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ADVISORY BROADCAST DISPATCHER                                      */}
        {/* ========================================================================= */}
        {activeTab === 'alerts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <GlassCard variant="emerald" className="lg:col-span-7 p-6 sm:p-8 space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Dispatch Regional Farm Advisory
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Broadcast verified meteorological advisories, pathogen alerts, and best practice guidelines.
                </p>
              </div>

              <form onSubmit={handleSendAlert} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                      Severity Classification
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="critical">🚨 Critical Warning (Immediate Action)</option>
                      <option value="warning">⚠️ Advisory Notice (Precautionary)</option>
                      <option value="normal">ℹ️ Information & Market Update</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                      Target Farmer Audience
                    </label>
                    <select
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:border-emerald-500 outline-none"
                    >
                      <option value="all">All Registered Farms (Broadcast)</option>
                      {farmers.map((f) => (
                        <option key={f.id} value={String(f.id)}>
                          {f.name} ({f.mobile})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                    Advisory Headline
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Precipitation Alert: Delay Nitrogen Top-Dressing"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                    Advisory Description & Action Steps
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe specific field conditions, preventative sprays, or water management steps..."
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none font-medium"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block mb-1">
                    Attach Advisory Diagram / Infographic (Optional)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 cursor-pointer text-xs font-bold text-slate-400 hover:text-white">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>{image ? image.name : 'Choose Infographic / Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setImage(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{busy ? 'Dispatching Advisory...' : 'Dispatch Verified Advisory'}</span>
                </button>
              </form>
            </GlassCard>

            <GlassCard variant="dark" className="lg:col-span-5 p-6 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Recent Broadcast History
              </h3>

              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">No active advisories dispatched yet.</p>
                ) : (
                  alerts.map((a) => (
                    <div key={a.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <b className="text-white block font-bold">{a.title}</b>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{a.message}</p>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PLATFORM ACTIVITY TIMELINE                                         */}
        {/* ========================================================================= */}
        {activeTab === 'timeline' && (
          <GlassCard variant="dark" className="p-6 sm:p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider pb-3 border-b border-slate-800">
              Platform Events Stream
            </h3>

            {farmers.length === 0 && alerts.length === 0 && helps.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                <Activity className="w-10 h-10 mx-auto text-slate-700 mb-3" />
                <p className="font-bold">No activity yet.</p>
                <p className="text-slate-600 mt-1">Platform events will appear here as farmers register, generate recommendations, and submit requests.</p>
              </div>
            ) : (
              <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {alerts.slice(0, 3).map((a) => (
                  <div key={`alert-${a.id}`} className="flex items-start gap-4 relative pl-8">
                    <div className="absolute left-0 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400">
                      <Bell size={12} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <b className="text-xs font-bold text-white">{a.title}</b>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{a.message}</p>
                    </div>
                  </div>
                ))}
                {helps.slice(0, 3).map((h) => (
                  <div key={`help-${h.id}`} className="flex items-start gap-4 relative pl-8">
                    <div className="absolute left-0 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-sky-400">
                      <CircleHelp size={12} />
                    </div>
                    <div>
                      <b className="text-xs font-bold text-white">{h.name} submitted a support request</b>
                      <p className="text-xs text-slate-400 mt-0.5">{h.message || 'Image diagnostic query submitted.'}</p>
                    </div>
                  </div>
                ))}
                {farmers.slice(0, 3).map((f) => (
                  <div key={`farmer-${f.id}`} className="flex items-start gap-4 relative pl-8">
                    <div className="absolute left-0 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-emerald-400">
                      <Users size={12} />
                    </div>
                    <div>
                      <b className="text-xs font-bold text-white">{f.name} registered on the platform</b>
                      <p className="text-xs text-slate-400 mt-0.5">{f.location ? `Location: ${f.location}` : 'Farm profile created.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}


      </main>

      {/* ===================================================== */}
      {/* RESET FARMER PASSWORD MODAL                           */}
      {/* ===================================================== */}
      {resetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setResetModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-black text-white mb-1">Reset Farmer Password</h2>
            <p className="text-xs text-slate-400 mb-6">
              Resetting password for <span className="text-amber-400 font-bold">{resetModal.name}</span> (ID #{resetModal.id}).
              The farmer must log in with this new password.
            </p>

            <div className="relative mb-4">
              <input
                id="reset-pwd-input"
                type={showResetPwd ? 'text' : 'password'}
                value={resetPwd}
                onChange={(e) => { setResetPwd(e.target.value); setResetError(''); }}
                placeholder="Enter new password (min 6 chars)"
                className="w-full px-4 py-3 pr-20 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-500 focus:border-amber-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowResetPwd((v) => !v)}
                className="absolute right-3 top-3 text-[10px] font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 transition cursor-pointer"
              >
                {showResetPwd ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {resetError && (
              <p className="text-xs text-red-400 mb-4 flex items-center gap-1.5">
                <AlertTriangle size={12} /> {resetError}
              </p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                id="reset-pwd-confirm-btn"
                onClick={handleResetPassword}
                disabled={resetBusy || resetPwd.length < 6}
                className="flex-1 py-2.5 rounded-xl text-sm font-black bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-2"
              >
                {resetBusy ? <Loader2 size={14} className="animate-spin" /> : null}
                {resetBusy ? 'Resetting…' : 'Confirm Reset'}
              </button>
              <button
                onClick={() => { setResetModal(null); setResetPwd(''); setResetError(''); }}
                className="px-6 py-2.5 rounded-xl text-sm font-black bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer border border-slate-700"
              >
                Cancel
              </button>
            </div>

            <p className="text-[10px] text-slate-600 mt-4 text-center">
              The existing password is never exposed. The new password will be securely hashed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  trend,
  isPositive = true,
  highlight = false,
}: {
  icon: any;
  title: string;
  value: any;
  trend: string;
  isPositive?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`p-5 rounded-3xl border transition-all ${
      highlight
        ? 'bg-[#102D25] border-amber-500/40 text-[#F3EBDD]'
        : 'bg-[#102D25] border-[#143B30] text-[#F3EBDD]'
    } shadow-xl`}>
      <div className="flex justify-between items-start">
        <div className="p-2.5 rounded-xl bg-[#0C241E] text-[#00B884] border border-[#143B30]">
          <Icon size={20} />
        </div>
        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-[#0C241E] text-[#738A7C] border border-[#143B30]">
          TELEMETRY
        </span>
      </div>
      <div className="mt-4">
        <span className="text-[10px] font-bold text-[#738A7C] uppercase tracking-wider block">{title}</span>
        <b className="text-2xl sm:text-3xl font-extrabold text-[#F3EBDD] mt-0.5 block">
          {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
        </b>
        <span className={`text-[10px] font-bold mt-1 block ${
          highlight ? 'text-amber-400' : isPositive ? 'text-[#00B884]' : 'text-[#A8B9AE]'
        }`}>
          {trend}
        </span>

      </div>
    </div>
  );
}
