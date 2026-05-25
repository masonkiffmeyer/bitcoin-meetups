import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getAllStatesWithMeetups,
  getMeetupsByStateSlug,
  getFreq,
} from "@/data/meetups";
import StateOutlineMap from "@/components/StateOutlineMap";
import StateDirectoryClient from "@/components/StateDirectoryClient";

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

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const stateMeetups = getMeetupsByStateSlug(state);
  if (stateMeetups.length === 0) notFound();

  const stateName = stateMeetups[0].state;
  const stateAbbr = stateMeetups[0].stateAbbr;

  const cityCounts: Record<string, number> = {};
  for (const m of stateMeetups) {
    cityCounts[m.city] = (cityCounts[m.city] ?? 0) + 1;
  }
  const cities = Object.keys(cityCounts).sort(
    (a, b) => cityCounts[b] - cityCounts[a] || a.localeCompare(b)
  );

  const weeklyCount = stateMeetups.filter((m) => getFreq(m) === "weekly").length;
  const newcomerCount = stateMeetups.filter((m) => m.beginnerFriendly).length;

  return (
    <section className="section">
      <div className="breadcrumb mb-6">
        / <Link href="/">UNITED STATES</Link> /{" "}
        <span className="current">{stateName.toUpperCase()}</span>
      </div>

      <div className="page-hero">
        <div className="page-hero-left">
          <div className="page-hero-titleblock">
            <div className="page-hero-badge">{stateAbbr}</div>
            <div>
              <div className="eyebrow-orange" style={{ marginBottom: 6 }}>
                / State directory
              </div>
              <h1 className="hero-title">
                Bitcoin meetups in <em>{stateName}</em>
              </h1>
            </div>
          </div>
          <p className="page-hero-desc">
            {stateMeetups.length} active bitcoin{" "}
            {stateMeetups.length === 1 ? "meetup" : "meetups"} across {cities.length}{" "}
            {cities.length === 1 ? "city" : "cities"} in {stateName}. Most groups are
            walk-in, all are free.
          </p>
          <div className="stat-row">
            <div className="stat-block">
              <span className="stat-block-num">{cities.length}</span>
              <span className="stat-block-label">{cities.length === 1 ? "City" : "Cities"}</span>
            </div>
            <div className="stat-block">
              <span className="stat-block-num">{stateMeetups.length}</span>
              <span className="stat-block-label">{stateMeetups.length === 1 ? "Meetup" : "Meetups"}</span>
            </div>
            <div className="stat-block">
              <span className="stat-block-num">{weeklyCount}</span>
              <span className="stat-block-label">Weekly</span>
            </div>
            <div className="stat-block">
              <span className="stat-block-num">{newcomerCount}</span>
              <span className="stat-block-label">Newcomer</span>
              <span className="stat-block-sub">friendly</span>
            </div>
          </div>
        </div>

        <StateOutlineMap stateAbbr={stateAbbr} meetups={stateMeetups} />
      </div>

      <StateDirectoryClient
        stateSlugValue={state}
        meetups={stateMeetups}
        cities={cities}
        cityCounts={cityCounts}
      />

      <div className="cta-strip" style={{ marginTop: 56 }}>
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
