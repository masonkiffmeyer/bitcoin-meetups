"use client";

import Link from "next/link";
import type { Meetup } from "@/lib/types";
import { getFreq, stateSlug, citySlug } from "@/data/meetups";

type Props = {
  meetup: Meetup | null;
  onClose: () => void;
};

export default function MeetupDrawer({ meetup, onClose }: Props) {
  const open = !!meetup;
  return (
    <>
      <div
        className={`drawer-scrim ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        {meetup && (
          <>
            <div className="drawer-head">
              <div className="eyebrow">Meetup details</div>
              <button
                type="button"
                className="drawer-close"
                onClick={onClose}
                aria-label="Close drawer"
              >
                ×
              </button>
            </div>
            <div className="drawer-hero">
              <div className="drawer-eyebrow">
                <span className={`freq-dot freq-${getFreq(meetup)}`}>
                  <span className="freq-dot-inner" />
                  {getFreq(meetup) === "weekly" ? "Weekly" : "Monthly"}
                </span>
              </div>
              <h2 className="drawer-name">{meetup.name}</h2>
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
                <span className="mono" style={{ fontSize: 12 }}>
                  {meetup.lat.toFixed(4)}°N, {Math.abs(meetup.lng).toFixed(4)}°W
                </span>
              </div>
              {meetup.website && (
                <div className="drawer-row">
                  <span className="k">Website</span>
                  <span style={{ color: "var(--orange)" }}>
                    {meetup.website.replace(/^https?:\/\//, "")} ↗
                  </span>
                </div>
              )}
              {meetup.twitter && (
                <div className="drawer-row">
                  <span className="k">X / Twitter</span>
                  <span style={{ color: "var(--orange)" }}>@{meetup.twitter} ↗</span>
                </div>
              )}
              <div className="drawer-actions">
                {meetup.website ? (
                  <a
                    className="btn btn-primary"
                    href={meetup.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Visit website ↗
                  </a>
                ) : (
                  <Link
                    href={`/${stateSlug(meetup.state)}/${citySlug(meetup.city)}/${meetup.slug}`}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    Full details ↗
                  </Link>
                )}
                <Link href={`/${stateSlug(meetup.state)}/${citySlug(meetup.city)}/${meetup.slug}`} className="btn">
                  Permalink
                </Link>
              </div>
              <p
                style={{
                  color: "var(--text-mute)",
                  fontSize: 13,
                  marginTop: 24,
                  lineHeight: 1.6,
                }}
              >
                {meetup.description}
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
