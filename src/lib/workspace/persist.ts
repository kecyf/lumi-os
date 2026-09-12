import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { DEMO_COMPANY_RECORDS, DEMO_PEOPLE_RECORDS } from './demo-records';
import { DEMO_SCHEMA } from './demo-schema';
import { DEMO_VIEWS } from './demo-views';
import { objectById } from './field-tree';
import type { ObjectDef, PropertyDef, PropertyOption, PropertyType, WorkspaceRecord, WorkspaceSchema } from './types';
import {
  parseClauses,
  type WorkspaceQuerySort,
} from './query-clauses';
import type { SavedView, ViewFilters, ViewVisibility } from './views';

export const PROPERTY_TYPES = [
  'text',
  'email',
  'select',
  'multi_select',
  'date',
  'number',
  'boolean',
  'relation',
  'lookup',
] as const satisfies readonly PropertyType[];

export type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
};

export type ObjectRow = {
  id: string;
  workspace_id: string;
  slug: string;
  name: string;
  primary_property: string;
};

export type PropertyRow = {
  id: string;
  object_id: string;
  slug: string;
  name: string;
  type: string;
  options: unknown;
  relation_object_id: string | null;
  position: number;
};

export type RecordRow = {
  id: string;
  object_id: string;
  values: unknown;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type ViewRow = {
  id: string;
  object_id: string;
  name: string;
  filters: unknown;
  visibility: string | null;
  owner_id: string | null;
  icon: string | null;
  icon_color: string | null;
  position: number;
};

export type PersistenceSource = 'supabase' | 'demo';

export type WorkspaceSnapshot = {
  schema: WorkspaceSchema;
  objectId: string;
  records: WorkspaceRecord[];
  views: SavedView[];
  source: PersistenceSource;
};

export function isPropertyType(value: string): value is PropertyType {
  return (PROPERTY_TYPES as readonly string[]).includes(value);
}

function asOptions(value: unknown): PropertyOption[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const options = value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as { value?: unknown; label?: unknown };
    if (typeof row.value !== 'string' || typeof row.label !== 'string') return [];
    return [{ value: row.value, label: row.label }];
  });
  return options.length > 0 ? options : undefined;
}

