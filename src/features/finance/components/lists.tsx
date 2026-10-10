import React from 'react';
import { IconPencil as Pencil, IconTrash2 as Trash2 } from '@/ui/icons';

const iconButton = 'text-ink/25 transition-colors cursor-pointer';

/** Edit / delete floating at the right edge of a card row (the row must be `group relative`). */
export const RowActions: React.FC<{ onEdit?: () => void; onRemove: () => void }> = ({ onEdit, onRemove }) => (
  <div className="absolute inset-y-0 right-4 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
    {onEdit && <button onClick={onEdit} aria-label="Edit" className={`${iconButton} hover:text-ink`}><Pencil size={13} /></button>}
    <button onClick={onRemove} aria-label="Delete" className={`${iconButton} hover:text-rust`}><Trash2 size={13} /></button>
  </div>
);

/** One card holding a list: rows sit edge to edge, separated by a hairline. */
export const ListCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="brutalist-card no-lift bg-paper-dark overflow-hidden !p-0">{children}</div>
);

/** A row of a ListCard: content on the left, a trailing slot (amount, actions) on the right. */
export const ListRow: React.FC<{ first?: boolean; children: React.ReactNode }> = ({ first = false, children }) => (
  <div className={`group flex items-center gap-6 px-8 py-6 ${first ? '' : 'border-t border-ink/12'}`}>
    {children}
  </div>
);

/** Edit / delete at the end of a ListRow — shown on hover. */
export const InlineActions: React.FC<{ onEdit: () => void; onRemove: () => void }> = ({ onEdit, onRemove }) => (
  <div className="flex items-center gap-3 w-12 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
    <button onClick={onEdit} aria-label="Edit" className={`${iconButton} hover:text-ink`}><Pencil size={13} /></button>
    <button onClick={onRemove} aria-label="Delete" className={`${iconButton} hover:text-rust`}><Trash2 size={13} /></button>
  </div>
);

export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border border-dashed border-ink/12 py-12 text-center">
    <p className="font-mono-main text-xs text-ink/25">{children}</p>
  </div>
);
