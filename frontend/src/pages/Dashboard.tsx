import { useEffect, useMemo, useState } from 'react';
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

  /* ============================================================
     REFRESH DASHBOARD DATA
     ============================================================ */

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
      const message =
        e instanceof Error
          ? e.message
          : 'Unable to refresh dashboard.';

      setError(message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  /* ============================================================
     REFRESH FEEDBACK ONLY
     ============================================================ */

  const refreshFeedback = async () => {
    setRefreshing(true);

    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  };

  /* ============================================================
     ALERTS
     ============================================================ */

  const unread = alerts.filter(
    (alert) =>
      alert.read_by_user === 0 ||
      alert.read_by_user === false ||
      alert.read_by_user === undefined
  ).length;

  /* ============================================================
     HELP REQUESTS
     ============================================================ */

  const latestHelp = help.length > 0 ? help[0] : undefined;

  const repliedRequests = help.filter(
    (request) =>
      typeof request.admin_reply === 'string' &&
      request.admin_reply.trim().length > 0
  );

  /* ============================================================
     FARM SCORE
     ============================================================ */

  const farmScore = useMemo(() => {
    const base =
      78 +
      Math.min(12, alerts.length) -
      (latestHelp?.status === 'Open' ? 4 : 0);

    return Math.max(65, Math.min(95, base));
  }, [alerts.length, latestHelp?.status]);

  /* ============================================================
     SUBMIT HELP REQUEST
     ============================================================ */

  const submitHelp = async () => {
    if (!helpMessage.trim() && !helpImage) {
      setError('Please enter a message or attach an image.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await createHelpRequestApi(
        helpMessage.trim(),
        helpImage
      );

      setHelpMessage('');
      setHelpImage(undefined);
      setHelpOpen(false);

      await refresh();
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : 'Unable to send help request.';

      setError(message);
    } finally {
      setBusy(false);
    }
  };

  /* ============================================================
     STATUS STYLE
     ============================================================ */

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-700 border-green-200';

      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';

      case 'Open':
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  /* ============================================================
     DATE FORMAT
     ============================================================ */

  const formatDate = (date?: string) => {
    if (!date) {
      return '';
    }

    try {
      return new Date(date).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return date;
    }
  };

  /* ============================================================
     MARK ALERT READ
     ============================================================ */

  const handleMarkAlertRead = async (alertId: number) => {
    try {
      await markAlertReadApi(alertId);

      setAlerts((previous) =>
        previous.map((alert) =>
          alert.id === alertId
            ? { ...alert, read_by_user: 1 }
            : alert
        )
      );
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : 'Unable to mark alert as read.';

      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      <div className="flex min-h-screen">

        {/* ========================================================
            SIDEBAR
        ======================================================== */}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform lg:static lg:translate-x-0 ${sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            }`}
        >

          <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100">

            <div className="h-10 w-10 rounded-xl bg-green-700 text-white flex items-center justify-center">
              <Leaf />
            </div>

            <div>
              <b>AGRINIVARA</b>

              <p className="text-[9px] tracking-widest text-slate-400">
                SMART AGRICULTURE
              </p>
            </div>

          </div>

          <nav className="p-4 space-y-1">

            <p className="px-3 py-2 text-[10px] font-bold tracking-widest text-slate-400">
              FARM INTELLIGENCE
            </p>

            <Nav
              to="/dashboard"
              icon={<Sprout size={18} />}
              text="Dashboard"
              active
            />

            <Nav
              to="/crop-recommendation"
              icon={<Leaf size={18} />}
              text="Crop Recommendation"
            />

            <Nav
              to="/disease-detection"
              icon={<ShieldCheck size={18} />}
              text="Disease Detection"
            />

            <Nav
              to="/yield-prediction"
              icon={<TrendingUp size={18} />}
              text="Yield Prediction"
            />

            <Nav
              to="/weather"
              icon={<CloudSun size={18} />}
              text="Weather"
            />

            <p className="px-3 pt-7 pb-2 text-[10px] font-bold tracking-widest text-slate-400">
              ACCOUNT
            </p>

            <Nav
              to="/profile"
              icon={<User size={18} />}
              text="Profile"
            />

            <button
              onClick={() => {
                logout();
                navigate('/login', { replace: true });
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={18} />
              Logout
            </button>

          </nav>
        </aside>

        {/* ========================================================
            MAIN
        ======================================================== */}

        <main className="flex-1 min-w-0">

          {/* MOBILE HEADER */}

          <div className="lg:hidden h-16 bg-white border-b flex items-center justify-between px-5">

            <b>AGRINIVARA</b>

            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>

          </div>

          {/* DESKTOP HEADER */}

          <header className="h-20 bg-white border-b px-6 lg:px-10 flex items-center justify-between">

            <div>

              <p className="text-xs font-bold tracking-widest text-green-700">
                FARMER DASHBOARD
              </p>

              <h1 className="text-xl font-black">
                Farm Intelligence Center
              </h1>

            </div>

            <div className="flex items-center gap-4">

              <button
                className="relative p-2"
                onClick={() =>
                  document
                    .getElementById('alerts')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }
              >

                <Bell />

                {unread > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}

              </button>

              <div className="h-9 w-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <User size={18} />
              </div>

              <div className="hidden sm:block">

                <b className="text-sm">
                  {user?.name || 'Farmer'}
                </b>

                <p className="text-xs text-slate-400">
                  Farm Owner
                </p>

              </div>

            </div>

          </header>

          <div className="p-5 lg:p-10 max-w-7xl mx-auto">

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* ====================================================
                WELCOME
            ==================================================== */}

            <div className="rounded-3xl bg-gradient-to-r from-green-900 to-emerald-700 text-white p-7 lg:p-9 shadow-lg">

              <p className="text-green-200 text-xs font-bold tracking-widest">
                WELCOME BACK
              </p>

              <h2 className="mt-2 text-3xl font-black">
                {user?.name || 'Farmer'}, your farm at a glance.
              </h2>

              <p className="mt-2 text-green-100 max-w-2xl">
                Use AI crop recommendations, disease detection,
                weather intelligence and yield estimation to make
                practical farm decisions.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  to="/crop-recommendation"
                  className="rounded-xl bg-white text-green-900 px-4 py-2.5 font-bold text-sm"
                >
                  Analyze my farm
                </Link>

                <button
                  onClick={() => setHelpOpen(true)}
                  className="rounded-xl bg-green-800 border border-green-500 px-4 py-2.5 font-bold text-sm flex gap-2 items-center"
                >
                  <CircleHelp size={17} />
                  Need Help
                </button>

              </div>

            </div>

            {/* ====================================================
                METRICS
            ==================================================== */}

            <div className="grid md:grid-cols-4 gap-4 mt-6">

              <Metric
                title="Farm Readiness"
                value={`${farmScore}%`}
                note="Based on current profile"
              />

              <Metric
                title="AI Modules"
                value="4"
                note="Ready to use"
              />

              <Metric
                title="Alerts"
                value={String(unread)}
                note={
                  unread
                    ? 'Needs attention'
                    : 'All clear'
                }
              />

              <Metric
                title="Support"
                value={latestHelp?.status || 'Available'}
                note={
                  repliedRequests.length > 0
                    ? 'Admin replied'
                    : 'Farmer assistance'
                }
              />

            </div>

            {/* ====================================================
                QUICK ACTIONS
            ==================================================== */}

            <section className="mt-8">

              <p className="text-xs font-bold tracking-widest text-slate-400">
                QUICK ACTIONS
              </p>

              <h3 className="text-2xl font-black mt-1">
                Decision tools
              </h3>

              <div className="grid md:grid-cols-4 gap-4 mt-5">

                <Action
                  to="/crop-recommendation"
                  icon={<Sprout />}
                  title="Crop Recommendation"
                  text="Find crops suited to your soil and weather."
                />

                <Action
                  to="/disease-detection"
                  icon={<ShieldCheck />}
                  title="Disease Detection"
                  text="Upload a plant image and identify disease risk."
                />

                <Action
                  to="/yield-prediction"
                  icon={<TrendingUp />}
                  title="Yield Prediction"
                  text="Estimate expected production from farm inputs."
                />

                <Action
                  to="/weather"
                  icon={<CloudSun />}
                  title="Live Weather"
                  text="View location-based weather and forecast."
                />

              </div>

            </section>

            {/* ====================================================
                ALERTS + SUPPORT
            ==================================================== */}

            <section
              id="alerts"
              className="mt-8 grid lg:grid-cols-2 gap-5"
            >

              {/* ALERTS */}

              <div className="bg-white border rounded-2xl p-6">

                <div className="flex justify-between">

                  <div>

                    <p className="text-xs font-bold tracking-widest text-slate-400">
                      FARMER NOTIFICATIONS
                    </p>

                    <h3 className="text-xl font-black mt-1">
                      Alerts from AgriNivara
                    </h3>

                  </div>

                  <Bell className="text-green-600" />

                </div>

                <div className="mt-5 space-y-3">

                  {alerts.length === 0 ? (

                    <p className="text-sm text-slate-500">
                      No alerts yet. Important updates from the
                      admin will appear here.
                    </p>

                  ) : (

                    alerts.slice(0, 5).map((alert) => {

                      const isRead =
                        alert.read_by_user === 1 ||
                        alert.read_by_user === true;

                      return (
                        <div
                          key={alert.id}
                          className="rounded-xl bg-green-50 border border-green-100 p-4"
                        >

                          <div className="flex justify-between">

                            <b>{alert.title}</b>

                            {!isRead && (
                              <span className="text-[10px] font-bold text-red-600">
                                NEW
                              </span>
                            )}

                          </div>

                          <p className="text-sm text-slate-600 mt-1">
                            {alert.message}
                          </p>

                          {alert.image_data && (
                            <img
                              src={alert.image_data}
                              className="mt-3 max-h-40 rounded-lg"
                              alt="Admin alert"
                            />
                          )}

                          {!isRead && (
                            <button
                              onClick={() =>
                                handleMarkAlertRead(alert.id)
                              }
                              className="mt-2 text-xs font-bold text-green-700"
                            >
                              Mark as read
                            </button>
                          )}

                        </div>
                      );
                    })

                  )}

                </div>

              </div>

              {/* SUPPORT */}

              <div className="bg-white border rounded-2xl p-6">

                <div className="flex justify-between">

                  <div>

                    <p className="text-xs font-bold tracking-widest text-slate-400">
                      SUPPORT
                    </p>

                    <h3 className="text-xl font-black mt-1">
                      Need help with your farm?
                    </h3>

                  </div>

                  <CircleHelp className="text-amber-600" />

                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Send a question, problem description or crop photo.
                  The admin team can review it and respond.
                </p>

                <button
                  onClick={() => setHelpOpen(true)}
                  className="mt-5 rounded-xl bg-slate-900 text-white px-4 py-3 font-bold flex gap-2 items-center"
                >
                  <Send size={17} />
                  Send Help Request
                </button>

                {latestHelp && (
                  <div className="mt-4 text-xs text-slate-500">

                    Latest request:{' '}

                    <b>{latestHelp.status || 'Open'}</b>

                    {latestHelp.admin_reply && (
                      <span>
                        {' '}
                        — {latestHelp.admin_reply}
                      </span>
                    )}

                  </div>
                )}

              </div>

            </section>

            {/* ====================================================
                ADMIN FEEDBACK
            ==================================================== */}

            <section className="mt-8">

              <div className="bg-white border rounded-2xl p-6">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div className="flex items-center gap-3">

                    <div className="h-11 w-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                      <MessageSquare size={22} />
                    </div>

                    <div>

                      <p className="text-xs font-bold tracking-widest text-slate-400">
                        ADMIN SUPPORT
                      </p>

                      <h3 className="text-xl font-black mt-1">
                        Admin Feedback
                      </h3>

                    </div>

                  </div>

                  <button
                    onClick={refreshFeedback}
                    disabled={refreshing}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >

                    <RefreshCw
                      size={16}
                      className={
                        refreshing
                          ? 'animate-spin'
                          : ''
                      }
                    />

                    {refreshing
                      ? 'Checking...'
                      : 'Check for new feedback'}

                  </button>

                </div>

                <p className="mt-3 text-sm text-slate-500">
                  Here you can view your help requests and responses
                  from the AgriNivara admin team.
                </p>

                {/* NO REQUESTS */}

                {help.length === 0 ? (

                  <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 p-6 text-center">

                    <CircleHelp
                      className="mx-auto text-slate-400"
                      size={32}
                    />

                    <p className="font-bold text-slate-700 mt-3">
                      No help requests yet
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Send a help request if you need assistance
                      with your farm.
                    </p>

                    <button
                      onClick={() => setHelpOpen(true)}
                      className="mt-4 rounded-xl bg-green-700 text-white px-4 py-2 font-bold text-sm"
                    >
                      Send Help Request
                    </button>

                  </div>

                ) : (

                  /* REQUEST LIST */

                  <div className="mt-6 space-y-4">

                    {help.map((request) => (

                      <div
                        key={request.id}
                        className="rounded-2xl border border-slate-200 overflow-hidden"
                      >

                        {/* REQUEST HEADER */}

                        <div className="bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                          <div>

                            <p className="text-xs font-bold text-slate-400">
                              HELP REQUEST #{request.id}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {formatDate(request.created_at)}
                            </p>

                          </div>

                          <span
                            className={`w-fit px-3 py-1 rounded-full border text-xs font-bold ${getStatusStyle(
                              request.status
                            )}`}
                          >
                            {request.status || 'Open'}
                          </span>

                        </div>

                        {/* REQUEST CONTENT */}

                        <div className="p-4">

                          <p className="text-xs font-bold tracking-wide text-slate-400">
                            YOUR REQUEST
                          </p>

                          <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                            {request.message ||
                              'Image attached without a message.'}
                          </p>

                          {request.image_data && (
                            <img
                              src={request.image_data}
                              alt="Farmer help request"
                              className="mt-3 max-h-52 rounded-xl border object-contain"
                            />
                          )}

                          {/* ADMIN FEEDBACK */}

                          <div
                            className={`mt-4 rounded-xl p-4 border ${request.admin_reply &&
                                request.admin_reply.trim()
                                ? 'bg-green-50 border-green-200'
                                : 'bg-slate-50 border-slate-200'
                              }`}
                          >

                            <div className="flex items-center gap-2">

                              <MessageSquare
                                size={17}
                                className={
                                  request.admin_reply &&
                                    request.admin_reply.trim()
                                    ? 'text-green-700'
                                    : 'text-slate-400'
                                }
                              />

                              <p className="text-xs font-bold tracking-wide">
                                ADMIN FEEDBACK
                              </p>

                            </div>

                            {request.admin_reply &&
                              request.admin_reply.trim() ? (

                              <div className="mt-3">

                                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                                  {request.admin_reply}
                                </p>

                                <div className="mt-3 flex items-center gap-2 text-xs text-green-700 font-bold">
                                  <span className="h-2 w-2 rounded-full bg-green-500" />
                                  Response received from admin
                                </div>

                              </div>

                            ) : (

                              <p className="text-sm text-slate-500 mt-2">
                                The admin team has not replied yet.
                                Please check again later.
                              </p>

                            )}

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>

          </div>

        </main>

      </div>

      {/* ============================================================
          HELP REQUEST MODAL
      ============================================================ */}

      {helpOpen && (

        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-lg w-full p-6">

            <div className="flex justify-between">

              <h3 className="text-xl font-black">
                Need Help
              </h3>

              <button
                onClick={() => setHelpOpen(false)}
              >
                <X />
              </button>

            </div>

            <p className="text-sm text-slate-500 mt-1">
              Tell the admin team what you need.
            </p>

            <textarea
              value={helpMessage}
              onChange={(e) =>
                setHelpMessage(e.target.value)
              }
              placeholder="Describe the issue..."
              className="w-full mt-4 h-32 rounded-xl border p-3 outline-none focus:ring-2 focus:ring-green-500"
            />

            <label className="mt-3 flex items-center gap-2 text-sm font-bold cursor-pointer">

              <Upload size={17} />

              Attach crop/farm image

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  setHelpImage(file);
                }}
              />

            </label>

            {helpImage && (
              <p className="text-xs text-green-700 mt-2">
                {helpImage.name}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">

              <button
                onClick={() => setHelpOpen(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                disabled={busy}
                onClick={submitHelp}
                className="px-5 py-2 rounded-lg bg-green-700 text-white font-bold disabled:opacity-50"
              >
                {busy
                  ? 'Sending...'
                  : 'Send to Admin'}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* ============================================================
   NAV COMPONENT
============================================================ */

function Nav({
  to,
  icon,
  text,
  active,
}: {
  to: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${active
          ? 'bg-green-50 text-green-700'
          : 'text-slate-600 hover:bg-green-50 hover:text-green-700'
        }`}
    >
      {icon}
      {text}
    </Link>
  );
}

/* ============================================================
   METRIC COMPONENT
============================================================ */

function Metric({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-white border rounded-2xl p-5">

      <p className="text-xs text-slate-500 font-bold">
        {title}
      </p>

      <p className="text-2xl font-black mt-2">
        {value}
      </p>

      <p className="text-xs text-green-700 mt-1">
        {note}
      </p>

    </div>
  );
}

/* ============================================================
   ACTION COMPONENT
============================================================ */

function Action({
  to,
  icon,
  title,
  text,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white border rounded-2xl p-5 hover:-translate-y-1 hover:shadow-lg transition"
    >

      <div className="text-green-700">
        {icon}
      </div>

      <h4 className="font-black mt-4">
        {title}
      </h4>

      <p className="text-sm text-slate-500 mt-1">
        {text}
      </p>

    </Link>
  );
}