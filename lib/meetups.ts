import type { Meetup } from "@/lib/types";
import meetupsData from "@/data/meetups.json";

// =============================================================================
// DATA SOURCE
// =============================================================================
// The Meetups Database sheet is the source of truth for every meetup on this
// site. Nothing here is edited by hand.
//
//   tab:  merged_meetups_final.csv
//   sync: npm run sync   (also runs automatically before npm run build)
//
// `npm run sync` fetches the published-to-web CSV of that tab and writes
// data/meetups.json, which is what this module reads. The JSON is committed so
// the site still builds if the sheet can't be reached. To change a meetup, edit
// its row in the sheet and republish. See scripts/sync-meetups.mjs for the
// column rules, and README.md for the maintenance flow.
// =============================================================================

export const meetups = meetupsData as Meetup[];

export function citySlug(city: string): string {
  return city.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

export function stateSlug(state: string): string {
  return state.toLowerCase().replace(/\s+/g, "-");
}

export function getMeetupBySlug(slug: string): Meetup | undefined {
  return meetups.find((m) => m.slug === slug);
}

export function getMeetupsByState(stateAbbr: string): Meetup[] {
  return meetups.filter((m) => m.stateAbbr.toLowerCase() === stateAbbr.toLowerCase());
}

export function getMeetupsByStateSlug(stateSlugParam: string): Meetup[] {
  return meetups.filter((m) => stateSlug(m.state) === stateSlugParam.toLowerCase());
}

export function getAllStatesWithMeetups(): Array<{ name: string; abbr: string; slug: string; count: number }> {
  const map = new Map<string, { name: string; abbr: string; count: number }>();
  for (const m of meetups) {
    const existing = map.get(m.stateAbbr);
    if (existing) existing.count++;
    else map.set(m.stateAbbr, { name: m.state, abbr: m.stateAbbr, count: 1 });
  }
  return Array.from(map.values())
    .map((s) => ({ ...s, slug: stateSlug(s.name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFreq(m: Meetup): "weekly" | "monthly" {
  return /week|multiple events/i.test(m.cadence) ? "weekly" : "monthly";
}

export function getMeetupsByCityInState(stateSlugParam: string, citySlugParam: string): Meetup[] {
  return meetups.filter(
    (m) => stateSlug(m.state) === stateSlugParam && citySlug(m.city) === citySlugParam
  );
}

export function getCitiesInState(stateSlugParam: string): Array<{ name: string; slug: string; count: number }> {
  const inState = meetups.filter((m) => stateSlug(m.state) === stateSlugParam);
  const map = new Map<string, { name: string; count: number }>();
  for (const m of inState) {
    const existing = map.get(m.city);
    if (existing) existing.count++;
    else map.set(m.city, { name: m.city, count: 1 });
  }
  return Array.from(map.values())
    .map((c) => ({ ...c, slug: citySlug(c.name) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getMeetupByPath(stateSlugParam: string, citySlugParam: string, meetupSlug: string): Meetup | undefined {
  return meetups.find(
    (m) =>
      stateSlug(m.state) === stateSlugParam &&
      citySlug(m.city) === citySlugParam &&
      m.slug === meetupSlug
  );
}
