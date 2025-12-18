"use client";

import { SendResult } from "../lib/gmail";

interface ProgressTrackerProps {
  isActive: boolean;
  total: number;
  completed: number;
  results: SendResult[];
  onClose: () => void;
}

export default function ProgressTracker({
  isActive,
  total,
  completed,
  results,
  onClose,
}: ProgressTrackerProps) {
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const isComplete = completed === total && total > 0;

  if (!isActive && results.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {isComplete ? "Sending Complete" : "Sending Emails..."}
          </h3>
        </div>

        {/* Progress Section */}
        <div className="px-6 py-6 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {completed} / {total}
              </span>
            </div>
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="flex-1 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {successCount}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Sent</p>
            </div>
            <div className="flex-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {failureCount}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
            </div>
            <div className="flex-1 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
                {total - completed}
              </p>
              <p className="text-xs text-zinc-500">Pending</p>
            </div>
          </div>

          {/* Recent Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Recent Activity
              </p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {results
                  .slice(-5)
                  .reverse()
                  .map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${
                        result.success
                          ? "bg-emerald-50 dark:bg-emerald-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      {result.success ? (
                        <svg
                          className="w-4 h-4 text-emerald-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span className="truncate text-zinc-700 dark:text-zinc-300">
                        {result.recipient}
                      </span>
                      {result.error && (
                        <span className="text-xs text-red-500 truncate">{result.error}</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Spinner when active */}
          {isActive && !isComplete && (
            <div className="flex items-center justify-center py-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

