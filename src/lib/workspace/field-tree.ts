import type { ObjectDef, PropertyDef, PropertyType, WorkspaceSchema } from './types';

export type ObjectId = string;

export type FieldType = PropertyType;

export type FieldIconId =
  | 'hash'
  | 'text'
  | 'mail'
  | 'user'
  | 'building'
  | 'briefcase'
  | 'phone'
  | 'tag'
  | 'globe'
  | 'flag'
  | 'calendar'
  | 'coins'
  | 'inbox'
  | 'deal'
  | 'list'
  | 'shop'
  | 'circle';

export type FieldOption = {
  value: string;
  label: string;
};

export type FieldDef = {
  id: string;
  label: string;
  icon: FieldIconId;
  type: FieldType;
  filterable?: boolean;
  sortable?: boolean;
  options?: readonly FieldOption[];
  relation?: ObjectId;
};

const ICON_BY_TYPE: Record<PropertyType, FieldIconId> = {
  text: 'text',
  email: 'mail',
  select: 'circle',
  multi_select: 'tag',
  date: 'calendar',
  number: 'hash',
  boolean: 'circle',
  relation: 'user',
  lookup: 'text',
};

function propertyToField(property: PropertyDef): FieldDef {
  return {
    id: property.id,
    label: property.name,
    icon: ICON_BY_TYPE[property.type],
    type: property.type,
    filterable: property.filterable,
    sortable: property.sortable,
    options: property.options,
    relation: property.relation,
  };
}

export function objectById(
  schema: WorkspaceSchema,
  objectId: ObjectId
): ObjectDef | undefined {
  return schema.objects.find(
    (object) => object.id === objectId || object.slug === objectId
  );
}

export function entityFields(
  schema: WorkspaceSchema,
  objectId: ObjectId
): readonly FieldDef[] {
  const object = objectById(schema, objectId);
  if (!object) return [];
  return object.fields.map(propertyToField);
}

export function isWritableField(field: FieldDef): boolean {
  return field.type !== 'relation' && field.type !== 'lookup';
}

export function asLookupField(field: FieldDef): FieldDef {
  if (field.type === 'lookup') return field;
  return {
    ...field,
    type: 'lookup',
    filterable: field.filterable,
    sortable: field.sortable,
  };
}

export function fieldById(
  schema: WorkspaceSchema,
  objectId: ObjectId,
  id: string
): FieldDef | undefined {
  return entityFields(schema, objectId).find((field) => field.id === id);
}

export function resolveFieldPath(
  schema: WorkspaceSchema,
  objectId: ObjectId,
  path: string
): { objectId: ObjectId; field: FieldDef; trail: FieldDef[] } | null {
  const parts = path.split('.').filter(Boolean);
  if (parts.length === 0) return null;

  let current = objectId;
  const trail: FieldDef[] = [];

  for (let index = 0; index < parts.length; index += 1) {
    const field = fieldById(schema, current, parts[index]);
    if (!field) return null;
    trail.push(field);
    if (index === parts.length - 1) {
      return { objectId: current, field, trail };
    }
    if (field.type !== 'relation' || !field.relation) return null;
    current = field.relation;
  }

  return null;
}

export function childFieldCount(schema: WorkspaceSchema, objectId: ObjectId): number {
  return entityFields(schema, objectId).length;
}

export function joinFieldPath(parent: string, id: string): string {
  return parent ? `${parent}.${id}` : id;
}

export function parentFieldPath(path: string): string {
  const parts = path.split('.');
  parts.pop();
  return parts.join('.');
}

export function fieldPathLabel(
  schema: WorkspaceSchema,
  objectId: ObjectId,
  path: string
): string {
  const resolved = resolveFieldPath(schema, objectId, path);
  if (!resolved) return path;
  return resolved.trail.map((field) => field.label).join(' · ');
}

export function objectLabel(schema: WorkspaceSchema, objectId: ObjectId): string {
  return objectById(schema, objectId)?.name.toLowerCase() ?? 'record';
}

export type FlatField = {
  path: string;
  field: FieldDef;
  trail: FieldDef[];
};

export function flattenFields(
  schema: WorkspaceSchema,
  objectId: ObjectId,
  mode: 'filter' | 'sort',
  parentPath = '',
  visited: ObjectId[] = [],
  maxDepth = 1
): FlatField[] {
  if (visited.includes(objectId)) return [];
  const nextVisited = [...visited, objectId];
  const depth = visited.length;
  const rows: FlatField[] = [];

  for (const field of entityFields(schema, objectId)) {
    const path = joinFieldPath(parentPath, field.id);
    const allowed = mode === 'sort' ? field.sortable : field.filterable;
    if (allowed) {
      rows.push({ path, field, trail: [field] });
    }
    if (
      depth < maxDepth &&
      field.type === 'relation' &&
      field.relation &&
      !nextVisited.includes(field.relation)
    ) {
      for (const child of flattenFields(
        schema,
        field.relation,
        mode,
        path,
        nextVisited,
        maxDepth
      )) {
        rows.push({
          path: child.path,
          field: asLookupField(child.field),
          trail: [field, ...child.trail],
        });
      }
    }
  }

  return rows;
}

export function lookupFields(
  schema: WorkspaceSchema,
  objectId: ObjectId,
  mode: 'filter' | 'sort' = 'filter'
): FlatField[] {
  return flattenFields(schema, objectId, mode).filter((row) => row.path.includes('.'));
}
