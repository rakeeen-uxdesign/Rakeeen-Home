import React from 'react';

/** The PRIVATE / VISIBLE switch that hides or shows every amount on the Finance page. */
export const PrivacyToggle: React.FC<{ privateMode: boolean; onToggle: () => void }> = ({ privateMode, onToggle }) => (
  <button
    onClick={onToggle}
    className="flex items-center gap-2 cursor-pointer select-none group"
    title={privateMode ? 'Privacy on' : 'Privacy off'}
  >
    <span className="font-mono-main text-[9px] uppercase tracking-widest text-ink/40 group-hover:text-ink/60 transition-colors">
      {privateMode ? 'PRIVATE' : 'VISIBLE'}
    </span>
    <div className={`relative w-9 h-5 border transition-colors duration-200 ${privateMode ? 'border-ink' : 'border-ink/30'}`}>
      <div
        className={`absolute top-0.5 w-3.5 h-3.5 transition-all duration-200 ${privateMode ? 'left-[calc(100%-0.875rem-2px)] bg-ink' : 'left-0.5 bg-ink/25'}`}
      />
    </div>
  </button>
);
