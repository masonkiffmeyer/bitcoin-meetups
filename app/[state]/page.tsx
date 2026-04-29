import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllStatesWithMeetups,
  getMeetupsByStateSlug,
  citySlug,
} from "@/data/meetups";
import type { Meetup } from "@/lib/types";

type Props = { params: Promise<{ state: string }> };

export async function generateStaticParams() {
  return getAllStatesWithMeetups().map((s) => ({ state: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const stateMeetups = getMeetupsByStateSlug(state);
  if (stateMeetups.length === 0) return { title: "State not found" };
  const stateName = stateMeetups[0].state;
  return {
    title: `Bitcoin Meetups in ${stateName} | Bitcoin Is Better`,
    description: `Find bitcoin meetups across ${stateName}. ${stateMeetups.length} active bitcoin communities listed, with locations, cadence, and contact info for each.`,
    keywords: [
      `bitcoin meetup ${stateName}`,
      `${stateName} bitcoin community`,
      `bitcoin meetups near me ${stateName}`,
    ],
  };
}

function rowLink(m: Meetup): string {
  if (m.website) return `${m.website.replace(/^https?:\/\//, "")} ↗`;
  if (m.twitter) return `@${m.twitter} ↗`;
  return "";
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const stateMeetups = getMeetupsByStateSlug(state);
  if (stateMeetups.length === 0) notFound();

  const stateName = stateMeetups[0].state;
  const stateAbbr = stateMeetups[0].stateAbbr;

  const byCity = new Map<string, Meetup[]>();
  for (const m of stateMeetups) {
    const list = byCity.get(m.city) || [];
    list.push(m);
    byCity.set(m.city, list);
  }
  const cities = Array.from(byCity.keys()).sort();

  return (
    <section className="section">
      <div className="eyebrow mb-6">
        <Link href="/">All meetups</Link> · {stateName}
      </div>

      <h1 className="hero-title">
        Bitcoin Meetups in <em>{stateName}</em>
      </h1>
      <p className="hero-sub">
        {stateMeetups.length} active bitcoin{" "}
        {stateMeetups.length === 1 ? "meetup" : "meetups"} listed across {cities.length}{" "}
        {cities.length === 1 ? "city" : "cities"} in {stateName}.
      </p>

      <div className="stat-strip mt-12 mb-12">
        <div className="stat-strip-cell">
          <span className="stat-strip-num">{stateMeetups.length}</span>
          <span className="stat-strip-label">Meetups</span>
        </div>
        <div className="stat-strip-cell">
          <span className="stat-strip-num">{cities.length}</span>
          <span className="stat-strip-label">Cities</span>
        </div>
        <div className="stat-strip-cell">
          <span className="stat-strip-num">{stateAbbr}</span>
          <span className="stat-strip-label">State</span>
        </div>
      </div>

      <div className="mb-12">
        {cities.map((city) => {
          const list = byCity.get(city)!;
          return (
            <div key={city} className="dir-state-block">
              <div className="dir-state-label">
                <Link
                  href={`/${state}/${citySlug(city)}`}
                  className="dir-state-name"
                >
                  {city}
                </Link>
                <span className="dir-state-count">{list.length}</span>
              </div>
              {list.map((m) => (
                <Link
                  key={m.id}
                  href={`/${state}/${citySlug(m.city)}/${m.slug}`}
                  className="drow drow-no-city"
                >
                  <span className="drow-marker" />
                  <span className="drow-name">{m.name}</span>
                  <span className="drow-city">{m.city}</span>
                  <span className="drow-cadence">{m.cadence}</span>
                  <span className="drow-link">{rowLink(m)}</span>
                </Link>
              ))}
            </div>
          );
        })}
      </div>

      <div className="cta-strip">
        <div>
          <h3 className="cta-title">Missing a {stateName} meetup?</h3>
          <p className="cta-sub">
            Help us keep this directory complete. Takes less than a minute.
          </p>
        </div>
        <Link href="/submit" className="btn btn-primary">
          Submit a meetup
        </Link>
      </div>

      <div className="tail eyebrow">
        <Link href="/">← Back to all meetups</Link>
      </div>
    </section>
  );
}
