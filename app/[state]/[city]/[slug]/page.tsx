import { notFound } from "next/navigation";
import Link from "next/link";
import { meetups, getMeetupByPath, stateSlug, citySlug } from "@/data/meetups";
import type { Metadata } from "next";

type Props = { params: Promise<{ state: string; city: string; slug: string }> };

export async function generateStaticParams() {
  return meetups.map((m) => ({
    state: stateSlug(m.state),
    city: citySlug(m.city),
    slug: m.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, city, slug } = await params;
  const meetup = getMeetupByPath(state, city, slug);
  if (!meetup) return { title: "Meetup not found" };
  return {
    title: `${meetup.name} | Bitcoin Meetup in ${meetup.city}, ${meetup.stateAbbr}`,
    description: `${meetup.name} is a bitcoin meetup in ${meetup.city}, ${meetup.state}. ${meetup.description}`,
  };
}

export default async function MeetupDetailPage({ params }: Props) {
  const { state, city, slug } = await params;
  const meetup = getMeetupByPath(state, city, slug);
  if (!meetup) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: meetup.name,
    description: meetup.description,
    url: meetup.website,
    location: {
      "@type": "Place",
      name: meetup.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: meetup.city,
        addressRegion: meetup.stateAbbr,
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: meetup.lat,
        longitude: meetup.lng,
      },
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-ink-muted mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-bitcoin-orange">
          All meetups
        </Link>
        <span>›</span>
        <Link href={`/${state}`} className="hover:text-bitcoin-orange">
          {meetup.state}
        </Link>
        <span>›</span>
        <Link href={`/${state}/${city}`} className="hover:text-bitcoin-orange">
          {meetup.city}
        </Link>
        <span>›</span>
        <span className="text-ink-secondary">{meetup.name}</span>
      </nav>

      <header className="mb-8">
        <div className="text-bitcoin-orange text-sm mb-2">
          {meetup.city}, {meetup.state}
        </div>
        <h1 className="text-4xl text-white font-medium tracking-tight mb-3">{meetup.name}</h1>
        <div className="flex flex-wrap gap-2">
          {meetup.beginnerFriendly ? (
            <span className="text-xs px-3 py-1 rounded-full bg-green-500/15 text-green-400">
              Beginner friendly
            </span>
          ) : (
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-300">
              Technical focus
            </span>
          )}
          {meetup.tags?.map((t) => (
            <span key={t} className="text-xs px-3 py-1 rounded-full bg-bg-elevated text-ink-secondary">
              {t}
            </span>
          ))}
          {meetup.needsVerification && (
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/15 text-amber-400">
              Listing unverified
            </span>
          )}
        </div>
      </header>

      <section className="mb-8">
        <p className="text-ink-secondary text-base leading-relaxed">{meetup.description}</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-lg border border-line-subtle bg-bg-card p-5">
          <div className="text-ink-muted text-xs tracking-widest mb-1">CADENCE</div>
          <div className="text-white text-sm">{meetup.cadence}</div>
        </div>
        <div className="rounded-lg border border-line-subtle bg-bg-card p-5">
          <div className="text-ink-muted text-xs tracking-widest mb-1">TYPICAL VENUE</div>
          <div className="text-white text-sm">{meetup.venue}</div>
        </div>
        <div className="rounded-lg border border-line-subtle bg-bg-card p-5">
          <div className="text-ink-muted text-xs tracking-widest mb-1">ATTENDANCE</div>
          <div className="text-white text-sm">{meetup.attendance}</div>
        </div>
        <div className="rounded-lg border border-line-subtle bg-bg-card p-5">
          <div className="text-ink-muted text-xs tracking-widest mb-1">LOCATION</div>
          <div className="text-white text-sm">
            {meetup.city}, {meetup.stateAbbr}
          </div>
        </div>
      </section>

      {(meetup.website || meetup.twitter || meetup.nostr || meetup.telegram || meetup.meetupUrl) && (
        <section className="mb-8">
          <h2 className="text-white font-medium text-base mb-3">Connect with this meetup</h2>
          <div className="flex flex-wrap gap-3">
            {meetup.website && (
              <a
                href={meetup.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded border border-line-soft bg-bg-card hover:border-bitcoin-orange text-sm text-white transition-colors"
              >
                Website ↗
              </a>
            )}
            {meetup.twitter && (
              <a
                href={`https://x.com/${meetup.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded border border-line-soft bg-bg-card hover:border-bitcoin-orange text-sm text-white transition-colors"
              >
                @{meetup.twitter} on X ↗
              </a>
            )}
            {meetup.nostr && (
              <a
                href={`https://njump.me/${meetup.nostr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded border border-line-soft bg-bg-card hover:border-bitcoin-orange text-sm text-white transition-colors"
              >
                Nostr ↗
              </a>
            )}
            {meetup.telegram && (
              <a
                href={meetup.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded border border-line-soft bg-bg-card hover:border-bitcoin-orange text-sm text-white transition-colors"
              >
                Telegram ↗
              </a>
            )}
            {meetup.meetupUrl && (
              <a
                href={meetup.meetupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded border border-line-soft bg-bg-card hover:border-bitcoin-orange text-sm text-white transition-colors"
              >
                Meetup.com ↗
              </a>
            )}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-line-subtle bg-bg-card p-5 mb-8">
        <div className="text-white font-medium text-sm mb-1">Organize this meetup?</div>
        <div className="text-ink-secondary text-xs mb-3">
          Claim this listing to keep it up to date and add upcoming event details.
        </div>
        <Link
          href={`/submit?update=${meetup.slug}`}
          className="inline-block text-bitcoin-orange text-sm hover:underline"
        >
          Claim or update this listing →
        </Link>
      </section>

      <div className="border-t border-line-subtle pt-6">
        <Link
          href={`/${state}/${city}`}
          className="text-ink-muted text-sm hover:text-bitcoin-orange"
        >
          ← Back to {meetup.city} meetups
        </Link>
      </div>
    </div>
  );
}
