"use client";

import { useState } from "react";

export type SendMode = "now" | "draft";

interface SendControlsProps {
  recipientCount: number;
  isReady: boolean;
  isSending: boolean;
  onSend: (mode: SendMode) => void;
}

export default function SendControls({
  recipientCount,
  isReady,
  isSending,
  onSend,
}: SendControlsProps) {
  const [mode, setMode] = useState<SendMode>("now");

  const handleSend = () => {
    if (!isReady) return;
    onSend(mode);
  };

  return (
    <div className="space-y-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("now")}
          className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
            mode === "now"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:border-emerald-500"
          }`}
        >
          Send Now
        </button>
        <button
          onClick={() => setMode("draft")}
          className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
            mode === "draft"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:border-blue-500"
          }`}
        >
          Save as Drafts
        </button>
      </div>

      {/* Draft Mode Info */}
      {mode === "draft" && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">How to schedule from Gmail:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                <li>Emails will be saved to your Gmail Drafts folder</li>
                <li>Open Gmail and go to <span className="font-medium">Drafts</span></li>
                <li>Open each draft and click the arrow next to Send</li>
                <li>Select <span className="font-medium">&quot;Schedule send&quot;</span> and pick your time</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} selected
        </span>
        {mode === "draft" && (
          <span className="text-blue-600 dark:text-blue-400 text-xs">
            → Gmail Drafts
          </span>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!isReady || isSending}
        className={`w-full py-3 text-sm font-medium rounded-lg transition-all disabled:cursor-not-allowed ${
          mode === "now"
            ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white shadow-lg shadow-emerald-500/25"
            : "bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white shadow-lg shadow-blue-500/25"
        }`}
      >
        {isSending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {mode === "now" ? "Sending..." : "Saving drafts..."}
          </span>
        ) : mode === "now" ? (
          `Send ${recipientCount} Email${recipientCount !== 1 ? "s" : ""} Now`
        ) : (
          `Save ${recipientCount} Draft${recipientCount !== 1 ? "s" : ""} to Gmail`
        )}
      </button>

      {/* Warning */}
      {recipientCount > 50 && mode === "now" && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          ⚠️ Gmail has daily sending limits. Free accounts: ~100/day, Workspace: higher limits.
        </p>
      )}
    </div>
  );
}
