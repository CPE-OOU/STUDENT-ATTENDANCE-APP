'use client';
import { Button } from './button';
import { Input } from './input';

import {
  ColumnDef,
  flexRender,
  ColumnFiltersState,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  RowSelectionState,
  VisibilityState,
  PaginationState,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTablePagination } from './data-table-pagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DataTableViewOptions } from './data-table-view-options';
import { ScrollArea } from './scroll-area';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalCount: number;
  meta?: Record<string, unknown>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  meta,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Search params
  const page = searchParams?.get('page') ?? '1';
  const pageAsNumber = Number(page);
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  const per_page = searchParams?.get('per_page') ?? '10';
  const perPageAsNumber = Number(per_page);
  const fallbackPerPage = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;
  const sort = searchParams?.get('sort');
  const [column, order] = sort?.split('.') ?? [];

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  // Table states
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Handle server-side pagination
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: fallbackPage - 1,
    pageSize: fallbackPerPage,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  useEffect(() => {
    setPagination({
      pageIndex: fallbackPage - 1,
      pageSize: fallbackPerPage,
    });
  }, [fallbackPage, fallbackPerPage]);

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page: pageIndex + 1,
        per_page: pageSize,
      })}`,
      {
        scroll: false,
      }
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageSize]);

  // Handle server-side sorting
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: column ?? '',
      desc: order === 'desc',
    },
  ]);

  useEffect(() => {
    router.push(
      `${pathname}?${createQueryString({
        page,
        sort: sorting[0]?.id
          ? `${sorting[0]?.id}.${sorting[0]?.desc ? 'desc' : 'asc'}`
          : null,
      })}`
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting]);

  const table = useReactTable({
    data,
    columns,
    pageCount: totalCount,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    meta: {
      ...meta,
    },
  });

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between py-4">
        <Input placeholder="Search" className="max-w-sm" />
        <DataTableViewOptions table={table} />
      </div>
      <div className="flex flex-grow flex-col justify-between">
        <Table>
          <TableHeader className="rounded-lg">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-[#F7F7F7] border-none py-[9px]"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[#2c2c2e80]">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center "
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 py-4">
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
}
