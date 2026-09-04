'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical } from 'lucide-react';
import { MENU_PANEL, MenuSearch, MenuSectionLabel } from './CommandMenu';
import { HideTrigger } from './ToolbarTriggers';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface ColumnDefinition<T extends string = string> {
  id: T;
  label: string;
  pinned?: boolean;
}

export interface ColumnsPopoverProps<T extends string = string> {
  columns: readonly ColumnDefinition<T>[];
  visibleColumns: T[];
  onChange: (columns: T[]) => void;
  children?: ReactNode;
  align?: 'end' | 'start';
}

function computeMenuOrder<T extends string>(
  allColumns: readonly ColumnDefinition<T>[],
  visible: readonly T[]
): T[] {
  const visibleSet = new Set(visible);
  const hidden = allColumns.filter((c) => !visibleSet.has(c.id)).map((c) => c.id);
  const pinned = allColumns.filter((c) => c.pinned).map((c) => c.id);
  const unpinnedVisible = visible.filter(
    (id) => !allColumns.find((c) => c.id === id)?.pinned
  );
  return [...pinned, ...unpinnedVisible, ...hidden];
}

function reorderColumnList<T extends string>(
  visible: readonly T[],
  allColumns: readonly ColumnDefinition<T>[],
  activeId: T,
  overId: T
): T[] {
  const menuOrder = computeMenuOrder(allColumns, visible);
  const oldIdx = menuOrder.indexOf(activeId);
  const newIdx = menuOrder.indexOf(overId);
  if (oldIdx < 0 || newIdx < 0 || oldIdx === newIdx) return [...visible];

  const nextMenu = [...menuOrder];
  const [moved] = nextMenu.splice(oldIdx, 1);
  nextMenu.splice(newIdx, 0, moved);

  const visibleSet = new Set(visible);
  return nextMenu.filter((id) => visibleSet.has(id));
}

function toggleColumnVisibility<T extends string>(
  visible: readonly T[],
  allColumns: readonly ColumnDefinition<T>[],
  id: T
): T[] {
  const col = allColumns.find((c) => c.id === id);
  if (!col || col.pinned) return [...visible];

  if (visible.includes(id)) {
    return visible.filter((item) => item !== id);
  }
  return [...visible, id];
}

function ColumnRow<T extends string>({
  id,
  label,
  visible,
  pinned,
  onToggle,
}: {
  id: T;
  label: string;
  visible: boolean;
  pinned: boolean;
  onToggle: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: pinned });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'group/col flex items-center gap-1 rounded-md px-1 py-1 transition-colors duration-150',
        isDragging && 'opacity-40',
        pinned ? 'opacity-70' : 'hover:bg-muted'
      )}
    >
      <button
        type="button"
        aria-label={pinned ? undefined : `Reorder ${label}`}
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground',
          pinned
            ? 'cursor-default opacity-0'
            : 'cursor-grab opacity-0 touch-none hover:text-foreground active:cursor-grabbing group-hover/col:opacity-100'
        )}
        {...attributes}
        {...listeners}
        tabIndex={pinned ? -1 : 0}
      >
        <GripVertical className="size-3.5" />
      </button>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">
        {label}
      </span>
      {pinned ? (
        <span className="pr-1.5 text-[10px] text-muted-foreground">Pinned</span>
      ) : (
        <button
          type="button"
          aria-pressed={visible}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          onClick={onToggle}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          {visible ? (
            <Eye className="size-3.5" />
          ) : (
            <EyeOff className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      )}
    </div>
  );
}

export function ColumnsPopover<T extends string = string>({
  columns,
  visibleColumns,
  onChange,
  children,
  align = 'start',
}: ColumnsPopoverProps<T>) {
  const visibleSet = useMemo(() => new Set(visibleColumns), [visibleColumns]);
  const menuOrder = useMemo(
    () => computeMenuOrder(columns, visibleColumns),
    [columns, visibleColumns]
  );
  const [activeId, setActiveId] = useState<T | null>(null);
  const [query, setQuery] = useState('');
  const filteredOrder = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menuOrder;
    return menuOrder.filter((id) => {
      const column = columns.find((item) => item.id === id);
      return column?.label.toLowerCase().includes(q);
    });
  }, [columns, menuOrder, query]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as T);
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const active = event.active.id as T;
    const over = event.over ? (event.over.id as T) : null;
    if (!over || active === over) return;
    onChange(reorderColumnList(visibleColumns, columns, active, over));
  };

  const activeColumn = activeId
    ? columns.find((c) => c.id === activeId)
    : null;

  const hiddenCount = columns.filter(
    (column) => !column.pinned && !visibleSet.has(column.id)
  ).length;

  return (
    <Popover>
      <HideTrigger hiddenCount={hiddenCount} />
      <PopoverContent align={align} sideOffset={8} className={MENU_PANEL}>
        {children ?? (
          <div className="flex flex-col">
            <MenuSearch
              value={query}
              onChange={setQuery}
              placeholder="Search columns…"
            />
            <MenuSectionLabel>Visible columns</MenuSectionLabel>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragCancel={() => setActiveId(null)}
            >
              <SortableContext
                items={menuOrder}
                strategy={verticalListSortingStrategy}
              >
                {filteredOrder.map((colId) => {
                  const column = columns.find((c) => c.id === colId);
                  if (!column) return null;
                  return (
                    <ColumnRow
                      key={column.id}
                      id={column.id}
                      label={column.label}
                      visible={visibleSet.has(column.id)}
                      pinned={Boolean(column.pinned)}
                      onToggle={() =>
                        onChange(
                          toggleColumnVisibility(visibleColumns, columns, column.id)
                        )
                      }
                    />
                  );
                })}
              </SortableContext>
              <DragOverlay>
                {activeColumn ? (
                  <div className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 shadow-md">
                    <GripVertical className="size-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">{activeColumn.label}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
