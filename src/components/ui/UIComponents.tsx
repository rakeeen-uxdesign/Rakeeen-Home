

// Re-exporting unified components
export * from '@/components/ui/Button';
export * from '@/components/ui/Card';
export * from '@/components/ui/Input';
export * from '@/components/ui/Modal';
export * from '@/components/ui/Select';
export * from '@/components/ui/PageHeader';
export * from '@/components/ui/ChartTooltip';

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
