import { resolveFieldPath } from '@/lib/workspace/field-tree';
import {
  asStringList,
  clauseNeedsValue,
  type WorkspaceQueryClause,
  type WorkspaceQuerySort,
} from '@/lib/workspace/query-clauses';
import type { WorkspaceRecord, WorkspaceSchema } from '@/lib/workspace/types';

function readValue(record: WorkspaceRecord, path: string): unknown {
  if (path === 'created_at') return record.created_at ?? null;
  if (path === 'updated_at') return record.updated_at ?? null;
  if (path === 'archived_at') return record.archived_at ?? null;
  const parts = path.split('.');
  let current: unknown = record.values;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[part];
  }
  return current ?? null;
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }

  const aDate = Date.parse(String(a));
  const bDate = Date.parse(String(b));
  if (!Number.isNaN(aDate) && !Number.isNaN(bDate)) {
    return aDate - bDate;
  }

  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' });
}

function matchesClause(
  schema: WorkspaceSchema,
  objectId: string,
  record: WorkspaceRecord,
  clause: WorkspaceQueryClause
): boolean {
  const resolved = resolveFieldPath(schema, objectId, clause.path);
  const value = readValue(record, clause.path);

  switch (clause.op) {
    case 'empty':
      return isEmpty(value);
    case 'not_empty':
      return !isEmpty(value);
    case 'contains': {
      if (clauseNeedsValue(clause.op) && clause.value == null) return true;
      const hay = String(value ?? '').toLowerCase();
      const needle = String(clause.value ?? '').toLowerCase();
      return hay.includes(needle);
    }
    case 'eq': {
      if (resolved?.field.type === 'boolean') {
        return value === clause.value;
      }
      return String(value ?? '') === String(clause.value ?? '');
    }
    case 'in': {
      const selected = asStringList(clause.value);
      if (selected.length === 0) return true;
      if (Array.isArray(value)) {
        return selected.some((item) =>
          value.map(String).some((entry) => entry.toLowerCase() === item.toLowerCase())
        );
      }
      return selected.some(
        (item) => String(value ?? '').toLowerCase() === item.toLowerCase()
      );
    }
    case 'gt':
    case 'gte':
    case 'lt':
    case 'lte': {
      const numeric =
        typeof value === 'number' ? value : Number(String(value ?? ''));
      const target =
        typeof clause.value === 'number'
          ? clause.value
          : Number(String(clause.value ?? ''));
      if (!Number.isFinite(numeric) || !Number.isFinite(target)) {
        const cmp = compareValues(value, clause.value);
        if (clause.op === 'gt') return cmp > 0;
        if (clause.op === 'gte') return cmp >= 0;
        if (clause.op === 'lt') return cmp < 0;
        return cmp <= 0;
      }
      if (clause.op === 'gt') return numeric > target;
      if (clause.op === 'gte') return numeric >= target;
      if (clause.op === 'lt') return numeric < target;
      return numeric <= target;
    }
    default:
      return true;
  }
}

export function filterRecords(
  schema: WorkspaceSchema,
  objectId: string,
  records: WorkspaceRecord[],
  clauses: readonly WorkspaceQueryClause[]
): WorkspaceRecord[] {
  if (clauses.length === 0) return records;
  return records.filter((record) =>
    clauses.every((clause) => matchesClause(schema, objectId, record, clause))
  );
}

export function sortRecords(
  records: WorkspaceRecord[],
  sort: WorkspaceQuerySort | null
): WorkspaceRecord[] {
  if (!sort?.path) return records;
  const dir = sort.dir === 'asc' ? 1 : -1;
  return [...records].sort((left, right) => {
    const cmp = compareValues(readValue(left, sort.path), readValue(right, sort.path));
    return cmp * dir;
  });
}

export function searchRecords(
  records: WorkspaceRecord[],
  query: string
): WorkspaceRecord[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return records;
  return records.filter((record) => {
    const haystack = [
      record.id,
      ...Object.values(record.values).map((value) => String(value ?? '')),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function queryRecords(
  schema: WorkspaceSchema,
  objectId: string,
  records: WorkspaceRecord[],
  clauses: readonly WorkspaceQueryClause[],
  sort: WorkspaceQuerySort | null,
  search = ''
): WorkspaceRecord[] {
  return sortRecords(
    searchRecords(filterRecords(schema, objectId, records, clauses), search),
    sort
  );
}
