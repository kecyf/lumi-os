'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { ssrSafeStorage } from '@/lib/utils/ssr-storage';

export interface UseTableColumnWidthsOptions<TCol extends string> {
  storageKey: string;
  columns: readonly TCol[];
  defaultWidths: Record<TCol, number>;
  minWidths?: Partial<Record<TCol, number>>;
  maxWidth?: number;
  gutterWidth?: number;
}

export function useTableColumnWidths<TCol extends string>({
  storageKey,
  columns,
  defaultWidths,
  minWidths = {},
  maxWidth = 600,
  gutterWidth = 40,
}: UseTableColumnWidthsOptions<TCol>) {
  const [overrides, setOverrides] = useState<Partial<Record<TCol, number>>>({});
  const [resizingId, setResizingId] = useState<TCol | null>(null);
  const overridesRef = useRef(overrides);
  overridesRef.current = overrides;

  useEffect(() => {
    try {
      const raw = ssrSafeStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const clean: Partial<Record<TCol, number>> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
            clean[k as TCol] = Math.round(v);
          }
        }
        setOverrides(clean);
      }
    } catch {
      // Ignore parse/storage errors
    }
  }, [storageKey]);

  useEffect(() => {
    if (!resizingId) return;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [resizingId]);

  const snap = (px: number) => Math.round(px / 8) * 8;

  const clamp = useCallback(
    (id: TCol, px: number) => {
      const min = minWidths[id] ?? 80;
      return Math.min(maxWidth, Math.max(min, snap(px)));
    },
    [minWidths, maxWidth]
  );

  const widthOf = useCallback(
    (id: TCol): number => {
      if (overrides[id] != null) return overrides[id]!;
      return defaultWidths[id] ?? 120;
    },
    [overrides, defaultWidths]
  );

  const onResizeStart = useCallback(
    (id: TCol, event: ReactPointerEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startWidth = widthOf(id);
      setResizingId(id);

      const onMove = (moveEvent: PointerEvent) => {
        const nextWidth = clamp(id, startWidth + (moveEvent.clientX - startX));
        const next = { ...overridesRef.current, [id]: nextWidth };
        overridesRef.current = next;
        setOverrides(next);
      };

      const onUp = () => {
        setResizingId(null);
        try {
          ssrSafeStorage.setItem(storageKey, JSON.stringify(overridesRef.current));
        } catch {
          // Ignore storage quota
        }
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [clamp, storageKey, widthOf]
  );

  const tableWidth = useMemo(() => {
    const sum = columns.reduce((acc, colId) => acc + widthOf(colId), 0);
    return sum + gutterWidth;
  }, [columns, widthOf, gutterWidth]);

  return {
    widthOf,
    tableWidth,
    resizingId,
    onResizeStart,
  };
}
