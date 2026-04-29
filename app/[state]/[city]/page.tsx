import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  meetups,
  getMeetupsByCityInState,
  getCitiesInState,
  stateSlug,
  citySlug,
  getFreq,
} from "@/data/meetups";
import type { Meetup } from "@/lib/types";

type Props = { params: Promise<{ state: string; city: string }> };

export async function generateStaticParams() {
  const params: Array<{ state: string; city: string }> = [];
  for (const m of meetups) {
    params.push({ state: stateSlug(m.state), city: citySlug(m.city) });
  }
  const seen = new Set<string>();
  return params.filter((p) => {
    const key = `${p.state}/${p.city}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city } = await params;
  const cityMeetups = getMeetupsByCityInState(state, city);
  if (cityMeetups.length === 0) return { title: "City not found" };
  const cityName = cityMeetups[0].city;
  const stateName = cityMeetups[0].state;
  return {
    title: `Bitcoin Meetups in ${cityName}, ${stateName} | Bitcoin Is Better`,
    description: `Find bitcoin meetups in ${cityName}, ${stateName}. ${cityMeetups.length} active bitcoin community ${cityMeetups.length === 1 ? "listing" : "listings"} with locations and contact info.`,
    keywords: [
      `bitcoin meetup ${cityName}`,
      `${cityName} bitcoin community`,
      `bitcoin meetup ${cityName} ${stateName}`,
    ],
  };
}

function rowLink(m: Meetup): string {
  if (m.website) return `${m.website.replace(/^https?:\/\//, "")} ↗`;
  if (m.twitter) return `@${m.twitter} ↗`;
  return "";
}

export default async function CityPage({ params }: Props) {
  const { state, city } = await params;
  const cityMeetups = getMeetupsByCityInState(state, city);
  if (cityMeetups.length === 0) notFound();

  const cityName = cityMeetups[0].city;
  const stateName = cityMeetups[0].state;
  const stateAbbr = cityMeetups[0].stateAbbr;
  const weeklyCount = cityMeetups.filter((m) => getFreq(m) === "weekly").length;

  const otherCities = getCitiesInState(state).filter((c) => c.slug !== city);

  return (
    <section className="section">
      <div className="eyebrow mb-6">
        <Link href="/">All meetups</Link> ·{" "}
        <Link href={`/${state}`}>{stateName}</Link> · {cityName}
      </div>

      <h1 className="hero-title">
        Bitcoin Meetups in{" "}
        <em>
          {cityName}, {stateAbbr}
        </em>
      </h1>
      <p className="hero-sub">
        {cityMeetups.length} bitcoin {cityMeetups.length === 1 ? "meetup" : "meetups"} listed in{" "}
        {cityName}, {stateName}.
      </p>

      <div className="stat-strip mt-12 mb-12">
        <div className="stat-strip-cell">
          <span className="stat-strip-num">{cityMeetups.length}</span>
          <span className="stat-strip-label">Meetups</span>
        </div>
        <div className="stat-strip-cell">
          <span className="stat-strip-num">{weeklyCount}</span>
          <span className="stat-strip-label">Weekly</span>
        </div>
        <div className="stat-strip-cell">
          <span className="stat-strip-num">{stateAbbr}</span>
          <span className="stat-strip-label">State</span>
        </div>
      </div>

      <div className="mb-12">
        {cityMeetups.map((m) => (
          <Link
            key={m.id}
            href={`/${state}/${city}/${m.slug}`}
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

      {otherCities.length > 0 && (
        <div className="mb-12">
          <div className="eyebrow mb-4">Nearby cities in {stateName}</div>
          <div className="filter-bar">
            {otherCities.map((c) => (
              <Link key={c.slug} href={`/${state}/${c.slug}`} className="chip">
                {c.name} <span className="num">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="cta-strip">
        <div>
          <h3 className="cta-title">Missing a {cityName} meetup?</h3>
          <p className="cta-sub">
            Help us keep this directory complete. Takes less than a minute.
          </p>
        </div>
        <Link href="/submit" className="btn btn-primary">
          Submit a meetup
        </Link>
      </div>

      <div className="tail eyebrow">
        <Link href={`/${state}`}>← Back to {stateName} meetups</Link>
      </div>
    </section>
  );
}
