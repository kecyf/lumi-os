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
import type { WorkspaceRecord, WorkspaceSchema } from '@/lib/workspace/types';
import {
  filtersFromView,
  type SavedView,
  type ViewFilters,
} from '@/lib/workspace/views';
import { ColumnsPopover } from './ColumnsPopover';
import { FilterMenu } from './FilterMenu';
import { RecordFooter } from './RecordFooter';
import { RecordTable } from './RecordTable';
import { SortPopover } from './SortPopover';
import { CreateTrigger, GroupTrigger } from './ToolbarTriggers';
import { ToolbarSearch } from './ToolbarSearch';
import { ViewPicker, defaultViewFor } from './ViewPicker';
import { renderCellValue } from './record-cells';

type GridHubProps = {
  schema: WorkspaceSchema;
  objectId: string;
  records: WorkspaceRecord[];
  views: SavedView[];
  onViewsChange: (views: SavedView[]) => void;
  onCreate: () => void;
  onOpenCommand: () => void;
};

export function GridHub({
  schema,
  objectId,
  records: sourceRecords,
  views,
  onViewsChange,
  onCreate,
  onOpenCommand,
}: GridHubProps) {
  const object = objectById(schema, objectId);
  const fallbackColumns = object ? defaultVisibleColumns(object) : [];
  const defaultSort = object?.primaryField ?? 'name';
  const defaultView = object ? defaultViewFor(object) : null;

  const [clauses, setClauses] = useState<WorkspaceQueryClause[]>([]);
  const [sort, setSort] = useState(defaultSort);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [columns, setColumns] = useState<string[]>(fallbackColumns);
  const [search, setSearch] = useState('');
  const [activeViewId, setActiveViewId] = useState(defaultView?.id ?? '');

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
        ? queryRecords(
            schema,
            objectId,
            sourceRecords,
            clauses,
            { path: sort, dir: sortDir },
            search
          )
        : [],
    [object, schema, objectId, sourceRecords, clauses, sort, sortDir, search]
  );

  if (!object || !defaultView) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Object not found.</p>;
  }

  const activeView =
    views.find((view) => view.id === activeViewId) ??
    (activeViewId === defaultView.id ? defaultView : defaultView);

  const currentFilters: ViewFilters = {
    clauses,
    sorts: [{ path: sort, dir: sortDir }],
    columns: visibleColumns,
  };

  const applyView = (view: SavedView) => {
    const filters = filtersFromView(view);
    setActiveViewId(view.id);
    setClauses(filters.clauses ?? []);
    setSort(filters.sorts?.[0]?.path ?? defaultSort);
    setSortDir(filters.sorts?.[0]?.dir ?? 'asc');
    setColumns(normalizeObjectColumns(object, filters.columns ?? fallbackColumns));
  };

  const handleSort = (column: string) => {
    if (sort === column) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSort(column);
    setSortDir('asc');
  };

  const searchPlaceholder = `Search ${object.fields
    .slice(0, 2)
    .map((field) => field.name.toLowerCase())
    .join(', ')}…`;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-[52px] shrink-0 items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <ViewPicker
            object={object}
            views={views}
            activeViewId={activeViewId}
            currentFilters={currentFilters}
            onSelect={applyView}
            onCreate={(view) => {
              onViewsChange([...views, view]);
              setActiveViewId(view.id);
            }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <ColumnsPopover
            columns={catalog}
            visibleColumns={visibleColumns}
            onChange={(next) => setColumns(normalizeObjectColumns(object, next))}
          />
          <FilterMenu
            schema={schema}
            objectId={objectId}
            clauses={clauses}
            onChange={setClauses}
          />
          <GroupTrigger />
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
          <CreateTrigger label="New record" onClick={onCreate} />
          <ToolbarSearch
            value={search}
            onChange={setSearch}
            placeholder={searchPlaceholder}
            onOpenCommand={onOpenCommand}
          />
        </div>
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

      <RecordFooter
        loadedCount={records.length}
        totalCount={sourceRecords.length}
        entitySingular={object.name.replace(/s$/, '').toLowerCase()}
        entityPlural={object.name.toLowerCase()}
        viewLabel={activeView.name}
        viewIcon={activeView.icon}
        viewColor={activeView.iconColor}
      />
    </div>
  );
}
