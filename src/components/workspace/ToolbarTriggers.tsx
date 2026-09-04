'use client';

import { ArrowUpDown, EyeOff, ListFilter, ListTree, Plus, X } from 'lucide-react';
import { PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const TOOLBAR_CHIP =
  'inline-flex h-8 items-center overflow-hidden rounded-md border bg-background shadow-xs transition-colors duration-150 hover:bg-muted';
const TOOLBAR_CHIP_ACTIVE = 'border-foreground/20 bg-muted';
const TOOLBAR_CHIP_BTN =
  'inline-flex h-full cursor-pointer items-center gap-1.5 px-2.5 text-xs font-medium transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

export function HideTrigger({
  hiddenCount = 0,
  className,
}: {
  hiddenCount?: number;
  className?: string;
}) {
  const label =
    hiddenCount > 0
      ? `${hiddenCount} hidden`
      : 'Hide';
  return (
    <div
      className={cn(
        TOOLBAR_CHIP,
        hiddenCount > 0 && TOOLBAR_CHIP_ACTIVE,
        className
      )}
    >
      <PopoverTrigger className={TOOLBAR_CHIP_BTN}>
        <EyeOff className="size-3.5 text-muted-foreground" />
        <span>{label}</span>
      </PopoverTrigger>
    </div>
  );
}

export function CreateTrigger({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        TOOLBAR_CHIP,
        'cursor-pointer gap-1.5 px-2.5 text-xs font-medium text-foreground',
        className
      )}
    >
      <Plus className="size-3.5 text-muted-foreground" />
      <span>{label}</span>
    </button>
  );
}

export function GroupTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      disabled
      title="Coming soon"
      className={cn(
        TOOLBAR_CHIP,
        'cursor-not-allowed gap-1.5 px-2.5 text-xs font-medium text-muted-foreground opacity-50',
        className
      )}
    >
      <ListTree className="size-3.5" />
      <span>Group</span>
    </button>
  );
}

export interface FilterTriggerProps {
  label?: string;
  activeCount?: number;
  onClear?: () => void;
  className?: string;
}

export function FilterTrigger({
  label = 'Filter',
  activeCount = 0,
  onClear,
  className,
}: FilterTriggerProps) {
  return (
    <div
      className={cn(TOOLBAR_CHIP, activeCount > 0 && TOOLBAR_CHIP_ACTIVE, className)}
    >
      <PopoverTrigger className={TOOLBAR_CHIP_BTN}>
        <ListFilter className="size-3.5 text-muted-foreground" />
        <span>{label}</span>
        {activeCount > 0 && (
          <span className="rounded-full bg-foreground px-1.5 py-0.2 text-[10px] tabular-nums font-semibold text-background">
            {activeCount}
          </span>
        )}
      </PopoverTrigger>
      {activeCount > 0 && onClear && (
        <button
          type="button"
          aria-label="Clear filters"
          className="flex h-full cursor-pointer items-center border-l px-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}

export interface SortTriggerProps {
  label: string;
  isSorted?: boolean;
  onClear?: () => void;
  className?: string;
}

export function SortTrigger({
  label,
  isSorted = false,
  onClear,
  className,
}: SortTriggerProps) {
  return (
    <div
      className={cn(TOOLBAR_CHIP, isSorted && TOOLBAR_CHIP_ACTIVE, className)}
    >
      <PopoverTrigger className={TOOLBAR_CHIP_BTN}>
        <ArrowUpDown className="size-3.5 text-muted-foreground" />
        <span>{label}</span>
      </PopoverTrigger>
      {isSorted && onClear && (
        <button
          type="button"
          aria-label="Clear sort"
          className="flex h-full cursor-pointer items-center border-l px-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
