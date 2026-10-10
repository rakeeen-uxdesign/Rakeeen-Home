import React from 'react';

/**
 * The one button style for Finance's actions (Deposit, Withdraw, Add…): mono caps, no icon.
 * `solid` is the main action on a screen — a filled block. `ghost` is every other action: just
 * the word, underlined, with no box around it.
 */
export const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'solid' | 'ghost' }> = ({
  tone = 'ghost', className = '', ...props
}) => (
  <button
    type="button"
    {...props}
    className={`font-mono-main text-[10px] uppercase tracking-[0.2em] font-bold cursor-pointer transition-colors ${
      tone === 'solid'
        ? 'px-5 py-2.5 border bg-ink text-paper border-ink hover:opacity-80'
        : 'px-1 py-2 underline underline-offset-[6px] decoration-1 text-ink/60 decoration-ink/25 hover:text-ink hover:decoration-[var(--ink)]'
    } ${className}`}
  />
);
