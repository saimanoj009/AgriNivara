import React from 'react';

interface AIScanningOverlayProps {
  isScanning: boolean;
  label?: string;
}

export const AIScanningOverlay: React.FC<AIScanningOverlayProps> = ({
  isScanning,
  label = 'AI COMPUTER VISION ANALYSIS',
}) => {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none rounded-2xl overflow-hidden bg-emerald-950/20 backdrop-blur-[2px] border border-emerald-400/50">
      {/* Scanning laser line */}
      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-scan-line"></div>
      
      {/* Corner crosshairs */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Top Banner Tag */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-emerald-500/50 px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-400 tracking-wider shadow-lg flex items-center gap-1.5 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        {label}
      </div>
    </div>
  );
};
