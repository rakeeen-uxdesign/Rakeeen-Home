

// Re-exporting unified components
export * from '@/ui/Button';
export * from '@/ui/Card';
export * from '@/ui/Input';
export * from '@/ui/Modal';
export * from '@/ui/Select';
export * from '@/ui/PageHeader';
export * from '@/ui/ChartTooltip';

// --- TYPOGRAPHY & LABELS ---
export const Heading = ({ children, className = '', style }: any) => (
  <h2 className={`serif-heading ${className}`} style={{ fontSize: '28px', ...style }}>
    {children}
  </h2>
);

export const Label = ({ children, className = '', style }: any) => (
  <div className={`label ${className}`} style={{ ...style }}>
    {children}
  </div>
);
