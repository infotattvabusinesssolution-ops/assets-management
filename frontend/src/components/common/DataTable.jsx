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
    <div className="w-full space-y-2">
      <div className="overflow-auto max-h-[540px] border border-slate-200 rounded-xl bg-white shadow-2xs">
        <table className="w-full text-left text-sm text-black">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase font-black text-black border-b border-slate-200 tracking-wider shadow-2xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-4 py-3.5 cursor-pointer select-none hover:text-[#6C2BD9] transition-colors text-black"
                  >
                    <div className="flex items-center gap-1.5 text-black">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUp className="w-3.5 h-3.5 text-[#6C2BD9]" />,
                        desc: <ChevronDown className="w-3.5 h-3.5 text-[#6C2BD9]" />
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-purple-50/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 font-semibold text-black">
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

      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/20">
        <span className="font-medium text-slate-600">Showing {data?.length || 0} records</span>
        <span className="text-slate-400">Scroll down to view all records</span>
      </div>
    </div>
  );
}
