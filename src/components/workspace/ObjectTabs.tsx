import Link from 'next/link';
import { cn } from '@/lib/utils';
import { objectIcon } from '@/lib/workspace/object-icons';
import type { WorkspaceSchema } from '@/lib/workspace/types';

export function ObjectTabs({
  schema,
  objectId,
}: {
  schema: WorkspaceSchema;
  objectId: string;
}) {
  return (
    <div className="flex h-14 shrink-0 items-stretch border-b bg-background pr-4">
      <nav
        className="flex h-full items-stretch gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Objects"
      >
        {schema.objects.map((object) => {
          const Icon = objectIcon(object.slug);
          const active = object.slug === objectId || object.id === objectId;
          return (
            <Link
              key={object.id}
              href={`/?object=${encodeURIComponent(object.slug)}`}
              className={cn(
                'group relative flex h-full items-center gap-2 border-b-2 px-3.5 text-sm font-medium transition-colors -mb-px',
                active
                  ? 'border-primary font-semibold text-foreground'
                  : 'border-transparent text-muted-foreground hover:bg-muted/30 hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex size-6 items-center justify-center rounded-md transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
              </span>
              <span>{object.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
