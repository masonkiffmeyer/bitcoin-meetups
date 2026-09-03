import { notFound } from "next/navigation";
import Link from "next/link";
import {
  meetups,
  getMeetupByPath,
  getFreq,
  stateSlug,
  citySlug,
} from "@/lib/meetups";
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

  const freq = getFreq(meetup);
  const cadenceLabel = freq === "weekly" ? "Weekly" : "Monthly";

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${meetup.lat},${meetup.lng}`;

  return (
    <section className="section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="breadcrumb mb-6">
        / <Link href="/">US</Link> /{" "}
        <Link href={`/${state}`}>{meetup.state.toUpperCase()}</Link> /{" "}
        <Link href={`/${state}/${city}`}>{meetup.city.toUpperCase()}</Link> /{" "}
        <span className="current">{meetup.name.toUpperCase()}</span>
      </div>

      <div className="meetup-hero">
        <div className="meetup-hero-main">
          <div className="meetup-hero-pills">
            <span className={`pill ${freq === "weekly" ? "pill-orange" : ""}`}>
              ● {cadenceLabel}
            </span>
            {meetup.tags?.map((t) => (
              <span key={t} className="pill">
                {t}
              </span>
            ))}
            {meetup.needsVerification && (
              <span className="pill">Listing unverified</span>
            )}
          </div>
          <h1 className="hero-title">{meetup.name}</h1>
          <p className="hero-sub" style={{ color: "var(--orange-deep)" }}>
            {meetup.city}, <em>{meetup.state}</em>
          </p>
          <p className="meetup-hero-desc">{meetup.description}</p>

          <div className="meetup-hero-actions">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Get directions →
            </a>
            {meetup.website && (
              <a
                className="btn btn-ghost"
                href={meetup.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit website ↗
              </a>
            )}
          </div>
        </div>

        <aside className="meetup-next-card">
          <div className="meetup-next-card-head">
            <span className="eyebrow">/ Cadence</span>
            <span className="pill pill-live">
              <span className="freq-dot-inner" style={{ background: "var(--green-live)" }} />
              Active
            </span>
          </div>
          <div className="meetup-next-card-cadence">
            <div className="meetup-next-card-frequency">{cadenceLabel}</div>
            <div className="meetup-next-card-when">{meetup.cadence}</div>
          </div>
          <div className="meetup-next-card-rows">
            <div>
              <div className="eyebrow">Venue</div>
              <div className="meetup-next-card-value">{meetup.venue}</div>
            </div>
            <div>
              <div className="eyebrow">Typical attendance</div>
              <div className="meetup-next-card-value">{meetup.attendance}</div>
            </div>
            <div>
              <div className="eyebrow">Coordinates</div>
              <div className="meetup-next-card-value mono" style={{ fontSize: 13 }}>
                {meetup.lat.toFixed(4)}°N · {Math.abs(meetup.lng).toFixed(4)}°W
              </div>
            </div>
          </div>
          {hasContacts && (
            <a
              href={meetup.website || `https://x.com/${meetup.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark"
              style={{ justifyContent: "center", width: "100%" }}
            >
              Visit group page →
            </a>
          )}
        </aside>
      </div>

      {hasContacts && (
        <div className="meetup-connect">
          <div className="eyebrow-orange" style={{ marginBottom: 12 }}>/ Connect</div>
          <div className="meetup-connect-buttons">
            {meetup.website && (
              <a
                className="btn"
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

      <div className="info-card" style={{ marginTop: 40 }}>
        <div className="info-card-title">Organize this meetup?</div>
        <div className="info-card-sub">
          Claim this listing to keep it up to date and add upcoming event details.
        </div>
        <Link href="/submit" className="info-card-link">
          Claim or update this listing →
        </Link>
      </div>

      <div className="tail eyebrow">
        <Link href={`/${state}/${city}`}>← Back to {meetup.city} meetups</Link>
      </div>
    </section>
  );
}
