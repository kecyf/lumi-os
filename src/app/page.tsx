import { WorkspaceApp } from '@/components/workspace/WorkspaceApp';
import { objectById } from '@/lib/workspace/field-tree';
import { loadWorkspace } from '@/lib/workspace/persist';

export const dynamic = 'force-dynamic';

type HomeProps = {
  searchParams: Promise<{ object?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { object: objectParam } = await searchParams;
  const snapshot = await loadWorkspace(objectParam);
  const object = objectById(snapshot.schema, snapshot.objectId);
  const objectId = object?.slug ?? snapshot.objectId;

  return (
    <WorkspaceApp
      schema={snapshot.schema}
      objectId={objectId}
      records={snapshot.records}
      views={snapshot.views}
      persistence={snapshot.source}
    />
  );
}
