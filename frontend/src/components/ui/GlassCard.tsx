import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'dark' | 'emerald' | 'light' | 'outline';
  glow?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'dark',
  glow = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    dark: 'bg-slate-900/80 backdrop-blur-xl border-slate-800 text-slate-100 shadow-xl shadow-slate-950/40',
    emerald: 'bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950/90 backdrop-blur-2xl border-emerald-500/20 text-slate-100 shadow-2xl shadow-emerald-950/30',
    light: 'bg-white/90 backdrop-blur-xl border-slate-200/80 text-slate-900 shadow-xl shadow-slate-200/50',
    outline: 'bg-slate-950/50 backdrop-blur-lg border-emerald-500/30 text-white',
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 ${variantStyles[variant]} ${
        glow ? 'hover:border-emerald-500/50 hover:shadow-emerald-500/10 hover:shadow-2xl' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
