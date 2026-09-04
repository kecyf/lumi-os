import { WorkspaceApp } from '@/components/workspace/WorkspaceApp';
import { demoRecordsFor } from '@/lib/workspace/demo-records';
import { DEMO_SCHEMA, PEOPLE_OBJECT_ID } from '@/lib/workspace/demo-schema';
import { demoViewsFor } from '@/lib/workspace/demo-views';
import { objectById } from '@/lib/workspace/field-tree';

type HomeProps = {
  searchParams: Promise<{ object?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { object: objectParam } = await searchParams;
  const requested = objectParam ? objectById(DEMO_SCHEMA, objectParam) : null;
  const objectId = requested?.slug ?? PEOPLE_OBJECT_ID;

  return (
    <WorkspaceApp
      schema={DEMO_SCHEMA}
      objectId={objectId}
      records={demoRecordsFor(objectId)}
      views={demoViewsFor(objectId)}
    />
  );
}
