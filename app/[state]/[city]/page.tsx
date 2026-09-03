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
} from "@/lib/meetups";
import CityPinMap from "@/components/CityPinMap";

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

export default async function CityPage({ params }: Props) {
  const { state, city } = await params;
  const cityMeetups = getMeetupsByCityInState(state, city);
  if (cityMeetups.length === 0) notFound();

  const cityName = cityMeetups[0].city;
  const stateName = cityMeetups[0].state;
  const stateAbbr = cityMeetups[0].stateAbbr;
  const weeklyCount = cityMeetups.filter((m) => getFreq(m) === "weekly").length;
  const newcomerCount = cityMeetups.filter((m) => m.beginnerFriendly).length;

  const otherCities = getCitiesInState(state).filter((c) => c.slug !== city);

  return (
    <section className="section">
      <div className="breadcrumb mb-6">
        / <Link href="/">UNITED STATES</Link> /{" "}
        <Link href={`/${state}`}>{stateName.toUpperCase()}</Link> /{" "}
        <span className="current">{cityName.toUpperCase()}</span>
      </div>

      <div className="page-hero">
        <div className="page-hero-left">
          <div className="eyebrow-orange" style={{ marginBottom: 8 }}>
            / City directory · {stateAbbr}
          </div>
          <h1 className="hero-title">
            Bitcoin in <em>{cityName}</em>
          </h1>
          <p className="page-hero-desc">
            {cityMeetups.length} active bitcoin {cityMeetups.length === 1 ? "meetup" : "meetups"} in{" "}
            {cityName}, {stateName}. Most groups are walk-in, all are free.
          </p>
          <div className="page-hero-actions">
            <Link href="/" className="btn btn-primary">
              Show on map →
            </Link>
            <Link href="/submit" className="btn btn-ghost">
              Submit a meetup
            </Link>
          </div>
        </div>
        <CityPinMap cityName={cityName} meetups={cityMeetups} />
      </div>

      {/* Dark stats band */}
      <div className="dark-stats-band" style={{ marginTop: 48 }}>
        <div className="dark-stats-band-inner">
          <div className="dark-stat">
            <span className="dark-stat-num">{cityMeetups.length}</span>
            <span className="dark-stat-label">Active meetups</span>
          </div>
          <div className="dark-stat">
            <span className="dark-stat-num">{weeklyCount}</span>
            <span className="dark-stat-label">Weekly cadence</span>
          </div>
          {newcomerCount > 0 && (
            <div className="dark-stat">
              <span className="dark-stat-num">{newcomerCount}</span>
              <span className="dark-stat-label">Newcomer-friendly</span>
            </div>
          )}
          <div className="dark-stat">
            <span className="dark-stat-num">$0</span>
            <span className="dark-stat-label">Cost to attend</span>
          </div>
          <span className="dark-stats-live">
            <span className="live-dot" />
            LIVE
          </span>
        </div>
      </div>

      {/* Meetup cards */}
      <div className="state-main-head" style={{ marginTop: 56 }}>
        <h2 style={{ fontSize: 28, margin: 0, letterSpacing: "-0.015em", fontWeight: 500 }}>
          All meetups in {cityName}
        </h2>
        <div className="state-main-sort">
          {cityMeetups.length} {cityMeetups.length === 1 ? "LISTING" : "LISTINGS"}
        </div>
      </div>

      <div className="meetup-card-grid">
        {cityMeetups.map((m) => {
          const freq = getFreq(m);
          return (
            <Link
              key={m.id}
              href={`/${state}/${city}/${m.slug}`}
              className="meetup-card"
            >
              <div className="meetup-card-head">
                <div>
                  <span className={`pill ${freq === "weekly" ? "pill-orange" : ""}`}>
                    ● {freq === "weekly" ? "WEEKLY" : "MONTHLY"}
                  </span>
                  <h3 className="meetup-card-title">{m.name}</h3>
                  <p className="meetup-card-venue">{m.venue}</p>
                </div>
                {m.needsVerification && (
                  <div className="meetup-card-meta">
                    UNVERIFIED
                  </div>
                )}
              </div>

              <p className="meetup-card-desc">{m.description}</p>

              {m.tags && m.tags.length > 0 && (
                <div className="meetup-card-tags">
                  {m.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="meetup-card-foot">
                <div className="meetup-card-foot-cell">
                  <span className="k">Cadence</span>
                  <span className="v">{m.cadence}</span>
                </div>
                <div className="meetup-card-foot-cell">
                  <span className="k">Attend</span>
                  <span className="v">{m.attendance}</span>
                </div>
                <span className="btn btn-primary">Open →</span>
              </div>
            </Link>
          );
        })}
      </div>

      {otherCities.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <div className="eyebrow-orange mb-3">/ Nearby</div>
          <div className="filter-bar">
            {otherCities.map((c) => (
              <Link key={c.slug} href={`/${state}/${c.slug}`} className="chip">
                {c.name} <span className="num">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="tail eyebrow">
        <Link href={`/${state}`}>← Back to {stateName} meetups</Link>
      </div>
    </section>
  );
}
