import type { ColumnDef } from '@/lib/workspace/column-catalog';

export const RECORD_SYSTEM_FIELDS = [
  { id: 'created_at', label: 'Created', sort: 'created_at' },
  { id: 'updated_at', label: 'Updated', sort: 'updated_at' },
  { id: 'archived_at', label: 'Archived', sort: 'archived_at' },
] as const;

export type RecordSystemFieldId = (typeof RECORD_SYSTEM_FIELDS)[number]['id'];

export const RECORD_SYSTEM_COLUMNS = [
  { id: 'created_at', label: 'Created', pinned: false, sort: 'created_at' },
  { id: 'updated_at', label: 'Updated', pinned: false, sort: 'updated_at' },
  { id: 'archived_at', label: 'Archived', pinned: false, sort: 'archived_at' },
] as const satisfies readonly ColumnDef<RecordSystemFieldId>[];

export const RECORD_SYSTEM_WIDTHS: Record<RecordSystemFieldId, number> = {
  created_at: 130,
  updated_at: 130,
  archived_at: 130,
};

export const RECORD_SYSTEM_MIN_WIDTHS: Record<RecordSystemFieldId, number> = {
  created_at: 100,
  updated_at: 100,
  archived_at: 100,
};

export const RECORD_SYSTEM_SORTS = [
  { value: 'created_at', label: 'Created' },
  { value: 'updated_at', label: 'Updated' },
] as const;

export function isRecordSystemField(
  value: string | null | undefined
): value is RecordSystemFieldId {
  return RECORD_SYSTEM_FIELDS.some((field) => field.id === value);
}

export function formatRecordDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
