"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export const PAGE_SIZES = [10, 25, 50];

/** Client-side paging over the rows a table is showing (after its search and filters). */
export function usePagination<T>(rows: T[], initialPageSize = PAGE_SIZES[0]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  // Filters or search can shrink the list under the current page — clamp instead of showing an empty page.
  const current = Math.min(page, totalPages);
  const pageRows = rows.slice((current - 1) * pageSize, current * pageSize);

  return {
    pageRows,
    paginationProps: {
      page: current,
      pageSize,
      total: rows.length,
      onPageChange: setPage,
      onPageSizeChange: (size: number) => {
        setPageSize(size);
        setPage(1);
      },
    },
  };
}

/** 1 2 3 … 10 at the start, 1 … 4 5 6 … 10 in the middle, 1 … 8 9 10 at the end. */
function pageItems(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3].forEach((p) => pages.add(p));
  if (page >= totalPages - 2) [totalPages - 2, totalPages - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) items.push("gap");
    items.push(p);
  });
  return items;
}

interface TablePaginationProps {
  page: number;
  pageSize: number;
  /** Number of rows across all pages. */
  total: number;
  /** Noun shown after the total, e.g. "farmers". */
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const BOX = "flex h-8 min-w-8 items-center justify-center rounded-lg border px-2.5 text-sm font-semibold transition-all duration-200";

// Table footer: "Showing [10] of N items" on the left, Previous · 1 2 3 … 10 · Next on the right.
export function TablePagination({ page, pageSize, total, itemLabel, onPageChange, onPageSizeChange }: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Every list shows its footer (even a single page) so the total and page size are always visible; only an empty list has none.
  if (total === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2.5 text-[14px] text-slate-600">
        <span>Showing</span>
        <span className="relative">
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
            className="h-8 appearance-none rounded-md border border-zinc-200 bg-white pl-2.5 pr-7 text-[13px] text-slate-700 focus:border-brand-green focus:outline-none"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-subtle" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
        <span>of {total.toLocaleString()} {itemLabel}</span>
      </div>

      <nav className="flex flex-wrap items-center gap-2" aria-label="Pagination">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(BOX, "gap-1.5 border-zinc-200 bg-white px-3 text-slate-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-line-soft disabled:text-subtle disabled:hover:bg-white")}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {pageItems(page, totalPages).map((item, i) =>
          item === "gap" ? (
            <span key={`gap-${i}`} className={cn(BOX, "border-zinc-200 bg-white text-slate-700")} aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={page === item ? "page" : undefined}
              aria-label={`Page ${item}`}
              className={cn(
                BOX,
                page === item ? "border-brand-green-bright bg-brand-green-bright text-white shadow-md" : "border-transparent text-gray-600 hover:-translate-y-0.5 hover:border-gray-200 hover:bg-white hover:text-brand-green-bright hover:shadow-md",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(BOX, "gap-1.5 border-zinc-200 bg-white px-3 text-ink hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-line-soft disabled:text-subtle disabled:hover:bg-white")}
        >
          <span className="hidden sm:inline">Next</span>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </nav>
    </div>
  );
}
