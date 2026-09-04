'use client';

import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MENU_PANEL =
  'z-[60] w-72 overflow-hidden p-0 text-xs shadow-md pointer-events-auto';

export function MenuSearch({
  value,
  onChange,
  placeholder,
  onBack,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-center gap-1 border-b px-2">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
        </button>
      ) : (
        <Search className="ml-1 size-3.5 shrink-0 text-muted-foreground" />
      )}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        autoFocus
      />
    </div>
  );
}

export function MenuList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('max-h-72 overflow-y-auto overscroll-contain p-1', className)}>
      {children}
    </div>
  );
}

export function MenuRow({
  icon,
  label,
  hint,
  count,
  active,
  chevron,
  trailing,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  hint?: string;
  count?: number;
  active?: boolean;
  chevron?: boolean;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left',
        active
          ? 'bg-muted text-foreground'
          : 'text-foreground hover:bg-muted/80'
      )}
    >
      {icon ? (
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      {hint ? (
        <span className="shrink-0 text-[11px] text-muted-foreground">{hint}</span>
      ) : null}
      {typeof count === 'number' ? (
        <span className="shrink-0 tabular-nums text-[11px] text-muted-foreground">
          {count}
        </span>
      ) : null}
      {trailing}
      {chevron ? (
        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
      ) : null}
    </button>
  );
}

export function MenuEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 py-6 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}

export function MenuFooter({ children }: { children: ReactNode }) {
  return <div className="border-t p-1">{children}</div>;
}

export function MenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}
