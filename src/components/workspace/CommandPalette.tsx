'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { objectIcon } from '@/lib/workspace/object-icons';
import type { WorkspaceSchema } from '@/lib/workspace/types';

export function CommandPalette({
  open,
  onOpenChange,
  schema,
  objectId,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: WorkspaceSchema;
  objectId: string;
  onCreate: () => void;
}) {
  const router = useRouter();

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Switch objects or create a record"
    >
      <Command>
        <CommandInput placeholder="Search objects and actions…" />
        <CommandList>
          <CommandEmpty>No results</CommandEmpty>
          <CommandGroup heading="Objects">
            {schema.objects.map((object) => {
              const Icon = objectIcon(object.slug);
              return (
                <CommandItem
                  key={object.id}
                  value={object.name}
                  data-checked={object.slug === objectId || object.id === objectId}
                  onSelect={() => {
                    router.push(`/?object=${encodeURIComponent(object.slug)}`);
                    onOpenChange(false);
                  }}
                >
                  <Icon className="size-4" />
                  <span>Go to {object.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="new record"
              onSelect={() => {
                onOpenChange(false);
                onCreate();
              }}
            >
              <Plus className="size-4" />
              <span>New record</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
