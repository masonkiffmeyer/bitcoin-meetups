/**
 * Minimal CSV reader shared by the sync and export scripts.
 *
 * Handles quoted fields, escaped quotes, commas and newlines inside quotes,
 * and CRLF line endings, which is everything Google Sheets emits.
 */

export function parseCsv(text) {
  const src = text.replace(/^﻿/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Finds the header row by looking for the cell "Meetup Name" rather than
 * assuming a row number, so rows can be inserted above the header without
 * breaking the build. Returns the header names, the rows below it, and the
 * 1-based sheet row number the header was found on.
 */
export function findHeaderRow(rows, marker = "Meetup Name") {
  const index = rows.findIndex((row) => row.some((cell) => cell.trim() === marker));
  if (index === -1) {
    throw new Error(`could not find a header row containing "${marker}"`);
  }
  const header = rows[index].map((cell) => cell.trim());
  const dataRows = rows
    .slice(index + 1)
    .map((row, offset) => ({ row, sheetRow: index + offset + 2 }))
    .filter(({ row }) => row.some((cell) => cell.trim() !== ""));

  return {
    header,
    headerSheetRow: index + 1,
    dataRows: dataRows.map(({ row }) => row),
    dataRowsWithNumbers: dataRows,
  };
}
