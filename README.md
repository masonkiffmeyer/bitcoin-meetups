# Bitcoin Meetups Directory

A searchable directory of in-person bitcoin meetups across the United States. Built as a standalone Next.js app that will eventually live at `meetups.bitcoinisbetter.org`.

Interim deployment target: `meetup.lyhrealtor.com` for showcase purposes.

## What this is

- Map-based discovery of bitcoin meetups (interactive, pin-per-meetup, real US state geometry)
- Searchable and filterable directory with state, city, and meetup-level pages
- SEO-friendly hierarchical URLs: `/[state]`, `/[state]/[city]`, `/[state]/[city]/[slug]`
- Per-meetup detail pages with schema.org structured data
- Organizer submission form that saves to a local JSON file
- Dark theme: warm-tinted near-black background with bitcoin orange accents, Geist + Geist Mono typography

## Tech stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Custom CSS design system (CSS custom properties + semantic class names) in `app/globals.css`
- Tailwind CSS for layout utilities only (`flex`, `grid`, spacing, sizing). Color and typography come from CSS variables and the named class system, not Tailwind color utilities.
- `d3-geo` + `topojson-client` for the SVG US map (Albers USA projection, fed by `us-atlas` topojson loaded at runtime)
- Static TypeScript module for data (will migrate to Postgres when submissions go live)

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Project structure

```
app/
├── page.tsx                              # Home: hero, map, index directory, drawer
├── layout.tsx                            # Root layout with SiteNav + SiteFooter
├── globals.css                           # Design tokens + every component class
├── not-found.tsx                         # 404 (.empty card)
├── submit/page.tsx                       # Links out to the Google Form
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
├── meetups.ts                            # 112 meetups (from master sheet) + slug/lookup helpers
└── submissions.json                      # Created on first submission (gitignored)

lib/
└── types.ts                              # Meetup and State types
```

## URL structure

```
/                                  Home directory (search, filter, map, address book)
/[state]                           State hub  (e.g. /texas)
/[state]/[city]                    City hub   (e.g. /texas/austin)
/[state]/[city]/[slug]             Meetup     (e.g. /texas/austin/bitcoin-commons-austin)
/submit                            Google Form hand-off
/submit?update=[slug]              Update a listing (same form, different copy)
```

City slugs strip periods so `St. Louis` becomes `st-louis`. Slug helpers live in `data/meetups.ts` (`stateSlug`, `citySlug`, `getMeetupByPath`, `getCitiesInState`, `getMeetupsByCityInState`).

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

`data/meetups.ts` contains 112 meetups across 40 states, transcribed from the
master spreadsheet (`Meetups_Database__merged_meetups_final`), which merges BTC
Map, bitcoin-only.com/meetups, and the earlier hand-built entries. **Every entry
is marked `needsVerification: true`** — none has been personally confirmed. You
MUST verify each one before public launch. Check:

1. Does this meetup actually exist and still meet?
2. Is the city, coordinates, and cadence correct?
3. Is the contact info (website, X handle, etc.) accurate?

Two things to know about the transcription:

- **Coordinates are city centers, not venues** (except PubKey, Bitcoin Park,
  Bitcoin Commons and Georgetown Bitcoin, which have documented addresses).
- **City is the one field the site overrides.** The sheet inherits BTC Map pin
  locations, which often name the suburb the pin sits in rather than the metro
  a visitor would search for. Ten groups are filed under their metro here — Bay
  Area Bitcoiners under San Francisco rather than Tiburon, SD Bitcoiners under
  San Diego rather than San Diego Country Estates, and so on. **Push these back
  into the spreadsheet** so the two stop disagreeing.

A handful of others still carry a suburb from the sheet even though the group's
own name suggests a metro — Ann Arbor Bitcoin under Dexter, SLC-BTC under
Taylorsville, Nola Bitcoin under Chalmette, Albany Bitcoin Group under
Voorheesville, Columbia SC Bitcoin under Woodfield. Left as-is pending
confirmation of where each actually meets; worth resolving during verification.

The header comment in `data/meetups.ts` lists every override in full, plus the
places where a raw spreadsheet value had to be adjusted to keep URLs valid.

Unverified meetups display a "Listing unverified" badge on their detail page so
it's honest with visitors during the soft-launch phase. Once you verify an
entry, set `verified: true` and `needsVerification: false`.

## Deployment plan

1. **Now (local):** `npm run dev` on localhost
2. **Soon:** Deploy to Railway, point `meetup.lyhrealtor.com` at it for board showcase
3. **Eventually:** Migrate DNS to `meetups.bitcoinisbetter.org` once board approves

## Next steps (handoff to Carlo)

Things not yet built, in recommended priority order:

1. **Verify the seed data.** Go through all 112 unverified meetups. Remove dead ones, correct bad info, confirm with real sources.
2. **Add more meetups.** Target 150-300 for a credible public launch. The AI-assisted city sweep approach is documented in the BIB proposal PDF.
3. **Submission notifications.** Organizer submissions arrive through the Google Form. Turn on form notifications (or a Sheets trigger) so Mason is emailed when a new response lands.
4. **Admin review flow.** Review responses in the linked Google Sheet and merge approved ones into `meetups.ts`. A richer `/admin` UI would need a server runtime, which this static export no longer has.
6. **Organic event feed.** Pull bitcoin calendar events from Nostr (NIP-52) and show upcoming events on meetup detail pages.
7. **Sitemap and robots.txt.** For SEO. Generate dynamically from the meetup list.
8. **OG images.** Per-meetup Open Graph images for nicer social sharing.

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
