import React from 'react';
import logoImg from '../../assets/agrinivara-logo.png';

interface AgriLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  variant?: 'light' | 'dark' | 'emerald' | 'gold';
  className?: string;
}

export const AgriLogo: React.FC<AgriLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = false,
  variant = 'emerald',
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
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="relative group">
        <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-300"></div>
        <div className={`relative ${currentSize.img} rounded-xl overflow-hidden bg-[#0A211B] border border-emerald-500/30 flex items-center justify-center p-1.5 shadow-md shadow-black/40`}>
          <img
            src={logoImg}
            alt="AgriNivara Logo"
            className="w-full h-full object-contain filter drop-shadow transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight text-[#F3EBDD] ${currentSize.text}`}>
              AGRI<span className="text-[#00B884]">NIVARA</span>
            </span>
            {showBadge && (
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 text-[#12C995] border border-emerald-500/30 rounded-full shadow-xs">
                AI CORE
              </span>
            )}
          </div>
          <span className={`font-bold tracking-[0.18em] uppercase text-[#D6A84F] ${currentSize.sub}`}>
            Intelligence For Every Farm
          </span>
        </div>
      )}
    </div>
  );
};
