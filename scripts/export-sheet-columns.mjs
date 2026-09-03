/**
 * ONE-TIME MIGRATION HELPER (Step 1 of the sheet-as-source-of-truth move).
 *
 * Reads the legacy data/meetups.ts array and the current sheet export, then
 * writes the columns the sheet does not yet carry, in sheet row order, ready
 * to paste into the Meetups Database tab.
 *
 * Usage:
 *   node scripts/export-sheet-columns.mjs <sheet.csv> <legacy-meetups.json> <out-dir>
 *
 * Safe to delete once the sheet holds the data.
 */
import fs from "node:fs";
import path from "node:path";
import { parseCsv, findHeaderRow } from "./csv-utils.mjs";

const [sheetCsvPath, legacyJsonPath, outDir] = process.argv.slice(2);
if (!sheetCsvPath || !legacyJsonPath || !outDir) {
  console.error("usage: node scripts/export-sheet-columns.mjs <sheet.csv> <legacy-meetups.json> <out-dir>");
  process.exit(1);
}

const rows = parseCsv(fs.readFileSync(sheetCsvPath, "utf8"));
const { header, dataRows } = findHeaderRow(rows);
const cell = (row, name) => (row[header.indexOf(name)] ?? "").trim();

const legacy = JSON.parse(fs.readFileSync(legacyJsonPath, "utf8"));
const byName = new Map(legacy.map((m) => [m.name, m]));

// Columns P..X of the sheet. P..V are the owner's new columns; W and X carry
// the two remaining code-only fields (the meetup slug, which sets the page URL,
// and tags) so nothing on the site is lost in the move.
const COLUMNS = [
  "Display City",
  "Lat",
  "Lng",
  "Description",
  "Attendance",
  "Beginner Friendly",
  "State Abbr",
  "Slug",
  "Tags",
];

const out = [];
const unmatched = [];
const seenNames = new Set();

for (const row of dataRows) {
  const name = cell(row, "Meetup Name");
  if (!name) continue;
  seenNames.add(name);
  const m = byName.get(name);
  if (!m) {
    unmatched.push({ num: cell(row, "#"), name, reason: "no meetup of this name in data/meetups.ts" });
    out.push({ num: cell(row, "#"), name, values: COLUMNS.map(() => "") });
    continue;
  }
  const sheetCity = cell(row, "City");
  out.push({
    num: cell(row, "#"),
    name,
    values: [
      // Only fill Display City where the code deliberately files the meetup
      // under a different city than the sheet's pin location.
      m.city === sheetCity ? "" : m.city,
      String(m.lat),
      String(m.lng),
      m.description,
      m.attendance,
      m.beginnerFriendly ? "TRUE" : "FALSE",
      m.stateAbbr,
      m.slug,
      (m.tags ?? []).join("; "),
    ],
  });
}

for (const m of legacy) {
  if (!seenNames.has(m.name)) {
    unmatched.push({ num: "-", name: m.name, reason: "in data/meetups.ts but no row of this name in the sheet" });
  }
}

fs.mkdirSync(outDir, { recursive: true });

const csvCell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

// Paste-ready: tab separated, header row included, columns P..X only.
// Select cell P2 in the sheet and paste. The P..V headers it writes are the
// same names already there; W2 and X2 get "Slug" and "Tags".
fs.writeFileSync(
  path.join(outDir, "paste-into-P2.tsv"),
  [COLUMNS.join("\t"), ...out.map((r) => r.values.join("\t"))].join("\n") + "\n"
);

// Same data as CSV, with Meetup Name first, for reading and checking only.
fs.writeFileSync(
  path.join(outDir, "sheet-columns-from-code.csv"),
  [
    ["#", "Meetup Name", ...COLUMNS].map(csvCell).join(","),
    ...out.map((r) => [r.num, r.name, ...r.values].map(csvCell).join(",")),
  ].join("\n") + "\n"
);

console.log(`sheet data rows:        ${dataRows.length}`);
console.log(`meetups in legacy code: ${legacy.length}`);
console.log(`rows written:           ${out.length}`);
console.log(`\nname mismatches to fix by hand: ${unmatched.length}`);
for (const u of unmatched) console.log(`  #${u.num} ${JSON.stringify(u.name)} - ${u.reason}`);
console.log(`\nwrote ${path.join(outDir, "paste-into-P2.tsv")}`);
console.log(`wrote ${path.join(outDir, "sheet-columns-from-code.csv")}`);
