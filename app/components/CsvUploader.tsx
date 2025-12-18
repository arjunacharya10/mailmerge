"use client";

import { useCallback, useState } from "react";
import { parseCSV, ParsedCSV, validateCSV, CSVValidationResult } from "../lib/csv-parser";

interface CsvUploaderProps {
  onDataParsed: (data: ParsedCSV, emailField: string) => void;
}

export default function CsvUploader({ onDataParsed }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCSV | null>(null);
  const [emailField, setEmailField] = useState<string>("");
  const [validation, setValidation] = useState<CSVValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }

    setIsProcessing(true);
    setFileName(file.name);

    const data = await parseCSV(file);
    setParsedData(data);

    // Auto-detect email field
    const emailFieldGuess = data.headers.find(
      (h) =>
        h.toLowerCase() === "email" ||
        h.toLowerCase().includes("email") ||
        h.toLowerCase() === "e-mail"
    );

    if (emailFieldGuess) {
      setEmailField(emailFieldGuess);
      const validationResult = validateCSV(data, emailFieldGuess);
      setValidation(validationResult);
    }

    setIsProcessing(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleEmailFieldChange = (field: string) => {
    setEmailField(field);
    if (parsedData) {
      const validationResult = validateCSV(parsedData, field);
      setValidation(validationResult);
    }
  };

  const handleConfirm = () => {
    if (parsedData && emailField && validation?.isValid) {
      onDataParsed(parsedData, emailField);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
            : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600"
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {fileName ? fileName : "Drop your CSV file here"}
            </p>
            <p className="text-xs text-zinc-500">
              or click to browse
            </p>
          </div>
        </div>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          Processing CSV...
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && !isProcessing && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              {parsedData.rows.length} recipients
            </span>
            <span className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {parsedData.headers.length} columns
            </span>
          </div>

          {/* Email Field Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Select email column:
            </label>
            <select
              value={emailField}
              onChange={(e) => handleEmailFieldChange(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Select column...</option>
              {parsedData.headers.map((header) => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>

          {/* Validation Results */}
          {validation && (
            <div className="space-y-2">
              {validation.isValid ? (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  All {parsedData.rows.length} email addresses are valid
                </div>
              ) : (
                <div className="space-y-1">
                  {validation.errors.map((error, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </div>
                  ))}
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="space-y-1">
                  {validation.warnings.map((warning, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {warning}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Column Preview */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Available columns for personalization:
            </p>
            <div className="flex flex-wrap gap-2">
              {parsedData.headers.map((header) => (
                <span
                  key={header}
                  className="px-2 py-1 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {`{{${header}}}`}
                </span>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!validation?.isValid}
            className="w-full py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Confirm Recipients
          </button>
        </div>
      )}
    </div>
  );
}

