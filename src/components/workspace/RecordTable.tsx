'use client';

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Loader2 } from 'lucide-react';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@/lib/workspace/column-catalog';
import type { SortDir } from '@/lib/workspace/views';
import {
  TableEmptyRow,
  TableSkeletonRows,
} from '@/components/workspace/TableSkeletonRows';
import {
  SortMark,
  SortableHead,
  restrictToHorizontalAxis,
} from '@/components/workspace/SortableHead';

const GUTTER_MIN = 40;

function OptionalDnd({
  enabled,
  children,
  ...props
}: ComponentProps<typeof DndContext> & { enabled: boolean }) {
  if (!enabled) return children;
  return <DndContext {...props}>{children}</DndContext>;
}

function pinnedSurfaceClass(kind: 'head' | 'cell'): string {
  const frozen = 'sticky left-0 border-r border-border bg-background';
  if (kind === 'head') {
    return `${frozen} z-20`;
  }
  return `${frozen} z-[1] group-hover:bg-muted group-data-[state=selected]:bg-muted`;
}

export function RecordTable<TItem, TId extends string>({
  items,
  loading,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  columns,
  catalog,
  sort,
  sortDir = 'desc',
  onSort,
  onColumnsChange,
  widthOf,
  tableWidth,
  resizingId,
  onResizeStart,
  rowKey,
  isActive,
  emptyMessage,
  headerClassName,
  cellClassName,
  renderCell,
}: {
  items: TItem[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  columns: TId[];
  catalog: readonly ColumnDef<TId>[];
  sort?: string;
  sortDir?: SortDir;
  onSort?: (column: string) => void;
  onColumnsChange?: (columns: TId[]) => void;
  widthOf: (id: TId) => number;
  tableWidth: number;
  resizingId: TId | string | null;
  onResizeStart: (id: TId, event: ReactPointerEvent<HTMLElement>) => void;
  rowKey: (item: TItem) => string | number;
  isActive?: (item: TItem) => boolean;
  emptyMessage: string;
  headerClassName?: (id: TId) => string | undefined;
  cellClassName?: (id: TId, index: number) => string | undefined;
  renderCell: (columnId: TId, item: TItem) => ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [draggingColumn, setDraggingColumn] = useState<TId | null>(null);
  const mounted = useHasMounted();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    const root = scrollRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasMore || !onLoadMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { root, rootMargin: '200px 0px', threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, items.length, onLoadMore]);

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id) as TId;
    const overId = event.over ? (String(event.over.id) as TId) : null;
    setDraggingColumn(null);
    if (!overId || activeId === overId || !onColumnsChange) return;
    const oldIndex = columns.indexOf(activeId);
    const newIndex = columns.indexOf(overId);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = [...columns];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onColumnsChange(next);
  };

  return (
    <div
      className="relative min-h-0 min-w-0 flex-1 overflow-hidden border-t"
      aria-busy={loading || loadingMore}
    >
      <div ref={scrollRef} className="h-full overflow-auto">
        <OptionalDnd
          enabled={mounted}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToHorizontalAxis]}
          onDragStart={(event) => setDraggingColumn(String(event.active.id) as TId)}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setDraggingColumn(null)}
        >
          <table
            className="w-full caption-bottom border-separate border-spacing-0 text-sm"
            style={{ tableLayout: 'fixed', minWidth: tableWidth }}
          >
            <colgroup>
              {columns.map((columnId) => {
                const width = widthOf(columnId);
                return <col key={columnId} style={{ width, minWidth: width }} />;
              })}
              <col style={{ width: '100%', minWidth: GUTTER_MIN }} />
            </colgroup>
            <TableHeader className="sticky top-0 z-10">
              <TableRow className="transition-none hover:bg-transparent">
                <SortableContext
                  items={columns}
                  strategy={horizontalListSortingStrategy}
                >
                  {columns.map((columnId, index) => {
                    const column = catalog.find((item) => item.id === columnId);
                    if (!column) return null;
                    const sortKey = column.sort ?? null;
                    const active = sortKey != null && sort === sortKey;
                    const resizing = resizingId === columnId;
                    return (
                      <SortableHead
                        key={column.id}
                        columnId={column.id}
                        pinned={column.pinned}
                        aria-sort={
                          sortKey
                            ? active
                              ? sortDir === 'asc'
                                ? 'ascending'
                                : 'descending'
                              : 'none'
                            : undefined
                        }
                        className={cn(
                          'group/th relative sticky top-0 z-10 h-9 border-b bg-background text-[11px] font-medium text-muted-foreground',
                          index === 0 ? 'pl-3 pr-0.5' : 'px-0.5',
                          column.pinned && pinnedSurfaceClass('head'),
                          headerClassName?.(columnId)
                        )}
                        trailing={
                          <button
                            type="button"
                            aria-label={`Resize ${column.label}`}
                            className="absolute inset-y-0 right-0 z-10 w-2 cursor-col-resize touch-none"
                            onPointerDown={(event) => onResizeStart(columnId, event)}
                            onClick={(event) => event.preventDefault()}
                          >
                            {resizing ? (
                              <span className="absolute inset-y-1.5 right-0 w-px bg-foreground/40" />
                            ) : null}
                          </button>
                        }
                      >
                        {onSort && sortKey ? (
                          <button
                            type="button"
                            onClick={() => onSort(sortKey)}
                            className="inline-flex max-w-full cursor-pointer items-center gap-1 truncate rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            {column.label}
                            <SortMark active={active} direction={sortDir} />
                          </button>
                        ) : (
                          <span className="truncate">{column.label}</span>
                        )}
                      </SortableHead>
                    );
                  })}
                </SortableContext>
                <TableHead className="sticky top-0 z-10 border-b bg-background" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && items.length === 0 ? (
                <TableSkeletonRows columns={columns} />
              ) : !loading && items.length === 0 ? (
                <TableEmptyRow
                  colSpan={columns.length + 1}
                  message={emptyMessage}
                />
              ) : (
                items.map((item) => {
                  const active = isActive?.(item) ?? false;
                  return (
                    <TableRow
                      key={rowKey(item)}
                      data-state={active ? 'selected' : undefined}
                      className={cn(
                        'group h-11 transition-none hover:bg-muted/50',
                        active && 'bg-muted/70'
                      )}
                    >
                      {columns.map((columnId, index) => {
                        const column = catalog.find((item) => item.id === columnId);
                        return (
                          <TableCell
                            key={columnId}
                            className={cn(
                              'overflow-hidden py-2',
                              index === 0 && 'pl-4',
                              column?.pinned && pinnedSurfaceClass('cell'),
                              cellClassName?.(columnId, index)
                            )}
                          >
                            {renderCell(columnId, item)}
                          </TableCell>
                        );
                      })}
                      <TableCell />
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </table>
          {mounted ? (
            <DragOverlay>
              {draggingColumn ? (
                <div className="rounded-md border bg-background px-2 py-1 text-[11px] font-medium shadow-sm">
                  {catalog.find((item) => item.id === draggingColumn)?.label ??
                    draggingColumn}
                </div>
              ) : null}
            </DragOverlay>
          ) : null}
        </OptionalDnd>
        {items.length > 0 ? (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center py-3"
            aria-hidden={!loadingMore}
          >
            {loadingMore ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="h-4" />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
