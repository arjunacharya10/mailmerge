"use client";

import { useState } from "react";
import { ParsedCSV } from "../lib/csv-parser";

interface RecipientTableProps {
  data: ParsedCSV;
  emailField: string;
  selectedIndex: number;
  onSelectRecipient: (index: number) => void;
}

export default function RecipientTable({
  data,
  emailField,
  selectedIndex,
  onSelectRecipient,
}: RecipientTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter rows based on search
  const filteredRows = data.rows.filter((row) =>
    Object.values(row).some((value) =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  // Show max 5 columns including email
  const displayColumns = [
    emailField,
    ...data.headers.filter((h) => h !== emailField).slice(0, 4),
  ];

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search recipients..."
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="w-10 px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400">
                #
              </th>
              {displayColumns.map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left font-medium text-zinc-500 dark:text-zinc-400"
                >
                  {col}
                  {col === emailField && (
                    <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">
                      (email)
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {paginatedRows.map((row, idx) => {
              const actualIndex = startIndex + idx;
              const originalIndex = data.rows.indexOf(row);
              const isSelected = originalIndex === selectedIndex;

              return (
                <tr
                  key={actualIndex}
                  onClick={() => onSelectRecipient(originalIndex)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-900/20"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <td className="px-3 py-2 text-zinc-400 dark:text-zinc-500">
                    {originalIndex + 1}
                  </td>
                  {displayColumns.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-2 text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]"
                    >
                      {row[col] || "-"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRows.length)} of{" "}
            {filteredRows.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-zinc-600 dark:text-zinc-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

