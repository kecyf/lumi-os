import {
  normalizeColumnIds,
  type ColumnDef,
} from '@/lib/workspace/column-catalog';
import {
  RECORD_SYSTEM_COLUMNS,
  RECORD_SYSTEM_MIN_WIDTHS,
  RECORD_SYSTEM_WIDTHS,
} from '@/lib/workspace/system-fields';
import type { ObjectDef, PropertyType } from '@/lib/workspace/types';

const TYPE_WIDTH: Record<PropertyType, number> = {
  text: 180,
  email: 200,
  select: 120,
  multi_select: 160,
  date: 130,
  number: 110,
  boolean: 90,
  relation: 180,
  lookup: 160,
};

const TYPE_MIN_WIDTH: Partial<Record<PropertyType, number>> = {
  text: 120,
  email: 120,
  select: 100,
  date: 100,
};

export function buildColumnCatalog(object: ObjectDef): ColumnDef[] {
  const dataColumns = object.fields.map((field) => ({
    id: field.id,
    label: field.id === object.primaryField ? object.name : field.name,
    pinned: field.id === object.primaryField,
    sort: field.sortable ? field.id : null,
  }));
  return [...dataColumns, ...RECORD_SYSTEM_COLUMNS];
}

export function defaultVisibleColumns(object: ObjectDef): string[] {
  return object.fields.map((field) => field.id);
}

export function defaultColumnWidths(object: ObjectDef): Record<string, number> {
  const widths: Record<string, number> = { ...RECORD_SYSTEM_WIDTHS };
  for (const field of object.fields) {
    widths[field.id] = field.id === object.primaryField ? 220 : TYPE_WIDTH[field.type];
  }
  return widths;
}

export function defaultColumnMinWidths(object: ObjectDef): Record<string, number> {
  const widths: Record<string, number> = { ...RECORD_SYSTEM_MIN_WIDTHS };
  for (const field of object.fields) {
    widths[field.id] = TYPE_MIN_WIDTH[field.type] ?? 80;
  }
  return widths;
}

export function normalizeObjectColumns(object: ObjectDef, value: unknown): string[] {
  return normalizeColumnIds(buildColumnCatalog(object), value, defaultVisibleColumns(object));
}
