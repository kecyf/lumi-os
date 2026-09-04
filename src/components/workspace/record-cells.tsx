import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRecordDate, isRecordSystemField } from '@/lib/workspace/system-fields';
import type { ObjectDef, PropertyOption, WorkspaceRecord } from '@/lib/workspace/types';

const SELECT_TONES = [
  'border-emerald-500/30 bg-emerald-500/12 text-emerald-800 dark:text-emerald-200',
  'border-sky-500/30 bg-sky-500/12 text-sky-800 dark:text-sky-200',
  'border-violet-500/30 bg-violet-500/12 text-violet-800 dark:text-violet-200',
  'border-amber-500/30 bg-amber-500/12 text-amber-800 dark:text-amber-200',
  'border-rose-500/30 bg-rose-500/12 text-rose-800 dark:text-rose-200',
  'border-zinc-500/30 bg-zinc-500/12 text-zinc-800 dark:text-zinc-200',
] as const;

const SELECT_DOTS = [
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-zinc-400',
] as const;

function toneIndex(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash + char.charCodeAt(0)) % SELECT_TONES.length;
  return hash;
}

function optionLabels(object: ObjectDef, fieldId: string): Map<string, string> {
  return new Map(
    object.fields
      .find((field) => field.id === fieldId)
      ?.options?.map((option: PropertyOption) => [option.value, option.label]) ?? []
  );
}

function identityInitial(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed[0]!.toUpperCase() : '?';
}

function EmptyDash() {
  return <span className="text-muted-foreground">—</span>;
}

function SelectBadge({ value, label }: { value: string; label: string }) {
  const index = toneIndex(value);
  return (
    <Badge
      variant="outline"
      className={cn('h-5 gap-1.5 px-1.5 text-[10px] font-medium', SELECT_TONES[index])}
    >
      <span className={cn('size-1.5 rounded-full', SELECT_DOTS[index])} />
      {label}
    </Badge>
  );
}

function IdentityCell({
  name,
  circular,
}: {
  name: string;
  circular: boolean;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      {circular ? (
        <Avatar size="sm" className="size-6">
          <AvatarFallback className="text-[10px] font-medium">
            {identityInitial(name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-medium text-primary">
          {identityInitial(name)}
        </span>
      )}
      <span className="truncate text-sm">{name}</span>
    </span>
  );
}

export function renderCellValue(
  object: ObjectDef,
  columnId: string,
  record: WorkspaceRecord
) {
  const field = object.fields.find((item) => item.id === columnId);
  const value = isRecordSystemField(columnId)
    ? record[columnId]
    : record.values[columnId];

  if (value == null || value === '') {
    return <EmptyDash />;
  }

  if (columnId === object.primaryField) {
    return (
      <IdentityCell
        name={String(value)}
        circular={object.fields.some((item) => item.type === 'email')}
      />
    );
  }

  if (field?.type === 'select') {
    const label = optionLabels(object, columnId).get(String(value)) ?? String(value);
    return <SelectBadge value={String(value)} label={label} />;
  }

  if (field?.type === 'date' || isRecordSystemField(columnId)) {
    return (
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatRecordDate(String(value))}
      </span>
    );
  }

  if (field?.type === 'boolean' || typeof value === 'boolean') {
    return <span className="text-sm">{value ? 'Yes' : 'No'}</span>;
  }

  if (field?.type === 'email') {
    return <span className="truncate text-sm">{String(value)}</span>;
  }

  return <span className="truncate text-sm">{String(value)}</span>;
}
