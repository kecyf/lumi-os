'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ObjectDef } from '@/lib/workspace/types';
import type { SavedView, ViewFilters } from '@/lib/workspace/views';
import {
  MENU_PANEL,
  MenuEmpty,
  MenuFooter,
  MenuList,
  MenuRow,
  MenuSearch,
  MenuSectionLabel,
} from './CommandMenu';
import { ViewGlyph } from './ViewGlyph';

const TOOLBAR_BTN = 'h-8 cursor-pointer gap-1.5 rounded-md px-2.5';

export function defaultViewFor(object: ObjectDef): SavedView {
  return {
    id: `all-${object.id}`,
    objectId: object.id,
    name: `All ${object.name.toLowerCase()}`,
    filters: {},
    visibility: 'collaborative',
    icon: 'layout-grid',
    iconColor: 'emerald',
  };
}

export function ViewPicker({
  object,
  views,
  activeViewId,
  currentFilters,
  onSelect,
  onCreate,
}: {
  object: ObjectDef;
  views: SavedView[];
  activeViewId: string;
  currentFilters: ViewFilters;
  onSelect: (view: SavedView) => void;
  onCreate: (view: SavedView) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);
  const [draftName, setDraftName] = useState('');

  const fallback = defaultViewFor(object);
  const catalog = useMemo(() => {
    const extras = views.filter((view) => view.id !== fallback.id);
    return [fallback, ...extras];
  }, [fallback, views]);

  const active = catalog.find((view) => view.id === activeViewId) ?? fallback;
  const filtered = catalog.filter((view) =>
    view.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const submitView = () => {
    const name = draftName.trim() || 'Untitled view';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'view';
    onCreate({
      id: `${object.id}-${slug}-${Date.now()}`,
      objectId: object.id,
      name,
      filters: currentFilters,
      visibility: 'personal',
      icon: 'layout-grid',
      iconColor: 'emerald',
    });
    setSaveOpen(false);
    setDraftName('');
    setOpen(false);
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery('');
        }}
      >
        <PopoverTrigger
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className: TOOLBAR_BTN,
          })}
        >
          <ViewGlyph icon={active.icon} color={active.iconColor} />
          <span className="max-w-48 truncate">{active.name}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={8}
          className={MENU_PANEL}
        >
          <MenuSearch
            value={query}
            onChange={setQuery}
            placeholder="Search a view…"
          />
          <MenuList>
            {filtered.length === 0 ? (
              <MenuEmpty>No views</MenuEmpty>
            ) : (
              <>
                <MenuSectionLabel>Workspace</MenuSectionLabel>
                {filtered.map((view) => (
                  <MenuRow
                    key={view.id}
                    icon={<ViewGlyph icon={view.icon} color={view.iconColor} />}
                    label={view.name}
                    active={view.id === active.id}
                    trailing={
                      view.id === active.id ? (
                        <Check className="size-3.5 text-foreground" />
                      ) : undefined
                    }
                    onClick={() => {
                      onSelect(view);
                      setOpen(false);
                    }}
                  />
                ))}
              </>
            )}
          </MenuList>
          <MenuFooter>
            <MenuRow
              icon={<Plus className="size-3.5" />}
              label="Create a new view"
              onClick={() => {
                setDraftName('');
                setSaveOpen(true);
              }}
            />
          </MenuFooter>
        </PopoverContent>
      </Popover>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create a new view</DialogTitle>
            <DialogDescription>
              Save the current filters, sort, and columns for {object.name.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="View name"
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitView();
            }}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitView}>
              Save view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
