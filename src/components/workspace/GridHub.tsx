'use client';

import { useMemo, useState } from 'react';
import { useTableColumnWidths } from '@/hooks/use-table-column-widths';
import {
  buildColumnCatalog,
  defaultColumnMinWidths,
  defaultColumnWidths,
  defaultVisibleColumns,
  normalizeObjectColumns,
} from '@/lib/workspace/columns';
import { objectById } from '@/lib/workspace/field-tree';
import { queryRecords } from '@/lib/workspace/filter-records';
import type { WorkspaceQueryClause } from '@/lib/workspace/query-clauses';
import { formatRecordDate, isRecordSystemField } from '@/lib/workspace/system-fields';
import type { ObjectDef, WorkspaceRecord, WorkspaceSchema } from '@/lib/workspace/types';
import { ColumnsPopover } from './ColumnsPopover';
import { FilterMenu } from './FilterMenu';
import { RecordTable } from './RecordTable';
import { SortPopover } from './SortPopover';

type GridHubProps = {
  schema: WorkspaceSchema;
  objectId: string;
  records: WorkspaceRecord[];
};

function optionLabels(object: ObjectDef, fieldId: string): Map<string, string> {
  return new Map(
    object.fields.find((field) => field.id === fieldId)?.options?.map((option) => [
      option.value,
      option.label,
    ]) ?? []
  );
}

function renderCellValue(object: ObjectDef, columnId: string, record: WorkspaceRecord) {
  const field = object.fields.find((item) => item.id === columnId);
  const value = isRecordSystemField(columnId)
    ? record[columnId]
    : record.values[columnId];

  if (value == null || value === '') {
    return <span className="text-muted-foreground">—</span>;
  }

  if (field?.type === 'select') {
    const label = optionLabels(object, columnId).get(String(value)) ?? String(value);
    return (
      <span className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
        {label}
      </span>
    );
  }

  if (field?.type === 'date' || isRecordSystemField(columnId)) {
    return <span className="text-sm">{formatRecordDate(String(value))}</span>;
  }

  if (field?.type === 'boolean' || typeof value === 'boolean') {
    return <span className="text-sm">{value ? 'Yes' : 'No'}</span>;
  }

  return (
    <span className="truncate text-sm font-medium text-foreground">{String(value)}</span>
  );
}

export function GridHub({ schema, objectId, records: sourceRecords }: GridHubProps) {
  const object = objectById(schema, objectId);
  const fallbackColumns = object ? defaultVisibleColumns(object) : [];
  const defaultSort = object?.primaryField ?? 'name';

  const [clauses, setClauses] = useState<WorkspaceQueryClause[]>([]);
  const [sort, setSort] = useState(defaultSort);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [columns, setColumns] = useState<string[]>(fallbackColumns);

  const catalog = object ? buildColumnCatalog(object) : [];
  const visibleColumns = object ? normalizeObjectColumns(object, columns) : [];
  const { widthOf, tableWidth, resizingId, onResizeStart } = useTableColumnWidths({
    storageKey: `lumi-os:${object?.slug ?? 'unknown'}-column-widths`,
    columns: visibleColumns,
    defaultWidths: object ? defaultColumnWidths(object) : {},
    minWidths: object ? defaultColumnMinWidths(object) : {},
  });

  const records = useMemo(
    () =>
      object
        ? queryRecords(schema, objectId, sourceRecords, clauses, { path: sort, dir: sortDir })
        : [],
    [object, schema, objectId, sourceRecords, clauses, sort, sortDir]
  );

  if (!object) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Object not found.</p>;
  }

  const handleSort = (column: string) => {
    if (sort === column) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSort(column);
    setSortDir('asc');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <FilterMenu
          schema={schema}
          objectId={objectId}
          clauses={clauses}
          onChange={setClauses}
        />
        <SortPopover
          schema={schema}
          objectId={objectId}
          sort={sort}
          sortDir={sortDir}
          defaultSort={defaultSort}
          defaultDir="asc"
          onSortChange={setSort}
          onDirChange={setSortDir}
        />
        <ColumnsPopover
          columns={catalog}
          visibleColumns={visibleColumns}
          onChange={(next) => setColumns(normalizeObjectColumns(object, next))}
        />
        <span className="ml-auto text-xs tabular-nums text-muted-foreground">
          {records.length} record{records.length === 1 ? '' : 's'}
        </span>
      </div>

      <RecordTable
        items={records}
        loading={false}
        columns={visibleColumns}
        catalog={catalog}
        sort={sort}
        sortDir={sortDir}
        onSort={handleSort}
        onColumnsChange={(next) => setColumns(normalizeObjectColumns(object, next))}
        widthOf={widthOf}
        tableWidth={tableWidth}
        resizingId={resizingId}
        onResizeStart={onResizeStart}
        rowKey={(record) => record.id}
        emptyMessage="No records match your filters"
        renderCell={(columnId, record) => renderCellValue(object, columnId, record)}
      />
    </div>
  );
}
