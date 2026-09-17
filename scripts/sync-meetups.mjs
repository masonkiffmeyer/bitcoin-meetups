/**
 * Pulls the Meetups Database sheet and writes data/meetups.json, which is what
 * the site builds from. This is the only path data takes into the site: edit a
 * row in the sheet, run this, publish.
 *
 * Run it with:      npm run sync
 * Against a file:   npm run sync -- --file path/to/sheet.csv
 *
 * Rules it follows:
 *   - The header row is found by looking for the "Meetup Name" cell, not by row
 *     number, and every column is read by header name, so rows and columns can
 *     be inserted later without touching this file. Don't rename the headers.
 *   - Only rows where Approved is TRUE are published. Setting Approved to FALSE
 *     removes a meetup from the site without deleting its row.
 *   - Rows with an empty Meetup Name are skipped as blank.
 *   - A row that fails validation is reported and skipped. One bad row never
 *     stops the rest of the site from building.
 *   - If the sheet can't be fetched, or nothing valid comes back, the committed
 *     data/meetups.json is left in place and the build carries on with the last
 *     known good data. That is why the JSON is committed to git.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, findHeaderRow } from "./csv-utils.mjs";

// The published-to-web CSV for the merged_meetups_final.csv tab.
// File > Share > Publish to web > that tab > Comma-separated values (.csv).
// Override without editing this file by setting MEETUPS_SHEET_CSV_URL.
const SHEET_CSV_URL =
  process.env.MEETUPS_SHEET_CSV_URL ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUtu9yzISkH-eL9aLqIAbOIOMtz18IHbVozqq-M_MK9lROkQoTF3R72wQEAQBVXdEa0TnFOH1FcS1i/pub?gid=318768783&single=true&output=csv";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = path.join(ROOT, "data", "meetups.json");

const FETCH_TIMEOUT_MS = 20000;
const FETCH_ATTEMPTS = 3;

// Canonical state names, so the state in a URL never depends on how the sheet
// happens to spell it. The sheet's State cell for Bitcoin District DC reads
// "Washington, D.C.", which would put a comma in the path; State Abbr "DC"
// resolves to "District of Columbia" instead.
const STATE_NAMES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  PR: "Puerto Rico",
};

/** Same rule the site has always used, so no existing URL changes. */
function citySlug(city) {
  return city.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

function stateSlug(state) {
  return state.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Fallback slug for a row with no Slug cell. Existing meetups carry their
 * hand-written slug in the sheet's Slug column, because many of them are
 * abbreviations the name can't produce ("Bitcoin in the Lou" is stl-bitcoin).
 */
function slugFromName(name) {
  return name
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isTrue(value) {
  return value.trim().toUpperCase() === "TRUE";
}

function normalizeUrl(value) {
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** X handles only. The sheet has an email address in one X Handle cell. */
function normalizeHandle(value) {
  const handle = value.replace(/^@/, "").trim();
  return /^[A-Za-z0-9_]{1,15}$/.test(handle) ? handle : "";
}

function splitTags(value) {
  return value
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function readSource() {
  const fileFlag = process.argv.indexOf("--file");
  if (fileFlag !== -1) {
    const filePath = process.argv[fileFlag + 1];
    if (!filePath) throw new Error("--file needs a path");
    console.log(`reading ${filePath}`);
    return fs.readFileSync(filePath, "utf8");
  }

  if (SHEET_CSV_URL.includes("PASTE")) {
    throw new Error("no sheet URL configured (set MEETUPS_SHEET_CSV_URL)");
  }

  console.log(`fetching ${SHEET_CSV_URL}`);
  let lastError;
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(SHEET_CSV_URL, {
        redirect: "follow",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const text = await res.text();
      if (text.trim().startsWith("<")) {
        throw new Error(
          "got an HTML page instead of CSV, which usually means the tab is not published to web or is not readable without signing in"
        );
      }
      return text;
    } catch (error) {
      lastError = error;
      console.warn(`  attempt ${attempt} of ${FETCH_ATTEMPTS} failed: ${error.message}`);
      if (attempt < FETCH_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }
    }
  }
  throw lastError;
}

function buildMeetups(csvText) {
  const { header, headerSheetRow, dataRowsWithNumbers } = findHeaderRow(parseCsv(csvText));
  console.log(`header found on sheet row ${headerSheetRow}, ${header.length} columns`);

  for (const required of ["Meetup Name", "City", "State Abbr", "Lat", "Lng", "Approved"]) {
    if (!header.includes(required)) {
      throw new Error(`the sheet has no "${required}" column`);
    }
  }

  const meetups = [];
  const problems = [];
  const usedIds = new Set();
  let blank = 0;
  let notApproved = 0;

  for (const { row, sheetRow } of dataRowsWithNumbers) {
    const cell = (name) => {
      const index = header.indexOf(name);
      return index === -1 ? "" : (row[index] ?? "").trim();
    };

    const name = cell("Meetup Name");
    if (!name) {
      blank++;
      continue;
    }
    if (!isTrue(cell("Approved"))) {
      notApproved++;
      continue;
    }

    const reject = (why) => problems.push(`row ${sheetRow} (${name}): ${why}`);

    const city = cell("Display City") || cell("City");
    if (!city) {
      reject("no City and no Display City");
      continue;
    }
    if (city.includes("/")) {
      reject(`city ${JSON.stringify(city)} contains a slash, which would break the URL. Put the city in Display City`);
      continue;
    }

    const abbr = cell("State Abbr").toUpperCase();
    const stateFromAbbr = STATE_NAMES[abbr];
    const state = stateFromAbbr || cell("State");
    if (!state) {
      reject("no usable State Abbr and no State");
      continue;
    }
    if (!stateFromAbbr) {
      reject(`State Abbr ${JSON.stringify(abbr)} is not a state we know, so ${JSON.stringify(state)} was used for the URL`);
      continue;
    }

    const lat = Number(cell("Lat"));
    const lng = Number(cell("Lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      reject(`Lat/Lng are not both numbers (got ${JSON.stringify(cell("Lat"))} and ${JSON.stringify(cell("Lng"))}), so it can't be put on the map`);
      continue;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      reject(`Lat/Lng ${lat},${lng} are outside the range of real coordinates`);
      continue;
    }

    const slug = cell("Slug") || slugFromName(name);
    if (!slug) {
      reject("the Meetup Name produces an empty slug, so add a Slug");
      continue;
    }

    let id = slug;
    if (usedIds.has(id)) {
      let suffix = 2;
      while (usedIds.has(`${id}-${suffix}`)) suffix++;
      id = `${id}-${suffix}`;
      problems.push(`row ${sheetRow} (${name}): slug ${JSON.stringify(slug)} is already used, so its id became ${JSON.stringify(id)}. Give it its own Slug`);
    }
    usedIds.add(id);

    const website = normalizeUrl(cell("Website"));
    const isTelegram = /^https?:\/\/t\.me\//i.test(website);
    const verified = isTrue(cell("Verified"));

    const meetup = {
      id,
      slug,
      name,
      city,
      state,
      stateAbbr: abbr,
      lat,
      lng,
      cadence: cell("Cadence") || "Schedule not confirmed",
      venue: cell("Venue") || "Venue not confirmed",
      description: cell("Description") || `Bitcoin meetup in ${city}, ${abbr}.`,
      attendance: cell("Attendance") || "Not reported",
      beginnerFriendly: isTrue(cell("Beginner Friendly")),
      verified,
      needsVerification: !verified,
    };

    if (website && !isTelegram) meetup.website = website;
    if (cell("Meetup URL")) meetup.meetupUrl = normalizeUrl(cell("Meetup URL"));

    const handle = normalizeHandle(cell("X Handle"));
    if (handle) meetup.twitter = handle;
    else if (cell("X Handle")) {
      problems.push(`row ${sheetRow} (${name}): X Handle ${JSON.stringify(cell("X Handle"))} is not an X handle, so it was left off the page`);
    }

    if (cell("Nostr")) meetup.nostr = cell("Nostr");
    if (isTelegram) meetup.telegram = website;
    else if (cell("Telegram")) meetup.telegram = normalizeUrl(cell("Telegram"));

    const tags = splitTags(cell("Tags"));
    if (tags.length) meetup.tags = tags;

    meetups.push(meetup);
  }

  return { meetups, problems, blank, notApproved };
}

function keepExisting(reason) {
  console.warn("");
  console.warn("!".repeat(72));
  console.warn(`! could not refresh the meetup data: ${reason}`);
  if (fs.existsSync(OUTPUT_PATH)) {
    const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"));
    console.warn(`! keeping the committed data/meetups.json (${existing.length} meetups) so the site still builds.`);
    console.warn("! the site will publish the data as it was at the last successful sync.");
    console.warn("!".repeat(72));
    return;
  }
  console.warn("!".repeat(72));
  throw new Error("there is no data/meetups.json to fall back on");
}

async function main() {
  let csvText;
  try {
    csvText = await readSource();
  } catch (error) {
    keepExisting(error.message);
    return;
  }

  let result;
  try {
    result = buildMeetups(csvText);
  } catch (error) {
    keepExisting(error.message);
    return;
  }

  const { meetups, problems, blank, notApproved } = result;

  if (problems.length) {
    console.log(`\n${problems.length} row${problems.length === 1 ? " needs" : "s need"} attention:`);
    for (const problem of problems) console.log(`  - ${problem}`);
  }

  if (meetups.length === 0) {
    keepExisting("no approved rows in the sheet passed validation");
    return;
  }

  const previous = fs.existsSync(OUTPUT_PATH)
    ? JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf8"))
    : [];

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(meetups, null, 2)}\n`);

  const states = new Set(meetups.map((m) => stateSlug(m.state)));
  const cities = new Set(meetups.map((m) => `${stateSlug(m.state)}/${citySlug(m.city)}`));

  console.log("");
  console.log(`wrote data/meetups.json`);
  console.log(`  meetups published: ${meetups.length}${previous.length ? ` (was ${previous.length})` : ""}`);
  console.log(`  state pages:       ${states.size}`);
  console.log(`  city pages:        ${cities.size}`);
  console.log(`  total pages:       ${1 + states.size + cities.size + meetups.length} plus /submit and 404`);
  console.log(`  skipped:           ${notApproved} not approved, ${blank} blank, ${problems.length} needing attention`);
  console.log(`  unverified badge:  ${meetups.filter((m) => m.needsVerification).length}`);
}

main().catch((error) => {
  console.error(`\nsync failed: ${error.message}`);
  process.exit(1);
});
