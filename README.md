# Bitcoin Meetups Directory

A searchable directory of in-person bitcoin meetups across the United States. Built as a standalone Next.js app that will eventually live at `meetups.bitcoinisbetter.org`.

Interim deployment target: `meetup.lyhrealtor.com` for showcase purposes.

## What this is

- Map-based discovery of bitcoin meetups (interactive, pin-per-meetup)
- Searchable and filterable list view
- Individual meetup pages with full detail and schema.org structured data
- State hub pages for SEO (`/state/virginia`, `/state/texas`, etc.)
- Organizer submission form that saves to a local JSON file
- Dark theme with Bitcoin Is Better branding (navy + orange)

## Tech stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Leaflet + OpenStreetMap for the map
- Static JSON for data (will migrate to Postgres when submissions go live)

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Project structure

```
app/
├── page.tsx                  # Main directory: map, search, filter, list
├── layout.tsx                # Root layout with nav and footer
├── globals.css               # Dark theme + Leaflet overrides
├── not-found.tsx             # 404
├── meetups/[slug]/page.tsx   # Individual meetup detail pages
├── state/[state]/page.tsx    # State hub pages (SEO)
├── submit/page.tsx           # Submission form
└── api/submit/route.ts       # POST endpoint for submissions

components/
├── SiteNav.tsx
├── SiteFooter.tsx
├── MeetupMap.tsx             # Leaflet map (client component)
├── MeetupMapWrapper.tsx      # SSR-safe dynamic import wrapper
└── MeetupCard.tsx

data/
├── meetups.ts                # 50 seed meetups + helper functions
└── submissions.json          # Created on first submission (gitignored)

lib/
└── types.ts                  # Meetup and State types
```

## IMPORTANT: Data verification before launch

The seed data in `data/meetups.ts` contains 50 meetups. **49 of them are marked `needsVerification: true`** — they were populated from general knowledge and public indicators, but you MUST personally verify each one before public launch. Check:

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

1. **Verify the seed data.** Go through all 49 unverified meetups. Remove dead ones, correct bad info, confirm with real sources.
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

- Agent branding: "Bitcoin Is Better" only. Do NOT add "LYH Realtor" labels anywhere.
- Primary accent: `#F7931A` (bitcoin orange)
- Dark bg: `#0A0E1A`
- No em dashes in copy (site-wide rule)

## License

Not yet determined. Current assumption: MIT once open sourced.
