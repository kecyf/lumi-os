'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import {
  fieldPathLabel,
  resolveFieldPath,
} from '@/lib/workspace/field-tree';
import { defaultSortDirForPath } from '@/lib/workspace/query-clauses';
import type { WorkspaceSchema } from '@/lib/workspace/types';
import { SortTrigger } from './ToolbarTriggers';
import { FieldPicker } from './FieldPicker';
import { FieldGlyph } from './FieldGlyph';
import {
  MENU_PANEL,
  MenuFooter,
  MenuList,
  MenuRow,
} from './CommandMenu';
import { cn } from '@/lib/utils';

export function SortPopover({
  schema,
  objectId,
  sort,
  sortDir,
  defaultSort,
  defaultDir = 'desc',
  onSortChange,
  onDirChange,
}: {
  schema: WorkspaceSchema;
  objectId: string;
  sort: string;
  sortDir: 'asc' | 'desc';
  defaultSort: string;
  defaultDir?: 'asc' | 'desc';
  onSortChange: (value: string) => void;
  onDirChange: (dir: 'asc' | 'desc') => void;
}) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const isSorted = sort !== defaultSort || sortDir !== defaultDir;
  const resolved = resolveFieldPath(schema, objectId, sort);
  const sortLabel = resolved ? fieldPathLabel(schema, objectId, sort) : sort;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setPicking(!isSorted);
      }}
    >
      <SortTrigger
        label={isSorted ? `${sortLabel} · ${sortDir === 'asc' ? '↑' : '↓'}` : 'Sort'}
        isSorted={isSorted}
        onClear={() => {
          onSortChange(defaultSort);
          onDirChange(defaultDir);
        }}
      />
      <PopoverContent align="start" sideOffset={8} className={MENU_PANEL}>
        {picking ? (
          <FieldPicker
            schema={schema}
            objectId={objectId}
            mode="sort"
            onSelect={(path) => {
              onSortChange(path);
              onDirChange(defaultSortDirForPath(schema, objectId, path));
              setPicking(false);
            }}
          />
        ) : (
          <div>
            <MenuList>
              <MenuRow
                icon={
                  resolved ? (
                    <FieldGlyph icon={resolved.field.icon} />
                  ) : undefined
                }
                label={sortLabel}
                chevron
                onClick={() => setPicking(true)}
              />
            </MenuList>
            <div className="grid grid-cols-2 gap-1 px-2 pb-2">
              {(['asc', 'desc'] as const).map((dir) => {
                const active = sortDir === dir;
                return (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => onDirChange(dir)}
                    className={cn(
                      'flex h-8 items-center justify-center gap-1.5 rounded-md text-xs',
                      active
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {dir === 'asc' ? (
                      <ArrowUp className="size-3.5" />
                    ) : (
                      <ArrowDown className="size-3.5" />
                    )}
                    {dir === 'asc' ? 'Ascending' : 'Descending'}
                  </button>
                );
              })}
            </div>
            <MenuFooter>
              <MenuRow
                label="Change field"
                chevron
                onClick={() => setPicking(true)}
              />
            </MenuFooter>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
