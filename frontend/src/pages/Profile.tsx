import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  ShieldCheck,
  LogOut,
  Sprout,
  CheckCircle2,
  Save,
  Layers,
  Droplets,
  Calendar,
  Compass,
} from 'lucide-react';
import { getAuthUser, logout } from '../services/api';
import { AgriLogo } from '../components/ui/AgriLogo';
import { UnifiedLocationSelector } from '../components/UnifiedLocationSelector';
import { useFarm } from '../context/FarmContext';

export default function Profile() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const { farmProfile, updateFarmProfile } = useFarm();

  const [form, setForm] = useState({
    location: farmProfile.location || user?.location || 'Warangal, Telangana',
    area_acres: farmProfile.area_acres ?? 2.5,
    primary_crop: farmProfile.primary_crop || 'Rice (Paddy)',
    crop_stage: farmProfile.crop_stage || 'Vegetative',
    irrigation_method: farmProfile.irrigation_method || 'Drip Irrigation',
    soil_type: farmProfile.soil_type || 'Clay Loam',
    moisture_pct: farmProfile.moisture_pct ?? 65,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateFarmProfile(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#071C17] text-[#F3EBDD] pb-20 selection:bg-[#00B884] selection:text-[#071C17]">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0A211B]/90 backdrop-blur-md border-b border-[#143B30] px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#102D25] hover:bg-[#143B30] text-xs font-bold text-[#00B884] border border-[#143B30] transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Command Center</span>
          </Link>
          <AgriLogo size="sm" />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-bold border border-rose-800/40 transition cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* PROFILE BANNER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#102D25] border border-[#143B30] shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00B884] to-[#007A58] text-[#071C17] flex items-center justify-center text-3xl font-black shadow-lg shadow-[#00B884]/20 border border-[#00B884]/40">
            {(user?.name || 'F').charAt(0).toUpperCase()}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#00B884]/15 text-[#00B884] text-[10px] font-black uppercase tracking-wider border border-[#00B884]/30">
              <ShieldCheck size={12} /> Verified Farm Owner
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#F3EBDD]">{user?.name || 'Farmer'}</h1>
            <p className="text-xs text-[#A8B9AE] flex items-center justify-center sm:justify-start gap-1.5 font-medium">
              <MapPin size={14} className="text-[#00B884]" />
              {form.location}
            </p>
          </div>
        </div>

        {/* BASIC ACCOUNT DETAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#102D25] border border-[#143B30] flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#0C241E] text-[#00B884] border border-[#143B30] shrink-0">
              <User size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#738A7C]">Registered Name</span>
              <p className="text-sm font-bold text-[#F3EBDD] mt-0.5">{user?.name || '—'}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#102D25] border border-[#143B30] flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#0C241E] text-[#00B884] border border-[#143B30] shrink-0">
              <Phone size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#738A7C]">Mobile Authentication</span>
              <p className="text-sm font-bold text-[#F3EBDD] mt-0.5">{user?.mobile || '—'}</p>
            </div>
          </div>
        </div>

        {/* FARM CONTEXT & REUSABLE INTELLIGENCE FORM */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#102D25] border border-[#143B30] shadow-xl space-y-6">
          <div className="border-b border-[#143B30] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#F3EBDD]">Farm Profile & Shared Context</h2>
              <p className="text-xs text-[#A8B9AE] mt-0.5">
                This information automatically feeds into Smart Irrigation, Crop AI, and Today's Farm Intelligence.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#00B884]/15 text-[#00B884] text-[10px] font-black uppercase border border-[#00B884]/30">
              SHARED CONTEXT
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Location Selector */}
            <div>
              <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-[#00B884]" /> Farm Location / District
              </label>
              <UnifiedLocationSelector
                value={form.location}
                onChange={(locName: string, details?: any) => {
                  setForm((prev) => ({
                    ...prev,
                    location: locName,
                    ...(details?.lat && details?.lon ? { lat: details.lat, lon: details.lon } : {}),
                  }));
                }}
                placeholder="Search village, city, or district..."
                inputId="profile-location-input"
              />
            </div>

            {/* Farm Area & Crop Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#00B884]" /> Farm Land Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={form.area_acres}
                  onChange={(e) => setForm((prev) => ({ ...prev, area_acres: parseFloat(e.target.value) || 1 }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C241E] border border-[#143B30] text-sm font-semibold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Sprout size={14} className="text-[#00B884]" /> Primary Standing Crop
                </label>
                <select
                  value={form.primary_crop}
                  onChange={(e) => setForm((prev) => ({ ...prev, primary_crop: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C241E] border border-[#143B30] text-sm font-semibold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none transition"
                >
                  <option value="Rice (Paddy)">🌾 Rice (Paddy)</option>
                  <option value="Wheat">🌾 Wheat</option>
                  <option value="Maize">🌽 Maize</option>
                  <option value="Groundnut">🥜 Groundnut</option>
                  <option value="Cotton">🌱 Cotton</option>
                  <option value="Sugarcane">🎋 Sugarcane</option>
                  <option value="Chickpea / Bengal Gram">🫘 Chickpea / Bengal Gram</option>
                  <option value="Tomato">🍅 Tomato</option>
                  <option value="Chilli">🌶️ Chilli</option>
                  <option value="Other">🌱 Other Regional Crop</option>
                </select>
              </div>
            </div>

            {/* Crop Stage & Irrigation Method Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#00B884]" /> Growth Stage
                </label>
                <select
                  value={form.crop_stage}
                  onChange={(e) => setForm((prev) => ({ ...prev, crop_stage: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C241E] border border-[#143B30] text-sm font-semibold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none transition"
                >
                  <option value="Sowing / Germination">Sowing / Germination</option>
                  <option value="Vegetative">Vegetative / Tillering</option>
                  <option value="Flowering">Flowering / Booting</option>
                  <option value="Grain Filling">Grain Filling / Pod Development</option>
                  <option value="Maturity">Maturity / Pre-Harvest</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Droplets size={14} className="text-[#00B884]" /> Irrigation Infrastructure
                </label>
                <select
                  value={form.irrigation_method}
                  onChange={(e) => setForm((prev) => ({ ...prev, irrigation_method: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C241E] border border-[#143B30] text-sm font-semibold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none transition"
                >
                  <option value="Drip Irrigation">Drip Irrigation (Micro-dosing)</option>
                  <option value="Sprinkler">Sprinkler Irrigation</option>
                  <option value="Furrow / Basin">Furrow / Basin (Surface)</option>
                  <option value="Rainfed">Rainfed (No active pump)</option>
                </select>
              </div>
            </div>

            {/* Soil Type & Estimated Moisture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Compass size={14} className="text-[#00B884]" /> Soil Classification
                </label>
                <select
                  value={form.soil_type}
                  onChange={(e) => setForm((prev) => ({ ...prev, soil_type: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C241E] border border-[#143B30] text-sm font-semibold text-[#F3EBDD] focus:border-[#00B884] focus:ring-1 focus:ring-[#00B884] outline-none transition"
                >
                  <option value="Clay Loam">Clay Loam (High moisture retention)</option>
                  <option value="Sandy Loam">Sandy Loam (Fast drainage)</option>
                  <option value="Black Cotton Soil">Black Cotton Soil (Regur)</option>
                  <option value="Red Soil">Red Soil</option>
                  <option value="Alluvial Soil">Alluvial Soil</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#A8B9AE] uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Droplets size={14} className="text-[#00B884]" /> Current Soil Moisture Est.
                  </span>
                  <span className="text-[#00B884] font-bold">{form.moisture_pct}%</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="95"
                  value={form.moisture_pct}
                  onChange={(e) => setForm((prev) => ({ ...prev, moisture_pct: parseInt(e.target.value) || 50 }))}
                  className="w-full h-2 bg-[#0C241E] rounded-lg appearance-none cursor-pointer accent-[#00B884] mt-2 border border-[#143B30]"
                />
              </div>
            </div>

            {/* Save Button & Feedback */}
            <div className="pt-4 border-t border-[#143B30] flex flex-col sm:flex-row items-center justify-between gap-3">
              {savedSuccess ? (
                <div className="text-xs font-bold text-[#00B884] flex items-center gap-1.5">
                  <CheckCircle2 size={16} />
                  <span>Farm profile updated across all intelligence modules!</span>
                </div>
              ) : (
                <span className="text-xs text-[#738A7C]">Settings auto-applied to Dashboard & Irrigation</span>
              )}

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00B884] to-[#00956B] hover:from-[#00c990] hover:to-[#00a879] text-[#071C17] text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-[#00B884]/20 cursor-pointer"
              >
                <Save size={14} />
                <span>Save Farm Profile</span>
              </button>
            </div>
          </form>
        </div>

      </main>
    </div>
  );
}
