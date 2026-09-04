'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChromeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  shortcut?: string;
  children: ReactNode;
}

export function ChromeButton({
  label,
  shortcut,
  children,
  className,
  disabled,
  ...props
}: ChromeButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          'inline-flex size-8 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors duration-150',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-40',
          className
        )}
        disabled={disabled}
        aria-label={shortcut ? `${label} (${shortcut})` : label}
        {...props}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="flex items-center gap-2 border-none bg-foreground px-2 py-1 text-background"
      >
        <span>{label}</span>
        {shortcut ? (
          <kbd className="rounded border border-background/25 px-1.5 py-px font-sans text-[10px] font-medium tracking-wide">
            {shortcut}
          </kbd>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
