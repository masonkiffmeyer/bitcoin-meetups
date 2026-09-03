# Bitcoin Meetups Directory

A searchable directory of in-person bitcoin meetups across the United States. Built as a standalone Next.js app that will eventually live at `meetups.bitcoinisbetter.org`.

Interim deployment target: `meetup.lyhrealtor.com` for showcase purposes.

## What this is

- Map-based discovery of bitcoin meetups (interactive, pin-per-meetup, real US state geometry)
- Searchable and filterable directory with state, city, and meetup-level pages
- SEO-friendly hierarchical URLs: `/[state]`, `/[state]/[city]`, `/[state]/[city]/[slug]`
- Per-meetup detail pages with schema.org structured data
- Organizer submissions through a Google Form that feeds the same spreadsheet the site builds from
- Dark theme: warm-tinted near-black background with bitcoin orange accents, Geist + Geist Mono typography

## The spreadsheet is the source of truth

Every meetup on the site comes from one place: the **Meetups Database** spreadsheet,
tab `merged_meetups_final.csv`. No meetup data lives in the code.

```
Google Sheet  ->  npm run sync  ->  data/meetups.json  ->  next build  ->  out/
```

`npm run sync` (`scripts/sync-meetups.mjs`) fetches the published-to-web CSV of that tab
and writes `data/meetups.json`. It runs automatically before `npm run build`, so a normal
build always picks up the current sheet. `data/meetups.json` is committed to git on
purpose: if the sheet cannot be reached, the build keeps the last good data instead of
failing or publishing an empty site.

### How the sheet is read

- The **header row is found by name**, not by row number. The script looks for the row
  containing `Meetup Name`, so rows can be inserted above the header without breaking
  anything. Today that is row 2, with the Google Form link on row 1 and data from row 3.
- **Columns are read by header name**, not by letter, so columns can be added or moved.
  Do not rename the header cells themselves.
- Only rows where **Approved** is `TRUE` are published. Set it to `FALSE` and the meetup
  disappears from the site without the row being deleted.
- Rows with an empty **Meetup Name** are skipped as blank.
- **Verified** drives the "Listing unverified" badge. `FALSE` shows the badge.
- **Display City** wins over **City** when it is filled in. City is often the suburb a BTC
  Map pin sits in ("Tiburon"); Display City is the metro a visitor would search for
  ("San Francisco"). It is also how a city with a slash or comma in it gets a usable URL.
- **State Abbr** determines the state name in the URL, through a fixed table of the 50
  states plus DC and PR. This is why Bitcoin District DC lives at
  `/district-of-columbia/washington/...` and not at a comma-laden path.
- **Slug** is the last part of the meetup's URL. Fill it in to keep a URL stable. Leave it
  blank on a new row and one is generated from the meetup name.
- **Lat** and **Lng** are required. A row without them has no map pin, so it is skipped.
- Blank **Cadence** and **Venue** cells fall back to "Schedule not confirmed" and
  "Venue not confirmed" on the page.
- A `t.me` link in **Website** is shown as a Telegram link.
- **Tags** is an optional semicolon-separated list (`hub; flagship; weekly`).

A row that fails validation is reported by name and row number and then skipped. One bad
row never stops the rest of the site from building. Watch the output of `npm run sync` for
lines under "rows need attention".

### Updating the directory

| What happened | What to do |
| --- | --- |
| An organizer sends a correction | Edit the row in the sheet, open the project in Replit, click Republish |
| A new meetup comes in from the Google Form | Copy the response row onto the main tab, fill in Lat, Lng, State Abbr and Display City if needed, set Approved to `TRUE`, republish |
| You verified a listing | Fill in Contacted Date, Contacted By and Response to Contact, set Verified to `TRUE`, republish |
| A meetup is dead | Set Approved to `FALSE`, republish |
| Code or design change | Push to GitHub, then pull in Replit and click Republish |

Pushing to GitHub does **not** redeploy the site on its own. Someone has to open the
project in Replit, pull, and click Republish.

## Running locally

```bash
npm install
npm run dev            # http://localhost:3000
```

```bash
npm run sync           # refresh data/meetups.json from the sheet
npm run build          # syncs first, then exports the static site to out/
```

