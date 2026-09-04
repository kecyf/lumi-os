'use client';

import { useEffect, useState } from 'react';
import { createRecordAction, saveViewsAction } from '@/app/actions/workspace';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { objectById } from '@/lib/workspace/field-tree';
import type { PersistenceSource } from '@/lib/workspace/persist';
import type { WorkspaceRecord, WorkspaceSchema } from '@/lib/workspace/types';
import type { SavedView } from '@/lib/workspace/views';
import { CommandPalette } from './CommandPalette';
import { CreateRecordDialog } from './CreateRecordDialog';
import { GridHub } from './GridHub';
import { ObjectTabs } from './ObjectTabs';

export function WorkspaceApp({
  schema,
  objectId,
  records: initialRecords,
  views: initialViews,
  persistence = 'demo',
}: {
  schema: WorkspaceSchema;
  objectId: string;
  records: WorkspaceRecord[];
  views: SavedView[];
  persistence?: PersistenceSource;
}) {
  const object = objectById(schema, objectId);
  const mounted = useHasMounted();
  const [records, setRecords] = useState(initialRecords);
  const [views, setViews] = useState(initialViews);
  const [createOpen, setCreateOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    setRecords(initialRecords);
    setViews(initialViews);
  }, [initialRecords, initialViews, objectId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <ObjectTabs schema={schema} objectId={objectId} />
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {object ? (
          <GridHub
            schema={schema}
            objectId={objectId}
            records={records}
            views={views}
            onViewsChange={(next) => {
              setViews(next);
              if (persistence === 'supabase') {
                void saveViewsAction(objectId, next);
              }
            }}
            onCreate={() => setCreateOpen(true)}
            onOpenCommand={() => setCommandOpen(true)}
          />
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground">Object not found.</p>
        )}
      </div>
      {object ? (
        <CreateRecordDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          object={object}
          onCreate={(record) => {
            if (persistence !== 'supabase') {
              setRecords((current) => [record, ...current]);
              return;
            }
            void createRecordAction(objectId, record.values).then((result) => {
              if (!result.ok) return;
              setRecords((current) => [result.record, ...current]);
            });
          }}
        />
      ) : null}
      {mounted ? (
        <CommandPalette
          open={commandOpen}
          onOpenChange={setCommandOpen}
          schema={schema}
          objectId={objectId}
          onCreate={() => setCreateOpen(true)}
        />
      ) : null}
    </div>
  );
}
