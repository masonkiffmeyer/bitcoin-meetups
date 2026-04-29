import { notFound } from "next/navigation";
import Link from "next/link";
import {
  meetups,
  getMeetupByPath,
  getFreq,
  stateSlug,
  citySlug,
} from "@/data/meetups";
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

  // schema.org Organization is the most accurate type for a recurring community
  // group. Event would require per-instance startDate which we don't track yet;
  // EventSeries has the same gap. Revisit when calendar data lands.
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

  const hasContacts = !!(
    meetup.website ||
    meetup.twitter ||
    meetup.nostr ||
    meetup.telegram ||
    meetup.meetupUrl
  );

  return (
    <section className="section">
      <div className="max-w-2xl mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="eyebrow mb-6">
          <Link href="/">All meetups</Link> ·{" "}
          <Link href={`/${state}`}>{meetup.state}</Link> ·{" "}
          <Link href={`/${state}/${city}`}>{meetup.city}</Link> · {meetup.name}
        </div>

        <div className="drawer-hero">
          <div className="drawer-eyebrow">
            <span className={`freq-dot freq-${getFreq(meetup)}`}>
              <span className="freq-dot-inner" />
              {getFreq(meetup) === "weekly" ? "Weekly" : "Monthly"}
            </span>
            {meetup.tags?.map((t) => (
              <span key={t} className="mcard-tag">
                {t}
              </span>
            ))}
            {meetup.needsVerification && (
              <span className="mcard-tag">Listing unverified</span>
            )}
          </div>
          <h1 className="drawer-name">{meetup.name}</h1>
          <div className="drawer-loc">
            {meetup.city}, {meetup.state}
          </div>
        </div>

        <div className="drawer-body">
          <div className="drawer-row">
            <span className="k">Cadence</span>
            <span>{meetup.cadence}</span>
          </div>
          <div className="drawer-row">
            <span className="k">Venue</span>
            <span>{meetup.venue}</span>
          </div>
          <div className="drawer-row">
            <span className="k">Attendance</span>
            <span>{meetup.attendance}</span>
          </div>
          <div className="drawer-row">
            <span className="k">Coordinates</span>
            <span className="mono">
              {meetup.lat.toFixed(4)}°N, {Math.abs(meetup.lng).toFixed(4)}°W
            </span>
          </div>

          <p>{meetup.description}</p>
        </div>

        {hasContacts && (
          <div className="mt-8">
            <div className="eyebrow mb-3">Connect</div>
            <div className="flex flex-wrap gap-2">
              {meetup.website && (
                <a
                  className="btn btn-primary"
                  href={meetup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website ↗
                </a>
              )}
              {meetup.twitter && (
                <a
                  className="btn"
                  href={`https://x.com/${meetup.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{meetup.twitter} on X ↗
                </a>
              )}
              {meetup.nostr && (
                <a
                  className="btn"
                  href={`https://njump.me/${meetup.nostr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Nostr ↗
                </a>
              )}
              {meetup.telegram && (
                <a
                  className="btn"
                  href={meetup.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram ↗
                </a>
              )}
              {meetup.meetupUrl && (
                <a
                  className="btn"
                  href={meetup.meetupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Meetup.com ↗
                </a>
              )}
            </div>
          </div>
        )}

        <div className="info-card mt-8">
          <div className="info-card-title">Organize this meetup?</div>
          <div className="info-card-sub">
            Claim this listing to keep it up to date and add upcoming event details.
          </div>
          <Link
            href={`/submit?update=${meetup.slug}`}
            className="info-card-link"
          >
            Claim or update this listing →
          </Link>
        </div>

        <div className="tail eyebrow">
          <Link href={`/${state}/${city}`}>
            ← Back to {meetup.city} meetups
          </Link>
        </div>
      </div>
    </section>
  );
}
