export function lookupPath(relationId: string, fieldId: string): string {
  return `${relationId}.${fieldId}`;
}

export function parseLookupPath(
  path: string
): { relationId: string; fieldId: string } | null {
  const parts = path.split('.').filter(Boolean);
  if (parts.length !== 2) return null;
  return { relationId: parts[0], fieldId: parts[1] };
}

export function isLookupPath(path: string): boolean {
  return parseLookupPath(path) != null;
}
