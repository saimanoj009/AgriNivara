import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'botanical' | 'emerald' | 'elevated' | 'subtle' | 'outline' | 'dark' | 'light';
  glow?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'botanical',
  glow = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    botanical: 'bg-[#102D25] border-white/10 text-[#F3EBDD] shadow-lg shadow-black/30',
    emerald: 'bg-gradient-to-br from-[#12362B] via-[#0E2D24] to-[#0A211B] border-emerald-500/25 text-[#F3EBDD] shadow-lg shadow-black/30',
    elevated: 'bg-[#143B30] border-emerald-500/20 text-[#F3EBDD] shadow-xl shadow-black/40',
    subtle: 'bg-[#0C241E] border-white/5 text-[#A8B9AE]',
    outline: 'bg-transparent border-white/10 text-[#F3EBDD]',
    // Universal mapping to ensure NO pure white cards exist anywhere
    dark: 'bg-[#102D25] border-white/10 text-[#F3EBDD] shadow-lg shadow-black/30',
    light: 'bg-[#102D25] border-white/10 text-[#F3EBDD] shadow-lg shadow-black/30',
  };

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${variantStyles[variant]} ${
        glow ? 'hover:border-emerald-400/50 hover:shadow-emerald-950/40 hover:shadow-xl' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
