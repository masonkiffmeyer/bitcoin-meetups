import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllStatesWithMeetups, getMeetupsByStateSlug } from "@/data/meetups";
import MeetupCard from "@/components/MeetupCard";

type Props = { params: Promise<{ state: string }> };

export async function generateStaticParams() {
  const states = getAllStatesWithMeetups();
  return states.map((s) => ({ state: s.slug }));
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

  // Group by city for cleaner organization
  const byCity = new Map<string, typeof stateMeetups>();
  for (const m of stateMeetups) {
    const existing = byCity.get(m.city) || [];
    existing.push(m);
    byCity.set(m.city, existing);
  }
  const cities = Array.from(byCity.keys()).sort();

  const beginnerFriendly = stateMeetups.filter((m) => m.beginnerFriendly).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-ink-muted mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-bitcoin-orange">
          All meetups
        </Link>
        <span>›</span>
        <span className="text-ink-secondary">{stateName}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl text-white font-medium tracking-tight mb-3">
          Bitcoin Meetups in {stateName}
        </h1>
        <p className="text-ink-secondary text-base max-w-2xl leading-relaxed">
          {stateMeetups.length} active bitcoin {stateMeetups.length === 1 ? "meetup" : "meetups"}{" "}
          listed across {cities.length} {cities.length === 1 ? "city" : "cities"} in {stateName}.
          {beginnerFriendly > 0 && ` ${beginnerFriendly} beginner-friendly.`}
        </p>
      </header>

      {/* Stats strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <div className="rounded-lg border border-line-subtle bg-bg-card p-4">
          <div className="text-ink-muted text-xs tracking-widest mb-1">MEETUPS</div>
          <div className="text-2xl text-white font-medium">{stateMeetups.length}</div>
        </div>
        <div className="rounded-lg border border-line-subtle bg-bg-card p-4">
          <div className="text-ink-muted text-xs tracking-widest mb-1">CITIES</div>
          <div className="text-2xl text-white font-medium">{cities.length}</div>
        </div>
        <div className="rounded-lg border border-line-subtle bg-bg-card p-4">
          <div className="text-ink-muted text-xs tracking-widest mb-1">BEGINNER FRIENDLY</div>
          <div className="text-2xl text-white font-medium">{beginnerFriendly}</div>
        </div>
        <div className="rounded-lg border border-line-subtle bg-bg-card p-4">
          <div className="text-ink-muted text-xs tracking-widest mb-1">STATE</div>
          <div className="text-2xl text-white font-medium">{stateAbbr}</div>
        </div>
      </section>

      {/* City sections */}
      <section className="mb-12">
        {cities.map((city) => {
          const cityMeetups = byCity.get(city)!;
          return (
            <div key={city} className="mb-8">
              <h2 className="text-xl text-white font-medium mb-4 border-b border-line-subtle pb-2">
                {city}
                <span className="text-ink-muted text-sm font-normal ml-2">
                  ({cityMeetups.length} {cityMeetups.length === 1 ? "meetup" : "meetups"})
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cityMeetups.map((m) => (
                  <MeetupCard key={m.id} meetup={m} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Missing? CTA */}
      <section className="rounded-lg border border-bitcoin-orange/30 bg-bitcoin-orange/5 p-6 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-white font-medium text-base mb-1">
            Missing a {stateName} meetup?
          </div>
          <div className="text-ink-secondary text-sm">
            Help us keep this directory complete. Takes less than a minute.
          </div>
        </div>
        <Link
          href="/submit"
          className="bg-bitcoin-orange text-bg-dark px-5 py-2.5 rounded text-sm font-medium hover:bg-bitcoin-orangeLight transition-colors"
        >
          Submit a meetup
        </Link>
      </section>

      <div className="border-t border-line-subtle pt-6">
        <Link href="/" className="text-ink-muted text-sm hover:text-bitcoin-orange">
          ← Back to all meetups
        </Link>
      </div>
    </div>
  );
}