`npm run sync -- --file some-export.csv` runs the same import against a local CSV, which
is handy for testing a change to the sheet before it is published.

The published CSV URL lives at the top of `scripts/sync-meetups.mjs`. Setting the
`MEETUPS_SHEET_CSV_URL` environment variable overrides it without editing the file.

## Project structure

```
app/
├── page.tsx                              # Home: hero, map, index directory, drawer
├── layout.tsx                            # Root layout with SiteNav + SiteFooter
├── globals.css                           # Design tokens + every component class
├── not-found.tsx                         # 404 (.empty card)
├── submit/page.tsx                       # Points organizers at the Google Form
├── [state]/page.tsx                      # State hub
├── [state]/[city]/page.tsx               # City hub
└── [state]/[city]/[slug]/page.tsx        # Individual meetup detail

components/
├── SiteNav.tsx
├── SiteFooter.tsx
├── MeetupMap.tsx                         # SVG map (d3-geo + topojson)
├── MeetupMapWrapper.tsx                  # SSR-safe dynamic import wrapper
├── IndexDirectory.tsx                    # Two-column address-book directory (home page)
└── MeetupDrawer.tsx                      # Slide-in detail panel (home page)

data/
└── meetups.json                          # Generated by npm run sync. Committed, never hand-edited.

lib/
├── meetups.ts                            # Reads meetups.json + slug/lookup helpers
└── types.ts                              # Meetup and State types

scripts/
├── sync-meetups.mjs                      # Sheet -> data/meetups.json
├── csv-utils.mjs                         # CSV parsing shared by the scripts
└── export-sheet-columns.mjs              # One-time helper from the migration off meetups.ts
```

## Tech stack

- Next.js 15 (App Router) + React 19, exported as a static site (`output: "export"`)
- TypeScript
- Custom CSS design system (CSS custom properties + semantic class names) in `app/globals.css`
- Tailwind CSS for layout utilities only (`flex`, `grid`, spacing, sizing). Color and typography come from CSS variables and the named class system, not Tailwind color utilities.
- `d3-geo` + `topojson-client` for the SVG US map (Albers USA projection, fed by `us-atlas` topojson loaded at runtime)
- Google Sheet as the data source, imported at build time by `npm run sync`

There is no server and no database. `next build` writes plain HTML, CSS and JS to `out/`,
which is what a static host serves.

## URL structure

```
/                                  Home directory (search, filter, map, address book)
/[state]                           State hub  (e.g. /texas)
/[state]/[city]                    City hub   (e.g. /texas/austin)
/[state]/[city]/[slug]             Meetup     (e.g. /texas/austin/bitcoin-commons-austin)
/submit                            Link out to the Google Form
```

`trailingSlash: true` is set, so every page exports as a folder with an `index.html`
inside it, which is what static hosts expect.

City slugs strip periods so `St. Louis` becomes `st-louis`. State slugs lowercase the
canonical state name. Meetup slugs come from the sheet's Slug column. Slug helpers live in
`lib/meetups.ts` (`stateSlug`, `citySlug`, `getMeetupByPath`, `getCitiesInState`,
`getMeetupsByCityInState`).

## Design system

`app/globals.css` is the single source of truth for visual style. Key pieces:

- **Color tokens:** `--orange`, `--orange-soft`, `--orange-line`, `--bg`, `--bg-elev`, `--bg-elev-2`, `--line`, `--line-strong`, `--text`, `--text-mute`, `--text-dim`, `--green`, `--red`
- **Typography:** Geist (body) + Geist Mono (`.mono`, `.eyebrow`, monospace accents)
- **Layout:** `.section` (max-width 1400, padded), `.hero-titlebar`, `.stat-strip`
- **Directory rows:** `.drow` family. `.drow-no-city` modifier hides the city column for hubs where city is implicit.
- **Drawer / detail:** `.drawer-hero`, `.drawer-eyebrow`, `.drawer-name`, `.drawer-loc`, `.drawer-body`, `.drawer-row` (with `.k` label), `.drawer-actions`. Reused on the meetup detail page in a centered max-width layout.
- **CTAs:** `.cta-strip` (orange), `.btn` / `.btn-primary` / `.btn-ghost`
- **Forms:** `.field`, `.field-check`, `.divider`, `.alert-error`
- **Cards:** `.info-card` family
- **Empty/404:** `.empty`, `.empty-mark` (dashed-ringed orange circle)
- **Misc:** `.chip`, `.freq-dot`, `.eyebrow`, `.tail` (back-link footer)

