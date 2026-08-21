import React from 'react';
import logoImg from '../../assets/agrinivara-logo.png';

interface AgriLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  variant?: 'light' | 'dark' | 'emerald';
  className?: string;
}

export const AgriLogo: React.FC<AgriLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = false,
  variant = 'dark',
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'h-8 w-8', text: 'text-base', sub: 'text-[9px]' },
    md: { img: 'h-10 w-10', text: 'text-lg sm:text-xl', sub: 'text-[10px]' },
    lg: { img: 'h-12 w-12 sm:h-14 sm:w-14', text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
    xl: { img: 'h-16 w-16 sm:h-20 sm:w-20', text: 'text-3xl sm:text-4xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <div className="relative group">
        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur-md opacity-40 group-hover:opacity-80 transition duration-500"></div>
        <div className={`relative ${currentSize.img} rounded-xl overflow-hidden bg-slate-900 border border-emerald-500/30 flex items-center justify-center p-1 shadow-lg shadow-emerald-950/50`}>
          <img
            src={logoImg}
            alt="AgriNivara Logo"
            className="w-full h-full object-contain filter drop-shadow transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight ${
                variant === 'light'
                  ? 'text-slate-900'
                  : 'text-white'
              } ${currentSize.text}`}
            >
              AGRI<span className="text-emerald-400">NIVARA</span>
            </span>
            {showBadge && (
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                AI CORE
              </span>
            )}
          </div>
          <span
            className={`font-semibold tracking-[0.2em] uppercase ${
              variant === 'light' ? 'text-emerald-700' : 'text-emerald-400/80'
            } ${currentSize.sub}`}
          >
            Intelligence For Every Farm
          </span>
        </div>
      )}
    </div>
  );
};
