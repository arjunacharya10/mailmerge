"use client";

import { useState } from "react";

export type SendMode = "now" | "schedule";

interface SendControlsProps {
  recipientCount: number;
  isReady: boolean;
  isSending: boolean;
  onSend: (mode: SendMode, scheduledTime?: Date) => void;
}

export default function SendControls({
  recipientCount,
  isReady,
  isSending,
  onSend,
}: SendControlsProps) {
  const [mode, setMode] = useState<SendMode>("now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const getScheduledDateTime = (): Date | undefined => {
    if (mode === "schedule" && scheduledDate && scheduledTime) {
      return new Date(`${scheduledDate}T${scheduledTime}`);
    }
    return undefined;
  };

  const isScheduleValid = (): boolean => {
    if (mode === "now") return true;
    const dateTime = getScheduledDateTime();
    if (!dateTime) return false;
    return dateTime.getTime() > Date.now() + 60000; // At least 1 minute in future
  };

  const handleSend = () => {
    if (!isReady || !isScheduleValid()) return;
    onSend(mode, getScheduledDateTime());
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

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
          onClick={() => setMode("schedule")}
          className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all ${
            mode === "schedule"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:border-blue-500"
          }`}
        >
          Schedule Send
        </button>
      </div>

      {/* Schedule Options */}
      {mode === "schedule" && (
        <div className="space-y-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Schedule emails to be sent later:
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Date</label>
              <input
                type="date"
                value={scheduledDate}
                min={today}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
          {scheduledDate && scheduledTime && !isScheduleValid() && (
            <p className="text-xs text-red-500">
              Please select a time at least 1 minute in the future
            </p>
          )}
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Note: Scheduled emails will be saved as drafts. You can send them later from Gmail.
          </p>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-600 dark:text-zinc-400">
          {recipientCount} recipient{recipientCount !== 1 ? "s" : ""} selected
        </span>
        {mode === "schedule" && scheduledDate && scheduledTime && isScheduleValid() && (
          <span className="text-blue-600 dark:text-blue-400">
            {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
          </span>
        )}
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!isReady || isSending || !isScheduleValid()}
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
            Sending...
          </span>
        ) : mode === "now" ? (
          `Send ${recipientCount} Email${recipientCount !== 1 ? "s" : ""} Now`
        ) : (
          `Schedule ${recipientCount} Email${recipientCount !== 1 ? "s" : ""}`
        )}
      </button>

      {/* Warning */}
      {recipientCount > 50 && (
        <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
          ⚠️ Gmail has daily sending limits. Free accounts: ~100/day, Workspace: higher limits.
        </p>
      )}
    </div>
  );
}

