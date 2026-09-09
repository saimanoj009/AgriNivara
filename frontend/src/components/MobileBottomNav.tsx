import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ShieldAlert,
  Activity,
  CloudSun,
  ShoppingBag,
} from 'lucide-react';

export function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    {
      label: 'Home',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      label: 'Crops',
      path: '/crop-recommendation',
      icon: <Sprout className="w-5 h-5" />,
    },
    {
      label: 'Disease',
      path: '/disease-detection',
      icon: <ShieldAlert className="w-5 h-5" />,
    },
    {
      label: 'Analysis',
      path: '/farm-analysis',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      label: 'Weather',
      path: '/weather',
      icon: <CloudSun className="w-5 h-5" />,
    },
  ];

  // Only render on core app routes (don't show on login/signup/landing)
  const isAppRoute = navItems.some((item) =>
    location.pathname.startsWith(item.path)
  ) || location.pathname.startsWith('/produce') || location.pathname.startsWith('/profile');

  if (!isAppRoute) return null;

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a211b]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-2xl safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                isActive
                  ? 'text-[#00b884] bg-emerald-500/10 font-semibold'
                  : 'text-[#a8b9ae] hover:text-[#f3ebdd] hover:bg-white/5 font-normal'
              }`}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00b884] ring-2 ring-[#0a211b]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