## IMPORTANT: Data verification before launch

The 112 listings were merged from BTC Map, bitcoin-only.com/meetups and the earlier
hand-built entries on this site. **Every row still has `Verified` set to `FALSE`** and
carries a "Listing unverified" badge on its detail page. Work through them in the sheet:

1. Does this meetup actually exist and still meet?
2. Are the city, coordinates and cadence correct?
3. Is the contact info (website, X handle, etc.) accurate?

Good heuristic for activity: does the linked X account have a post within the last 90
days, or does the linked Meetup.com group have an event scheduled in the next 60 days? If
neither, set Approved to `FALSE`.

Record the work in the sheet as you go (Contacted Date, Contacted By, Response to
Contact), set `Verified` to `TRUE` when confirmed, and republish.

Two things to know about the merged data:

- **Coordinates are city centers, not venues** (except PubKey, Bitcoin Park, Bitcoin
  Commons and Georgetown Bitcoin, which have documented addresses).
- **Display City is filled in for twelve rows** where the sheet's City is the suburb a BTC
  Map pin sits in rather than the metro a visitor would search for: Bay Area Bitcoiners
  (Tiburon to San Francisco), SD Bitcoiners, DTX Bitcoiners, San Antonio Bitcoin Club,
  BitPlebs LA, Bitcoin and Beer Denver, Denver BitDevs, BTC Lincoln Land, Michigan Bitcoin
  and Chattanooga Bitcoin, plus Bitcoin District DC and Bitcoin101, whose raw City cells
  would break a URL. Others still carry a suburb pending confirmation of where the group
  actually meets: Ann Arbor Bitcoin (Dexter), SLC-BTC (Taylorsville), Nola Bitcoin
  (Chalmette), Albany Bitcoin Group (Voorheesville), Columbia SC Bitcoin (Woodfield).

## Deployment

The site is a static export hosted on Replit.

1. Open the project in Replit and pull the latest from GitHub
2. Build command: `npm run sync && npm run build` (public directory: `out`)
3. Click Republish

A push to GitHub does not republish by itself. The `replit-verify` TXT record in GoDaddy
has to stay in place permanently, since Replit uses it to renew the SSL certificate.

## Next steps

Things not yet built, in recommended priority order:

1. **Verify the seed data.** Go through all 112 unverified listings in the sheet. Remove
   dead ones, correct bad info, confirm with real sources.
2. **Add more meetups.** Target 150-300 for a credible public launch. The AI-assisted city
   sweep approach is documented in the BIB proposal PDF.
3. **Organic event feed.** Pull bitcoin calendar events from Nostr (NIP-52) and show
   upcoming events on meetup detail pages.
4. **Sitemap and robots.txt.** For SEO. Generate dynamically from the meetup list.
5. **OG images.** Per-meetup Open Graph images for nicer social sharing.

Email notifications, a Postgres migration and an admin review UI were on this list while
submissions were handled by an API route. The Google Form plus the sheet now covers that,
so they are off the list.

The sheet has no column for Nostr or Telegram contact details yet. If a submission comes
in with one, add a `Nostr` or `Telegram` column and the sync will pick it up by name.

## Diagnosis-first prompt pattern for Carlo

When asking Carlo to fix styling or layout bugs in this codebase, use the established pattern:
> "Before changing anything, show me the current HTML output and all applied CSS for [element]. I want to understand the issue before you fix it."

Then review the diagnosis and give Carlo the exact fix.

## Branding notes

- Site branding: "Bitcoin Is Better" only. Do NOT add "LYH Realtor" labels anywhere.
- Primary accent: `#F7931A` (bitcoin orange)
- Page background: `#0A0908` (warm near-black, set via `--bg`)
- No em dashes in copy (site-wide rule)

## License

Not yet determined. Current assumption: MIT once open sourced.
