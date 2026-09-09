import React, { useState, useEffect } from 'react';
import {
  Globe,
  Volume2,
  VolumeX,
  Menu,
  X,
  LayoutDashboard,
  Sprout,
  ShieldCheck,
  Droplets,
  Layers,
  User,
  LogOut,
  ChevronRight,
  Lock,
  PackageCheck,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Language } from '../types/agriculture';
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
        { to: '/farm-analysis', label: 'Farm Intelligence', icon: Layers },
        { to: '/crop-recommendation', label: 'Crop AI', icon: Sprout },
        { to: '/disease-detection', label: 'Plant Diagnostics', icon: ShieldCheck },
        { to: '/weather', label: 'Weather & Radar', icon: Droplets },
        { to: '/produce', label: 'Produce Market', icon: PackageCheck },
        ...(role === 'admin' ? [{ to: '/admin', label: 'Admin Ops', icon: Lock }] : []),
      ]
    : [
        { to: '/', label: 'Platform Overview' },
        { to: '/#solutions', label: 'Core AI Models' },
        { to: '/#metaphor', label: 'How It Works' },
      ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A211B]/95 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/40 py-2.5'
          : 'bg-[#0A211B]/85 backdrop-blur-md border-b border-white/5 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* BRAND LOGO */}
        <Link to="/" className="transition-transform duration-200 hover:scale-[1.02]">
          <AgriLogo size="md" variant="emerald" showBadge={true} />
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 bg-[#071C17]/90 p-1.5 rounded-full border border-white/10 shadow-inner">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = (link as any).icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00B884] to-[#0F766E] text-slate-950 shadow-md shadow-emerald-950/50 font-black'
                    : 'text-[#A8B9AE] hover:text-[#F3EBDD] hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-[#A8B9AE]'}`} />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CONTROLS & AUTH */}
        <div className="hidden md:flex items-center gap-2.5">
          
          {/* LANGUAGE SELECTOR */}
          {onLangChange && (
            <div className="flex items-center bg-[#071C17] rounded-xl px-2.5 py-1.5 border border-white/10 text-xs text-[#A8B9AE]">
              <Globe className="w-3.5 h-3.5 text-[#00B884] mr-1.5" />
              <select
                value={currentLang}
                onChange={(e) => onLangChange(e.target.value as Language)}
                aria-label="Select application language"
                className="bg-transparent text-xs font-bold text-[#F3EBDD] focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="bg-[#071C17] text-[#F3EBDD]">English (EN)</option>
                <option value="te" className="bg-[#071C17] text-[#F3EBDD]">తెలుగు (TE)</option>
                <option value="hi" className="bg-[#071C17] text-[#F3EBDD]">हिन्दी (HI)</option>
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
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse font-black'
                  : 'bg-[#102D25] text-[#D6A84F] hover:bg-[#143B30] border-[#D6A84F]/30 hover:border-[#D6A84F]/60'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#D6A84F]" />}
              <span>{isSpeaking ? 'Stop Voice' : 'Voice Mode'}</span>
            </button>
          )}

          {/* AUTH STATUS / BUTTONS */}
          {isAuth ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#102D25] hover:bg-[#143B30] text-[#F3EBDD] border border-white/10 text-xs font-bold transition shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#00B884] to-[#0F766E] text-slate-950 flex items-center justify-center font-black text-[10px]">
                  {(user?.name || 'F').charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user?.name || 'Farmer'}</span>
              </Link>
              <button
                onClick={handleLogout}
                title="Logout session"
                className="p-2 rounded-xl bg-[#102D25] hover:bg-rose-950/60 hover:text-rose-400 text-[#A8B9AE] border border-white/10 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#A8B9AE] hover:text-[#F3EBDD] hover:bg-white/5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-[#00B884] to-[#12C995] hover:brightness-110 shadow-md shadow-emerald-950/50 transition-all duration-150 flex items-center gap-1"
              >
                <span>Launch App</span>
                <ChevronRight className="w-3.5 h-3.5" />
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
                isSpeaking ? 'bg-amber-500 text-slate-950' : 'bg-[#102D25] text-[#D6A84F] border-white/10'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#102D25] text-[#F3EBDD] border border-white/10 hover:bg-[#143B30]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A211B] border-b border-white/10 px-4 py-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 shadow-2xl">
          
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              const Icon = (link as any).icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00B884] to-[#0F766E] text-slate-950 font-black'
                      : 'text-[#A8B9AE] hover:bg-white/5 hover:text-[#F3EBDD]'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-[#00B884]" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Language Switch in Mobile */}
          {onLangChange && (
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-[#A8B9AE] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#00B884]" /> Language:
              </span>
              <div className="flex gap-1">
                {(['en', 'te', 'hi'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => onLangChange(l)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      currentLang === l
                        ? 'bg-[#00B884] text-slate-950 font-black'
                        : 'bg-[#102D25] text-[#A8B9AE] border border-white/10'
                    }`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auth Controls in Mobile */}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {isAuth ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#102D25] text-[#F3EBDD] border border-white/10 text-xs font-bold"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#00B884]" />
                    {user?.name || 'Farmer Profile'}
                  </span>
                  <span className="text-[10px] text-[#00B884] uppercase font-black">{role}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-800/50 text-xs font-bold hover:bg-rose-900/60 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center py-2.5 rounded-xl bg-[#102D25] text-[#F3EBDD] border border-white/10 text-xs font-bold"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-center py-2.5 rounded-xl bg-[#00B884] text-slate-950 text-xs font-black shadow-md"
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
