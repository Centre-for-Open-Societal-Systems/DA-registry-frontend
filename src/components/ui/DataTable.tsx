"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { EmptyState } from "./EmptyState";
import { SearchInput } from "./SearchInput";
import { TablePagination, usePagination } from "./TablePagination";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Loading / empty / error states — every list surface defines all three (NFR: Feedback states). */
  state?: "ready" | "loading" | "error";
  emptyTitle?: string;
  emptyHint?: string;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  minWidth?: string;
  selectedKey?: string | null;
  /** Adds a search box above the table that matches any value in a row (for tables with no toolbar search of their own). */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Noun for the pagination footer, e.g. "agents" (defaults to "records"). */
  itemLabel?: string;
  /** Set false for tiny fixed lists that should not page. */
  paginate?: boolean;
}

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" };

// Generic bordered table used by the registry / queue screens. Header + zebra-free rows match FarmersTable.
export function DataTable<T>({ columns, rows, rowKey, state = "ready", emptyTitle = "Nothing to show", emptyHint, onRetry, onRowClick, minWidth = "900px", selectedKey, searchable, searchPlaceholder: placeholderOverride, itemLabel = "records", paginate = true }: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const visibleRows = searchable ? rows.filter((row) => matchesQuery(query, row)) : rows;
  const isFiltered = !!searchable && query.trim() !== "";
  const { pageRows, paginationProps } = usePagination(visibleRows);
  const shownRows = paginate ? pageRows : visibleRows;

  return (
    <>
    {searchable && (
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder={placeholderOverride ?? searchPlaceholder(columns.map((c) => c.header))} />
        {isFiltered && <span className="text-[12.5px] text-[#64748b]">{visibleRows.length} of {rows.length} rows</span>}
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left" style={{ minWidth }}>
        <thead>
          <tr className="border-y border-[#E5E7EB] bg-[#F8FAFC] text-[13px] font-medium text-[#334155]">
            {columns.map((c) => (
              <th key={c.key} className={cn("whitespace-nowrap px-4 py-3 font-medium", ALIGN[c.align ?? "left"], c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-[14px] text-[#334155]">
          {state === "loading" &&
            [0, 1, 2, 3, 4].map((i) => (
              <tr key={i} className="border-b border-[#F1F3F4]">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-4">
                    <span className="block h-3.5 w-3/4 animate-pulse rounded bg-[#E2E8F0]" />
                  </td>
                ))}
              </tr>
            ))}
          {state === "error" && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6">
                <EmptyState tone="error" title="Couldn't load this list" hint="The service did not respond. Retry, or check the sync queue." actionLabel={onRetry ? "Retry" : undefined} onAction={onRetry} />
              </td>
            </tr>
          )}
          {state === "ready" && visibleRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6">
                <EmptyState
                  title={isFiltered ? `No rows match “${query.trim()}”` : emptyTitle}
                  hint={isFiltered ? "Try a different word, ID or number." : emptyHint}
                />
              </td>
            </tr>
          )}
          {state === "ready" &&
            shownRows.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "border-b border-[#F1F3F4] transition-colors last:border-b-0 hover:bg-[#F8FAFC]",
                    onRowClick && "cursor-pointer",
                    selectedKey === key && "bg-[#F0FAF5]",
                  )}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3.5 align-middle", ALIGN[c.align ?? "left"], c.className)}>
                      {c.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
    {paginate && state === "ready" && visibleRows.length > 0 && <TablePagination {...paginationProps} itemLabel={itemLabel} />}
    </>
  );
}
