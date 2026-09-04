'use client';

import type { ComponentProps, ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Modifier } from '@dnd-kit/core';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { cn } from '@/lib/utils';
import type { SortDir } from '@/lib/workspace/views';

export const restrictToHorizontalAxis: Modifier = ({ transform }) => ({
  ...transform,
  y: 0,
});

export function SortMark({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDir;
}) {
  if (!active) {
    return (
      <ArrowUpDown className="size-3 opacity-0 transition-opacity group-hover/th:opacity-40" />
    );
  }
  return direction === 'asc' ? (
    <ArrowUp className="size-3" />
  ) : (
    <ArrowDown className="size-3" />
  );
}

function HeadShell({
  className,
  children,
  trailing,
  isDragging,
  headRef,
  style,
  grip,
  ...props
}: {
  className?: string;
  children: ReactNode;
  trailing?: ReactNode;
  isDragging?: boolean;
  headRef?: (node: HTMLElement | null) => void;
  style?: ComponentProps<'th'>['style'];
  grip?: ReactNode;
} & Omit<ComponentProps<'th'>, 'children' | 'style'>) {
  return (
    <th
      ref={headRef}
      style={style}
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground',
        className,
        isDragging && 'z-30 opacity-40'
      )}
      {...props}
    >
      <div className="flex h-7 min-w-0 items-center gap-0.5 rounded-md px-1.5 transition-colors duration-150 group-hover/th:bg-muted group-hover/th:text-foreground">
        {grip}
        <div className="min-w-0 flex-1 truncate">{children}</div>
      </div>
      {trailing}
    </th>
  );
}

export function SortableHead({
  columnId,
  pinned = false,
  className,
  children,
  trailing,
  ...props
}: {
  columnId: string;
  pinned?: boolean;
  className?: string;
  children: ReactNode;
  trailing?: ReactNode;
} & Omit<ComponentProps<'th'>, 'children'>) {
  const mounted = useHasMounted();
  if (!mounted) {
    return (
      <HeadShell className={className} trailing={trailing} {...props}>
        {children}
      </HeadShell>
    );
  }
  return (
    <SortableHeadLive
      columnId={columnId}
      pinned={pinned}
      className={className}
      trailing={trailing}
      {...props}
    >
      {children}
    </SortableHeadLive>
  );
}

function SortableHeadLive({
  columnId,
  pinned = false,
  className,
  children,
  trailing,
  ...props
}: {
  columnId: string;
  pinned?: boolean;
  className?: string;
  children: ReactNode;
  trailing?: ReactNode;
} & Omit<ComponentProps<'th'>, 'children'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId, disabled: pinned });

  return (
    <HeadShell
      headRef={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? 'transform 200ms ease',
      }}
      className={className}
      isDragging={isDragging}
      trailing={trailing}
      grip={
        pinned ? null : (
          <button
            type="button"
            aria-label="Reorder column"
            className="flex size-4 shrink-0 cursor-grab items-center justify-center text-muted-foreground opacity-0 touch-none hover:text-foreground active:cursor-grabbing group-hover/th:opacity-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3" />
          </button>
        )
      }
      {...props}
    >
      {children}
    </HeadShell>
  );
}
