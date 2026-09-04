import { Check, LayoutGrid } from 'lucide-react';
import { ViewGlyph } from './ViewGlyph';

export function RecordFooter({
  loadedCount,
  totalCount,
  entitySingular,
  entityPlural,
  viewLabel,
  viewIcon,
  viewColor,
}: {
  loadedCount: number;
  totalCount: number;
  entitySingular: string;
  entityPlural: string;
  viewLabel?: string;
  viewIcon?: string | null;
  viewColor?: string | null;
}) {
  const remaining = Math.max(0, totalCount - loadedCount);
  const noun = totalCount === 1 ? entitySingular : entityPlural;

  return (
    <footer className="z-10 flex h-9 shrink-0 items-center justify-between gap-3 border-t bg-background/95 px-4 text-xs text-muted-foreground select-none backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-1.5 truncate">
        <span className="font-medium tabular-nums text-foreground">
          {loadedCount.toLocaleString('en-US')}
        </span>
        {totalCount > 0 ? (
          <>
            <span>of</span>
            <span className="font-medium tabular-nums text-foreground">
              {totalCount.toLocaleString('en-US')}
            </span>
          </>
        ) : null}
        <span>{noun}</span>
        {viewLabel ? (
          <>
            <span className="opacity-40">·</span>
            <span className="inline-flex items-center gap-1.5 truncate text-foreground/90">
              {viewIcon ? (
                <ViewGlyph icon={viewIcon} color={viewColor} />
              ) : (
                <LayoutGrid className="size-3.5 text-emerald-600" />
              )}
              <span className="truncate">{viewLabel}</span>
            </span>
          </>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[11px] tabular-nums">
        {remaining > 0 ? (
          <span>
            {remaining.toLocaleString('en-US')} {noun} remaining
          </span>
        ) : loadedCount > 0 ? (
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="size-3" />
            All loaded
          </span>
        ) : null}
      </div>
    </footer>
  );
}
