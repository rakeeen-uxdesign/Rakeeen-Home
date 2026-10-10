import React from 'react';

/**
 * The finance modals' form pieces. Every add/edit modal is built from these, so a field,
 * a choice grid or a submit bar looks and behaves the same everywhere.
 */

/** The Finance accent green: the selected segment and the primary submit bar. */
const ACCENT_FILL = 'bg-[#7A9E1A] text-black';
const SUBMIT_TONE = {
  primary: `${ACCENT_FILL} hover:bg-[#8BB520]`,
  danger: 'bg-[var(--rust)] text-paper hover:opacity-90',
} as const;

const inputBase = 'w-full font-mono-main outline-none transition-colors bg-ink/5 border border-ink/12 focus:border-ink text-ink';

export const Field: React.FC<{ label: string; optional?: boolean; hint?: string; children: React.ReactNode }> = ({ label, optional, hint, children }) => (
  <div>
    <label className="font-sans-main uppercase tracking-widest block mb-3 text-[10px] font-semibold text-ink/40">
      {label}{optional && <span className="opacity-50"> (optional)</span>}
    </label>
    {children}
    {hint && <p className="font-mono-main text-[9px] text-ink/25 mt-2">{hint}</p>}
  </div>
);

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** `amount` is the big money entry; `text` the regular one. */
  look?: 'text' | 'amount';
};

export const TextInput: React.FC<InputProps> = ({ look = 'text', className = '', ...props }) => (
  <input
    {...props}
    className={`${inputBase} ${look === 'amount' ? 'px-4 py-3.5 text-[22px] font-bold' : 'px-4 py-3 text-[15px]'} ${className}`}
  />
);

/** Money entry with an EGP prefix. */
export const AmountInput: React.FC<Omit<InputProps, 'look' | 'type'>> = (props) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-main select-none text-[11px] text-ink/25">EGP</span>
    <input
      {...props}
      type="number"
      step="0.01"
      placeholder="0.00"
      className={`${inputBase} pl-[50px] pr-4 py-4 text-[28px] font-bold`}
    />
  </div>
);

export interface Choice<T> { value: T; label: string; sub?: string }

/** Pick one from a grid of tiles. */
export function ChoiceGrid<T extends string | number>({ options, value, onChange, columns = 2 }: {
  options: ReadonlyArray<Choice<T>>;
  value: T | null;
  onChange: (value: T) => void;
  columns?: 2 | 3 | 4;
}) {
  const cols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];
  return (
    <div className={`grid ${cols} gap-2`}>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`cursor-pointer font-sans-main font-bold uppercase tracking-wide transition-colors text-left px-3.5 py-3 border ${
              selected ? 'bg-ink text-paper border-ink' : 'bg-transparent text-ink/40 border-ink/12 hover:border-ink/30'
            }`}
          >
            <span className="block text-[10px]">{o.label}</span>
            {o.sub && <span className="block text-[9px] opacity-60 normal-case tracking-normal font-mono-main mt-0.5">{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Two or three joined options, the selected one filled with the accent. */
export function Segmented<T extends string | number>({ options, value, onChange }: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex border border-ink/12">
      {options.map((o, i) => {
        const selected = value === o.value;
        return (
          <button
            key={String(o.value)}
            type="button"
            onClick={() => onChange(o.value)}
            className={`cursor-pointer flex-1 font-sans-main font-bold uppercase tracking-wide transition-colors py-3.5 text-[12px] ${i > 0 ? 'border-l border-ink/12' : ''} ${selected ? ACCENT_FILL : 'text-ink/40'}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** The form body plus its full-width submit bar. */
export const ModalForm: React.FC<{
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  disabled?: boolean;
  /** `danger` is for taking money out. */
  tone?: 'primary' | 'danger';
  /** Let a long form scroll inside the modal instead of growing past the screen. */
  scrollable?: boolean;
  children: React.ReactNode;
}> = ({ onSubmit, submitLabel, disabled = false, tone = 'primary', scrollable = false, children }) => (
  <form onSubmit={onSubmit}>
    <div className={`px-8 pt-7 pb-7 flex flex-col gap-6 ${scrollable ? 'max-h-[68vh] overflow-y-auto' : ''}`}>{children}</div>
    <div className="border-t border-ink/12">
      <button
        type="submit"
        disabled={disabled}
        className={`w-full font-sans-main font-black uppercase tracking-wide transition-colors py-5 text-[13px] cursor-pointer disabled:cursor-not-allowed disabled:bg-ink/5 disabled:text-ink/25 disabled:hover:bg-ink/5 ${SUBMIT_TONE[tone]}`}
      >
        {submitLabel}
      </button>
    </div>
  </form>
);
