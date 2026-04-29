import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  meetups,
  getMeetupsByCityInState,
  getCitiesInState,
  stateSlug,
  citySlug,
} from "@/data/meetups";
import MeetupCard from "@/components/MeetupCard";

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

  const otherCities = getCitiesInState(state).filter((c) => c.slug !== city);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <nav className="text-xs text-ink-muted mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-bitcoin-orange">
          All meetups
        </Link>
        <span>›</span>
        <Link href={`/${state}`} className="hover:text-bitcoin-orange">
          {stateName}
        </Link>
        <span>›</span>
        <span className="text-ink-secondary">{cityName}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl text-white font-medium tracking-tight mb-3">
          Bitcoin Meetups in {cityName}, {stateAbbr}
        </h1>
        <p className="text-ink-secondary text-base max-w-2xl leading-relaxed">
          {cityMeetups.length} bitcoin {cityMeetups.length === 1 ? "meetup" : "meetups"} listed in {cityName}, {stateName}.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
        {cityMeetups.map((m) => (
          <MeetupCard key={m.id} meetup={m} />
        ))}
      </section>

      {otherCities.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl text-white font-medium mb-4 border-b border-line-subtle pb-2">
            Nearby cities in {stateName}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/${state}/${c.slug}`}
                className="block px-3 py-2 rounded border border-line-subtle bg-bg-card hover:border-bitcoin-orange/50 hover:bg-bg-elevated/40 transition-colors"
              >
                <div className="text-white text-sm">{c.name}</div>
                <div className="text-ink-muted text-xs">
                  {c.count} {c.count === 1 ? "meetup" : "meetups"}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-bitcoin-orange/30 bg-bitcoin-orange/5 p-6 flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-white font-medium text-base mb-1">
            Missing a {cityName} meetup?
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
        <Link href={`/${state}`} className="text-ink-muted text-sm hover:text-bitcoin-orange">
          ← Back to {stateName} meetups
        </Link>
      </div>
    </div>
  );
}
