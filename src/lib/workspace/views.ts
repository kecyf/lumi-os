import {
  normalizeColumnIds,
  sameColumnIds,
  type ColumnDef,
} from '@/lib/workspace/column-catalog';
import {
  parseClauses,
  sameClauses,
  type WorkspaceQueryClause,
  type WorkspaceQuerySort,
} from '@/lib/workspace/query-clauses';

export type SortDir = 'asc' | 'desc';

export type ViewFilters = {
  clauses?: WorkspaceQueryClause[];
  sorts?: WorkspaceQuerySort[];
  columns?: string[];
};

export type ViewVisibility = 'personal' | 'collaborative' | 'locked';

export interface SavedView {
  id: string;
  objectId: string;
  name: string;
  filters: ViewFilters;
  visibility?: ViewVisibility;
  ownerEmail?: string | null;
  locked?: boolean;
}

export interface ViewAccessOptions {
  email?: string | null;
}

export function sameEmail(
  left: string | null | undefined,
  right: string | null | undefined
): boolean {
  const a = (left ?? '').trim().toLowerCase();
  const b = (right ?? '').trim().toLowerCase();
  return a.length > 0 && a === b;
}

export function resolveViewVisibility(view: SavedView): ViewVisibility {
  if (
    view.visibility === 'personal' ||
    view.visibility === 'collaborative' ||
    view.visibility === 'locked'
  ) {
    return view.visibility;
  }
  if (view.locked) return 'locked';
  return 'collaborative';
}

export function viewIsLocked(view: SavedView | null | undefined): boolean {
  if (!view) return true;
  return resolveViewVisibility(view) === 'locked';
}

export function viewIsVisibleTo(
  view: SavedView,
  email: string | null | undefined
): boolean {
  if (resolveViewVisibility(view) !== 'personal') return true;
  return sameEmail(email, view.ownerEmail);
}

export function viewCanUpdate(
  view: SavedView | null | undefined,
  options?: ViewAccessOptions
): boolean {
  if (!view) return false;
  const visibility = resolveViewVisibility(view);
  if (visibility === 'locked') return false;
  if (visibility === 'personal') {
    return sameEmail(options?.email, view.ownerEmail);
  }
  return true;
}

export function viewCanDelete(
  view: SavedView | null | undefined,
  options?: ViewAccessOptions
): boolean {
  if (!view || view.locked) return false;
  const visibility = resolveViewVisibility(view);
  if (visibility === 'personal') {
    return sameEmail(options?.email, view.ownerEmail);
  }
  return Boolean((options?.email ?? '').trim());
}

export function filtersFromView(view: SavedView): ViewFilters {
  const filters = view.filters ?? {};
  return {
    clauses: parseClauses(filters.clauses),
    sorts: Array.isArray(filters.sorts) ? filters.sorts : [],
    columns: Array.isArray(filters.columns)
      ? filters.columns.filter((item): item is string => typeof item === 'string')
      : undefined,
  };
}

export function viewMatchesFilters(
  view: SavedView,
  clauses: readonly WorkspaceQueryClause[],
  sorts: readonly WorkspaceQuerySort[],
  columns: readonly string[]
): boolean {
  const saved = filtersFromView(view);
  return (
    sameClauses(saved.clauses, clauses) &&
    JSON.stringify(saved.sorts ?? []) === JSON.stringify(sorts) &&
    sameColumnIds(saved.columns, columns)
  );
}

export function normalizeViewColumns<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  fallback: readonly Id[],
  value: unknown
): Id[] {
  return normalizeColumnIds(catalog, value, fallback);
}

export function sameViewColumns(
  left: readonly string[] | undefined,
  right: readonly string[] | undefined
): boolean {
  return sameColumnIds(left, right);
}
