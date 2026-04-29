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
├── submit/page.tsx                       # Submission form
├── api/submit/route.ts                   # POST endpoint for submissions
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
├── meetups.ts                            # 55 seed meetups + slug/lookup helpers
└── submissions.json                      # Created on first submission (gitignored)

lib/
└── types.ts                              # Meetup and State types
```

## URL structure

```
/                                  Home directory (search, filter, map, address book)
/[state]                           State hub  (e.g. /virginia)
/[state]/[city]                    City hub   (e.g. /virginia/lynchburg)
/[state]/[city]/[slug]             Meetup     (e.g. /virginia/lynchburg/lynchburg-bitcoiners)
/submit                            Submission form
/submit?update=[slug]              Update a listing
/api/submit                        POST endpoint
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

The seed data in `data/meetups.ts` contains 55 meetups. **54 of them are marked `needsVerification: true`** — they were populated from general knowledge and public indicators, but you MUST personally verify each one before public launch. Check:

1. Does this meetup actually exist and still meet?
2. Is the city, coordinates, and cadence correct?
3. Is the contact info (website, X handle, etc.) accurate?

Only **Lynchburg Bitcoiners** is flagged as verified (`verified: true`) since that's Mason's local meetup.

Unverified meetups display a "Listing unverified" badge on their detail page so it's honest with visitors during the soft-launch phase. Once you verify an entry, set `verified: true` and `needsVerification: false`.

## Deployment plan

1. **Now (local):** `npm run dev` on localhost
2. **Soon:** Deploy to Railway, point `meetup.lyhrealtor.com` at it for board showcase
3. **Eventually:** Migrate DNS to `meetups.bitcoinisbetter.org` once board approves

## Next steps (handoff to Carlo)

Things not yet built, in recommended priority order:

1. **Verify the seed data.** Go through all 54 unverified meetups. Remove dead ones, correct bad info, confirm with real sources.
2. **Add more meetups.** Target 150-300 for a credible public launch. The AI-assisted city sweep approach is documented in the BIB proposal PDF.
3. **Email submission notifications.** The `/api/submit` route currently only writes to a JSON file. Wire it to send an email to Mason when a new submission arrives (SendGrid, Resend, or Sender.net).
4. **Postgres migration.** Replace `data/submissions.json` with a real database on Railway once submission volume grows.
5. **Admin review UI.** Build a simple `/admin` page protected by basic auth that lets you approve/reject pending submissions and merge them into `meetups.ts`.
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
