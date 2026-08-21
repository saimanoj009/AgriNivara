import React, { useState, useEffect } from 'react';
import { Globe, Volume2, VolumeX, Menu, X, LayoutDashboard, Sprout, ShieldCheck, CloudSun, SlidersHorizontal, User, LogOut, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Language } from '../types/agriculture';
import { t } from '../utils/translations';
import { AgriLogo } from './ui/AgriLogo';
import { getAuthRole, getAuthUser, isAuthenticated, logout } from '../services/api';

interface NavbarProps {
  currentLang?: Language;
  onLangChange?: (lang: Language) => void;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
}

export function Navbar({
  currentLang = 'en',
  onLangChange,
  isSpeaking = false,
  onToggleSpeech,
}: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAuth = isAuthenticated();
  const role = getAuthRole();
  const user = getAuthUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navLinks = isAuth
    ? [
        { to: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
        { to: '/crop-recommendation', label: 'Crop AI', icon: Sprout },
        { to: '/disease-detection', label: 'Plant Diagnostics', icon: ShieldCheck },
        { to: '/weather', label: 'Weather Hub', icon: CloudSun },
        ...(role === 'admin' ? [{ to: '/admin', label: 'Admin Operations', icon: Lock }] : []),
      ]
    : [
        { to: '/', label: 'Overview' },
        { to: '/#solutions', label: 'AI Intelligence' },
        { to: '/#metaphor', label: 'How It Works' },
        { to: '/#demo', label: 'Interactive Demos' },
      ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl shadow-slate-950/80 py-3'
          : 'bg-slate-950/70 backdrop-blur-md border-b border-slate-800/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link to="/" className="transition-transform duration-200 hover:scale-[1.02]">
          <AgriLogo size="md" variant="dark" showBadge={true} />
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = (link as any).icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CONTROLS & AUTH */}
        <div className="hidden md:flex items-center gap-3">
          
          {/* LANGUAGE SELECTOR */}
          {onLangChange && (
            <div className="flex items-center bg-slate-900/80 rounded-xl px-2 py-1 border border-slate-800 text-xs text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
              <select
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value as Language)}
                aria-label="Select application language"
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="te" className="bg-slate-900 text-white">తెలుగు (TE)</option>
                <option value="hi" className="bg-slate-900 text-white">हिन्दी (HI)</option>
              </select>
            </div>
          )}

          {/* VOICE ADVISORY BUTTON */}
          {onToggleSpeech && (
            <button
              onClick={onToggleSpeech}
              title="Voice Readout Advisory"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse shadow-lg shadow-amber-500/30'
                  : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80 border-emerald-500/30'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Voice' : 'Listen Voice'}</span>
            </button>
          )}

          {/* AUTH STATUS / BUTTONS */}
          {isAuth ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold text-[10px]">
                  {(user?.name || 'F').charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[90px] truncate">{user?.name || 'Farmer'}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout session"
                className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-md shadow-emerald-500/20 transition-all duration-200 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-1">
                  Launch Platform
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-2 md:hidden">
          {onToggleSpeech && (
            <button
              onClick={onToggleSpeech}
              className={`p-2 rounded-xl text-xs font-bold border ${
                isSpeaking ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-emerald-400 border-slate-800'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-emerald-500/20 px-5 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          
          {/* Mobile Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = (link as any).icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Language Switch in Mobile */}
          {onLangChange && (
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Language:
              </span>
              <div className="flex gap-1.5">
                {(['en', 'te', 'hi'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => onLangChange(l)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg ${
                      currentLang === l
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auth Controls in Mobile */}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
            {isAuth ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-sm font-bold"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    {user?.name || 'Farmer Profile'}
                  </span>
                  <span className="text-xs text-emerald-400 uppercase font-extrabold">{role}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-900/60 text-sm font-bold hover:bg-rose-900/60"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center py-3 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 text-sm font-bold hover:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-center py-3 rounded-xl bg-emerald-500 text-slate-950 text-sm font-black shadow-lg hover:bg-emerald-400"
                >
                  Launch App
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