function asValues(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asVisibility(value: string | null | undefined): ViewVisibility {
  if (value === 'personal' || value === 'collaborative' || value === 'locked') {
    return value;
  }
  return 'personal';
}

function asFilters(value: unknown): ViewFilters {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const row = value as {
    clauses?: unknown;
    sorts?: unknown;
    columns?: unknown;
  };
  const sorts = Array.isArray(row.sorts)
    ? row.sorts.filter((item): item is WorkspaceQuerySort => {
        if (!item || typeof item !== 'object') return false;
        const sort = item as { path?: unknown; dir?: unknown };
        return typeof sort.path === 'string' && (sort.dir === 'asc' || sort.dir === 'desc');
      })
    : undefined;
  const columns = Array.isArray(row.columns)
    ? row.columns.filter((item): item is string => typeof item === 'string')
    : undefined;
  return {
    clauses: parseClauses(row.clauses),
    sorts,
    columns,
  };
}

export function schemaFromRows(
  workspace: WorkspaceRow,
  objects: ObjectRow[],
  properties: PropertyRow[]
): WorkspaceSchema {
  const propertiesByObject = new Map<string, PropertyRow[]>();
  for (const property of properties) {
    const current = propertiesByObject.get(property.object_id) ?? [];
    current.push(property);
    propertiesByObject.set(property.object_id, current);
  }

  const objectByUuid = new Map(objects.map((object) => [object.id, object]));

  return {
    workspace: { id: workspace.slug, name: workspace.name },
    objects: objects.map((object) => {
      const fields: PropertyDef[] = (propertiesByObject.get(object.id) ?? [])
        .slice()
        .sort((left, right) => left.position - right.position)
        .flatMap((property) => {
          if (!isPropertyType(property.type)) return [];
          const related = property.relation_object_id
            ? objectByUuid.get(property.relation_object_id)
            : undefined;
          return [
            {
              id: property.slug,
              name: property.name,
              type: property.type,
              filterable: true,
              sortable: true,
              options: asOptions(property.options),
              relation: related?.slug,
            },
          ];
        });

      return {
        id: object.slug,
        name: object.name,
        slug: object.slug,
        primaryField: object.primary_property,
        fields,
      };
    }),
  };
}

export function recordFromRow(row: RecordRow): WorkspaceRecord {
  return {
    id: row.id,
    values: asValues(row.values),
    created_at: row.created_at,
    updated_at: row.updated_at,
    archived_at: row.archived_at,
  };
}

export function viewFromRow(row: ViewRow, objectSlug: string): SavedView {
  return {
    id: row.id,
    objectId: objectSlug,
    name: row.name,
    filters: asFilters(row.filters),
    visibility: asVisibility(row.visibility),
    ownerEmail: null,
    icon: row.icon ?? undefined,
    iconColor: row.icon_color ?? undefined,
  };
}

function demoSnapshot(objectParam?: string): WorkspaceSnapshot {
  const requested = objectParam ? objectById(DEMO_SCHEMA, objectParam) : null;
  const objectId = requested?.slug ?? 'people';
  return {
    schema: DEMO_SCHEMA,
    objectId,
    records: objectId === 'companies' ? DEMO_COMPANY_RECORDS : DEMO_PEOPLE_RECORDS,
    views: DEMO_VIEWS.filter((view) => view.objectId === objectId),
    source: 'demo',
  };
}

async function seedDemoWorkspace(
  client: NonNullable<ReturnType<typeof createAdminClient>>
): Promise<void> {
  const { data: workspace, error: workspaceError } = await client
    .from('workspaces')
    .insert({ name: DEMO_SCHEMA.workspace.name, slug: DEMO_SCHEMA.workspace.id })
    .select('id')
    .single();
  if (workspaceError || !workspace) {
    throw new Error(workspaceError?.message ?? 'Failed to seed workspace');
  }

  const objectIds = new Map<string, string>();
  for (const object of DEMO_SCHEMA.objects) {
    const { data, error } = await client
      .from('workspace_objects')
      .insert({
        workspace_id: workspace.id,
        slug: object.slug,
        name: object.name,
        primary_property: object.primaryField,
      })
      .select('id')
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? `Failed to seed object ${object.slug}`);
    }
    objectIds.set(object.slug, data.id);
  }

  for (const object of DEMO_SCHEMA.objects) {
    const objectId = objectIds.get(object.slug);
    if (!objectId) continue;
    const rows = object.fields.map((field, position) => ({
      object_id: objectId,
      slug: field.id,
      name: field.name,
      type: field.type,
      options: field.options ?? [],
      relation_object_id: field.relation ? objectIds.get(field.relation) ?? null : null,
      position,
    }));
    const { error } = await client.from('workspace_properties').insert(rows);
    if (error) throw new Error(error.message);
  }

  const recordSets: Array<{ slug: string; records: WorkspaceRecord[] }> = [
    { slug: 'people', records: DEMO_PEOPLE_RECORDS },
    { slug: 'companies', records: DEMO_COMPANY_RECORDS },
  ];
  for (const { slug, records } of recordSets) {
    const objectId = objectIds.get(slug);
    if (!objectId) continue;
    const { error } = await client.from('workspace_records').insert(
      records.map((record) => ({
        object_id: objectId,
        values: record.values,
        created_at: record.created_at,
        updated_at: record.updated_at,
        archived_at: record.archived_at ?? null,
      }))
    );
    if (error) throw new Error(error.message);
  }

  for (const [index, view] of DEMO_VIEWS.entries()) {
    const objectId = objectIds.get(view.objectId);
    if (!objectId) continue;
    const { error } = await client.from('workspace_views').insert({
      object_id: objectId,
      name: view.name,
      kind: 'grid',
      filters: view.filters,
      visibility: view.visibility ?? 'collaborative',
      owner_id: null,
      icon: view.icon ?? null,
      icon_color: view.iconColor ?? null,
      position: index,
    });
    if (error) throw new Error(error.message);
  }
}

