import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTable({ columns, data, pagination, onPaginationChange }) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
        <table className="w-full text-left text-sm text-slate-900">
          <thead className="bg-slate-100 text-xs uppercase font-extrabold text-slate-950 border-b border-slate-300 tracking-wider">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3.5 cursor-pointer select-none hover:text-purple-700 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="w-3.5 h-3.5 text-brand-500" />,
                        desc: <ChevronDown className="w-3.5 h-3.5 text-brand-500" />
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-purple-50/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 font-semibold text-slate-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500 font-medium">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div>
            Showing <span className="font-semibold text-slate-800">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{pagination.total}</span> records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPaginationChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary px-2.5 py-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="px-2 font-medium text-slate-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => onPaginationChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-secondary px-2.5 py-1 text-xs"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
