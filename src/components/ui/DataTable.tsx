"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

type Column<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSearch?: (q: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  actions?: (row: T) => React.ReactNode;
};

export default function DataTable<T extends { id: number }>({
  columns, data, total, page, pageSize,
  onPageChange, onSearch, searchPlaceholder = "Search...",
  loading, actions,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const totalPages = Math.ceil(total / pageSize);

  function handleSearch(val: string) {
    setSearch(val);
    onSearch?.(val);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200">
      {onSearch && (
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th key={col.key} className={`text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
              {actions && <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-400">No records found</td></tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className || ""}`}>
                      {col.render ? col.render(row) : (row as any)[col.key] ?? "—"}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3 text-right">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs text-slate-600">{page} / {totalPages || 1}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
