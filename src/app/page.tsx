import { GridHub } from '@/components/workspace/GridHub';
import { DEMO_PEOPLE_RECORDS } from '@/lib/workspace/demo-records';
import { DEMO_SCHEMA, PEOPLE_OBJECT_ID } from '@/lib/workspace/demo-schema';
import { objectById } from '@/lib/workspace/field-tree';

export default function Home() {
  const object = objectById(DEMO_SCHEMA, PEOPLE_OBJECT_ID);

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-4 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Lumi OS</h1>
          <span className="text-sm text-muted-foreground">
            {object?.name ?? 'Workspace'}
          </span>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <GridHub
          schema={DEMO_SCHEMA}
          objectId={PEOPLE_OBJECT_ID}
          records={DEMO_PEOPLE_RECORDS}
        />
      </main>
    </div>
  );
}