export async function loadWorkspace(objectParam?: string): Promise<WorkspaceSnapshot> {
  if (!isSupabaseConfigured()) return demoSnapshot(objectParam);

  const client = createAdminClient();
  if (!client) return demoSnapshot(objectParam);

  try {
    const { data: existing, error: existingError } = await client
      .from('workspaces')
      .select('id, name, slug')
      .order('created_at', { ascending: true })
      .limit(1);
    if (existingError) throw new Error(existingError.message);

    if (!existing || existing.length === 0) {
      await seedDemoWorkspace(client);
    }

    const { data: workspace, error: workspaceError } = await client
      .from('workspaces')
      .select('id, name, slug')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    if (workspaceError || !workspace) {
      throw new Error(workspaceError?.message ?? 'Workspace missing after seed');
    }

    const { data: objects, error: objectsError } = await client
      .from('workspace_objects')
      .select('id, workspace_id, slug, name, primary_property')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: true });
    if (objectsError) throw new Error(objectsError.message);

    const objectRows = (objects ?? []) as ObjectRow[];
    const objectUuids = objectRows.map((object) => object.id);

    const { data: properties, error: propertiesError } = await client
      .from('workspace_properties')
      .select('id, object_id, slug, name, type, options, relation_object_id, position')
      .in('object_id', objectUuids.length > 0 ? objectUuids : ['00000000-0000-0000-0000-000000000000']);
    if (propertiesError) throw new Error(propertiesError.message);

    const schema = schemaFromRows(workspace as WorkspaceRow, objectRows, (properties ?? []) as PropertyRow[]);
    const requested = objectParam ? objectById(schema, objectParam) : null;
    const objectId = requested?.slug ?? schema.objects[0]?.slug ?? 'people';
    const objectRow = objectRows.find((object) => object.slug === objectId);

    if (!objectRow) {
      return { schema, objectId, records: [], views: [], source: 'supabase' };
    }

    const { data: records, error: recordsError } = await client
      .from('workspace_records')
      .select('id, object_id, values, created_at, updated_at, archived_at')
      .eq('object_id', objectRow.id)
      .is('archived_at', null)
      .order('created_at', { ascending: false });
    if (recordsError) throw new Error(recordsError.message);

    const { data: views, error: viewsError } = await client
      .from('workspace_views')
      .select('id, object_id, name, filters, visibility, owner_id, icon, icon_color, position')
      .eq('object_id', objectRow.id)
      .order('position', { ascending: true });
    if (viewsError) throw new Error(viewsError.message);

    return {
      schema,
      objectId,
      records: ((records ?? []) as RecordRow[]).map(recordFromRow),
      views: ((views ?? []) as ViewRow[]).map((row) => viewFromRow(row, objectId)),
      source: 'supabase',
    };
  } catch (error) {
    console.error('Supabase workspace load failed; using demo data.', error);
    return demoSnapshot(objectParam);
  }
}

export async function insertRecord(
  objectSlug: string,
  values: Record<string, unknown>
): Promise<WorkspaceRecord> {
  const client = createAdminClient();
  if (!client) throw new Error('Supabase is not configured');

  const { data: object, error: objectError } = await client
    .from('workspace_objects')
    .select('id')
    .eq('slug', objectSlug)
    .limit(1)
    .single();
  if (objectError || !object) {
    throw new Error(objectError?.message ?? `Unknown object ${objectSlug}`);
  }

  const { data, error } = await client
    .from('workspace_records')
    .insert({ object_id: object.id, values })
    .select('id, object_id, values, created_at, updated_at, archived_at')
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create record');
  }
  return recordFromRow(data as RecordRow);
}

export async function replaceViews(
  objectSlug: string,
  views: SavedView[]
): Promise<SavedView[]> {
  const client = createAdminClient();
  if (!client) throw new Error('Supabase is not configured');

  const { data: object, error: objectError } = await client
    .from('workspace_objects')
    .select('id')
    .eq('slug', objectSlug)
    .limit(1)
    .single();
  if (objectError || !object) {
    throw new Error(objectError?.message ?? `Unknown object ${objectSlug}`);
  }

  const incomingIds = views.map((view) => view.id);
  let deleteQuery = client.from('workspace_views').delete().eq('object_id', object.id);
  if (incomingIds.length > 0) {
    deleteQuery = deleteQuery.not('id', 'in', `(${incomingIds.join(',')})`);
  }
  const { error: deleteError } = await deleteQuery;
  if (deleteError) throw new Error(deleteError.message);

  if (views.length === 0) return [];

  const { data, error } = await client
    .from('workspace_views')
    .upsert(
      views.map((view, position) => ({
        id: view.id,
        object_id: object.id,
        name: view.name,
        kind: 'grid',
        filters: view.filters,
        visibility: view.visibility ?? 'collaborative',
        owner_id: null,
        icon: view.icon ?? null,
        icon_color: view.iconColor ?? null,
        position,
      })),
      { onConflict: 'id' }
    )
    .select('id, object_id, name, filters, visibility, owner_id, icon, icon_color, position')
    .order('position', { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as ViewRow[]).map((row) => viewFromRow(row, objectSlug));
}
