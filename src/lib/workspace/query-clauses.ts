import {
  fieldPathLabel,
  resolveFieldPath,
  type FieldDef,
  type FieldType,
} from '@/lib/workspace/field-tree';
import type { WorkspaceSchema } from '@/lib/workspace/types';

export const WORKSPACE_CLAUSE_OPS = [
  'contains',
  'eq',
  'in',
  'empty',
  'not_empty',
  'gt',
  'gte',
  'lt',
  'lte',
] as const;

export type WorkspaceClauseOp = (typeof WORKSPACE_CLAUSE_OPS)[number];

export type WorkspaceQueryClause = {
  path: string;
  op: WorkspaceClauseOp;
  value?: string | string[] | number | boolean | null;
};

export type WorkspaceQuerySort = {
  path: string;
  dir: 'asc' | 'desc';
};

const OP_LABELS: Record<WorkspaceClauseOp, string> = {
  contains: 'contains',
  eq: 'equals',
  in: 'is any of',
  empty: 'is empty',
  not_empty: 'is not empty',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
};

export function defaultClauseOp(type: FieldType): WorkspaceClauseOp {
  switch (type) {
    case 'text':
    case 'email':
      return 'contains';
    case 'select':
    case 'multi_select':
      return 'in';
    case 'boolean':
      return 'eq';
    case 'date':
    case 'number':
      return 'gte';
    case 'relation':
      return 'not_empty';
    case 'lookup':
      return 'contains';
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function opsForField(field: FieldDef): WorkspaceClauseOp[] {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'lookup':
      return ['contains', 'eq', 'empty', 'not_empty'];
    case 'select':
    case 'multi_select':
      return ['in', 'empty', 'not_empty'];
    case 'date':
      return ['gte', 'lte', 'eq', 'empty', 'not_empty'];
    case 'number':
      return ['gte', 'lte', 'eq', 'gt', 'lt', 'empty', 'not_empty'];
    case 'boolean':
      return ['eq', 'empty', 'not_empty'];
    case 'relation':
      return ['not_empty', 'empty'];
    default: {
      const _exhaustive: never = field.type;
      return _exhaustive;
    }
  }
}

export function clauseOpLabel(op: WorkspaceClauseOp): string {
  return OP_LABELS[op];
}

export function clauseNeedsValue(op: WorkspaceClauseOp): boolean {
  return op !== 'empty' && op !== 'not_empty';
}

export function isWorkspaceClauseOp(value: unknown): value is WorkspaceClauseOp {
  return (
    typeof value === 'string' &&
    (WORKSPACE_CLAUSE_OPS as readonly string[]).includes(value)
  );
}

export function parseClauses(value: unknown): WorkspaceQueryClause[] {
  if (typeof value === 'string') {
    try {
      return parseClauses(JSON.parse(value));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(value)) return [];
  const clauses: WorkspaceQueryClause[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (typeof row.path !== 'string' || !row.path.trim()) continue;
    if (!isWorkspaceClauseOp(row.op)) continue;
    clauses.push({
      path: row.path,
      op: row.op,
      value: (row.value as WorkspaceQueryClause['value']) ?? null,
    });
  }
  return clauses;
}

export function serializeClauses(
  clauses: readonly WorkspaceQueryClause[]
): string | undefined {
  if (clauses.length === 0) return undefined;
  return JSON.stringify(clauses);
}

export function sameClauses(
  left: readonly WorkspaceQueryClause[] | undefined,
  right: readonly WorkspaceQueryClause[] | undefined
): boolean {
  const a = left ?? [];
  const b = right ?? [];
  if (a.length !== b.length) return false;
  return a.every((clause, index) => {
    const other = b[index];
    return (
      clause.path === other.path &&
      clause.op === other.op &&
      JSON.stringify(clause.value ?? null) === JSON.stringify(other.value ?? null)
    );
  });
}

export function clauseValueLabel(value: WorkspaceQueryClause['value']): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  if (value == null || value === '') return '';
  return String(value);
}

export function clauseSummary(
  schema: WorkspaceSchema,
  objectId: string,
  clause: WorkspaceQueryClause
): string {
  const field = fieldPathLabel(schema, objectId, clause.path);
  if (!clauseNeedsValue(clause.op)) {
    return `${field} · ${clauseOpLabel(clause.op)}`;
  }
  const value = clauseValueLabel(clause.value);
  return value
    ? `${field} · ${clauseOpLabel(clause.op)} ${value}`
    : `${field} · ${clauseOpLabel(clause.op)}`;
}

export function defaultSortDirForPath(
  schema: WorkspaceSchema,
  objectId: string,
  path: string
): 'asc' | 'desc' {
  const resolved = resolveFieldPath(schema, objectId, path);
  if (!resolved) return 'desc';
  if (
    resolved.field.type === 'text' ||
    resolved.field.type === 'email' ||
    resolved.field.type === 'select'
  ) {
    return 'asc';
  }
  return 'desc';
}

export function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}
