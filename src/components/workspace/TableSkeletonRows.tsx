'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TableSkeletonRowsProps {
  columns: string[];
  rowCount?: number;
}

export function TableSkeletonRows({
  columns,
  rowCount = 10,
}: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow
          key={rowIndex}
          className="h-11 transition-none hover:bg-transparent"
        >
          {columns.map((columnId, columnIndex) => (
            <TableCell
              key={columnId}
              className={cn(
                'overflow-hidden py-2',
                columnIndex === 0 &&
                  'sticky left-0 z-[1] border-r border-border bg-background pl-4'
              )}
            >
              {columnIndex === 0 ? (
                <Skeleton className="h-3.5 w-32" />
              ) : (
                <Skeleton className="h-3 w-20" />
              )}
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      ))}
    </>
  );
}

interface TableEmptyRowProps {
  colSpan: number;
  message: string;
}

export function TableEmptyRow({ colSpan, message }: TableEmptyRowProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={colSpan}
        className="py-10 pl-4 text-sm text-muted-foreground"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}
