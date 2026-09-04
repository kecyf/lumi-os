export type ColumnDef<Id extends string = string> = {
  id: Id;
  label: string;
  pinned?: boolean;
  sort?: string | null;
};

export function columnById<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  id: Id
): ColumnDef<Id> | undefined {
  return catalog.find((column) => column.id === id);
}

export function isCatalogColumn<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  value: string | null | undefined
): value is Id {
  return Boolean(value && catalog.some((column) => column.id === value));
}

export function normalizeColumnIds<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  value: unknown,
  fallback: readonly Id[]
): Id[] {
  const raw = Array.isArray(value) ? value : [];
  if (raw.length === 0) return [...fallback];

  const valid = new Set(catalog.map((column) => column.id));
  const seen = new Set<Id>();
  const ordered: Id[] = [];

  for (const column of catalog) {
    if (!column.pinned) continue;
    ordered.push(column.id);
    seen.add(column.id);
  }

  for (const item of raw) {
    if (typeof item !== 'string' || !valid.has(item as Id) || seen.has(item as Id)) {
      continue;
    }
    const id = item as Id;
    ordered.push(id);
    seen.add(id);
  }

  return ordered;
}

export function hiddenColumnIds<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  visible: readonly Id[]
): Id[] {
  const shown = new Set(visible);
  return catalog.filter((column) => !shown.has(column.id)).map((column) => column.id);
}

export function menuColumnIds<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  visible: readonly Id[]
): Id[] {
  return [...visible, ...hiddenColumnIds(catalog, visible)];
}

export function toggleColumnId<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  current: readonly Id[],
  id: Id,
  fallback: readonly Id[]
): Id[] {
  const column = columnById(catalog, id);
  if (!column || column.pinned) return normalizeColumnIds(catalog, current, fallback);
  const visible = normalizeColumnIds(catalog, current, fallback);
  if (visible.includes(id)) {
    return visible.filter((item) => item !== id);
  }
  return [...visible, id];
}

export function reorderColumnIds<Id extends string>(
  catalog: readonly ColumnDef<Id>[],
  current: readonly Id[],
  activeId: Id,
  overId: Id,
  fallback: readonly Id[]
): Id[] {
  if (activeId === overId) return normalizeColumnIds(catalog, current, fallback);
  const menu = menuColumnIds(catalog, normalizeColumnIds(catalog, current, fallback));
  const from = menu.indexOf(activeId);
  const to = menu.indexOf(overId);
  if (from < 0 || to < 0) return normalizeColumnIds(catalog, current, fallback);
  const next = [...menu];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  const visible = new Set(normalizeColumnIds(catalog, current, fallback));
  visible.add(activeId);
  return next.filter((id) => columnById(catalog, id)?.pinned || visible.has(id));
}

export function sameColumnIds(
  left: readonly string[] | undefined,
  right: readonly string[] | undefined
): boolean {
  const a = left ?? [];
  const b = right ?? [];
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
