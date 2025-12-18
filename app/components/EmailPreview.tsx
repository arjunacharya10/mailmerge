"use client";

import { PersonalizedEmail } from "../lib/template";

interface EmailPreviewProps {
  email: PersonalizedEmail | null;
  recipientIndex: number;
  totalRecipients: number;
  onNavigate: (direction: "prev" | "next") => void;
}

export default function EmailPreview({
  email,
  recipientIndex,
  totalRecipients,
  onNavigate,
}: EmailPreviewProps) {
  if (!email) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
        <p className="text-sm text-zinc-500">
          Select a recipient to preview the personalized email
        </p>
      </div>
    );
  }

  const canGoPrev = recipientIndex > 0;
  const canGoNext = recipientIndex < totalRecipients - 1;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      {/* Email Header with Navigation */}
      <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-2">
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("prev")}
              disabled={!canGoPrev}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
              title="Previous recipient"
            >
              <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[80px] text-center">
              {recipientIndex + 1} of {totalRecipients}
            </span>
            <button
              onClick={() => onNavigate("next")}
              disabled={!canGoNext}
              className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
              title="Next recipient"
            >
              <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <span className="px-2 py-0.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">
            Personalized
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8">To:</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {email.to}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 w-8">Sub:</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {email.subject || "(No subject)"}
            </span>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="p-4 bg-white dark:bg-zinc-900 min-h-[200px]">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {email.body ? (
            <div
              className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: email.body
                  .replace(/\n/g, "<br>")
                  .replace(
                    /\{\{([^{}]+)\}\}/g,
                    '<span class="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs font-mono">{{$1}}</span>'
                  ),
              }}
            />
          ) : (
            <p className="text-zinc-400 italic">(Empty email body)</p>
          )}
        </div>
      </div>

      {/* Recipient Data */}
      <div className="bg-zinc-50 dark:bg-zinc-800 px-4 py-3 border-t border-zinc-200 dark:border-zinc-700">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
          Recipient Data:
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(email.recipientData).map(([key, value]) => (
            <span
              key={key}
              className="text-xs px-2 py-1 bg-white dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-700"
            >
              <span className="text-zinc-500">{key}:</span>{" "}
              <span className="text-zinc-900 dark:text-zinc-100">{value}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
