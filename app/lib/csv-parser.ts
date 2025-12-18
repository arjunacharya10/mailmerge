import Papa from "papaparse";

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
  errors: string[];
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Parses a CSV file and returns structured data
 */
export function parseCSV(file: File): Promise<ParsedCSV> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        const errors = results.errors.map(
          (err) => `Row ${err.row}: ${err.message}`
        );

        resolve({
          headers,
          rows,
          errors,
        });
      },
      error: (error) => {
        resolve({
          headers: [],
          rows: [],
          errors: [error.message],
        });
      },
    });
  });
}

/**
 * Parses CSV text directly (useful for testing or pasted content)
 */
export function parseCSVText(text: string): ParsedCSV {
  const results = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const headers = results.meta.fields || [];
  const rows = results.data as Record<string, string>[];
  const errors = results.errors.map(
    (err) => `Row ${err.row}: ${err.message}`
  );

  return {
    headers,
    rows,
    errors,
  };
}

/**
 * Validates the parsed CSV data for email sending
 */
export function validateCSV(data: ParsedCSV, emailField: string): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if email field exists
  if (!data.headers.includes(emailField)) {
    errors.push(`Email field "${emailField}" not found in CSV headers`);
    return { isValid: false, errors, warnings };
  }

  // Validate each row
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const seenEmails = new Set<string>();

  data.rows.forEach((row, index) => {
    const email = row[emailField]?.trim();
    
    if (!email) {
      errors.push(`Row ${index + 1}: Missing email address`);
    } else if (!emailRegex.test(email)) {
      errors.push(`Row ${index + 1}: Invalid email format "${email}"`);
    } else if (seenEmails.has(email.toLowerCase())) {
      warnings.push(`Row ${index + 1}: Duplicate email "${email}"`);
    } else {
      seenEmails.add(email.toLowerCase());
    }
  });

  // Check for empty rows
  if (data.rows.length === 0) {
    errors.push("CSV file contains no data rows");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets unique values for a specific column
 */
export function getColumnValues(data: ParsedCSV, column: string): string[] {
  return [...new Set(data.rows.map((row) => row[column]).filter(Boolean))];
}

/**
 * Filters rows based on a condition
 */
export function filterRows(
  data: ParsedCSV,
  predicate: (row: Record<string, string>) => boolean
): Record<string, string>[] {
  return data.rows.filter(predicate);
}

/**
 * Converts parsed CSV back to CSV text
 */
export function toCSVText(data: ParsedCSV): string {
  return Papa.unparse({
    fields: data.headers,
    data: data.rows,
  });
}

