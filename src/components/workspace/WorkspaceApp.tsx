'use client';

import { useEffect, useState } from 'react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { objectById } from '@/lib/workspace/field-tree';
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
}: {
  schema: WorkspaceSchema;
  objectId: string;
  records: WorkspaceRecord[];
  views: SavedView[];
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
            onViewsChange={setViews}
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
          onCreate={(record) => setRecords((current) => [record, ...current])}
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
