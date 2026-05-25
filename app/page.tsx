"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { meetups, getFreq } from "@/data/meetups";
import MeetupMapWrapper from "@/components/MeetupMapWrapper";
import IndexDirectory from "@/components/IndexDirectory";
import MeetupDrawer from "@/components/MeetupDrawer";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [freqFilter, setFreqFilter] = useState<"ALL" | "weekly" | "monthly">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const stateGroups = useMemo(() => {
    const g: Record<string, { name: string; count: number }> = {};
    for (const m of meetups) {
      if (!g[m.stateAbbr]) g[m.stateAbbr] = { name: m.state, count: 0 };
      g[m.stateAbbr].count++;
    }
    return Object.entries(g)
      .map(([code, v]) => ({ code, name: v.name, count: v.count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const weeklyCount = useMemo(
    () => meetups.filter((m) => getFreq(m) === "weekly").length,
    []
  );

  const filtered = useMemo(() => {
    return meetups.filter((m) => {
      if (stateFilter !== "ALL" && m.stateAbbr !== stateFilter) return false;
      if (freqFilter !== "ALL" && getFreq(m) !== freqFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.city.toLowerCase().includes(q) &&
          !m.state.toLowerCase().includes(q) &&
          !m.stateAbbr.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [query, stateFilter, freqFilter]);

  const openMeetup = openId ? meetups.find((m) => m.id === openId) ?? null : null;

  return (
    <>
      <section className="hero">
        <div className="hero-titlebar">
          <div className="hero-titlebar-inner">
            <div className="hero-title-block">
              <div className="hero-eyebrow" style={{ gap: 10 }}>
                <span className="pill pill-orange">
                  <span className="blink" />
                  Live directory
                </span>
                <span className="pill pill-ghost">
                  {meetups.length} nodes · {stateGroups.length} states
                </span>
              </div>
              <h1 className="hero-title">
                Find your <em>local</em> Bitcoin meetup.
              </h1>
              <p className="hero-sub">
                A community-maintained map of every in-person Bitcoin meetup in the
                United States. Click any pin, or browse by state.
              </p>
            </div>

            <div className="hero-search-block">
              <div className="hero-search">
                <input
                  className="hero-search-input"
                  type="text"
                  placeholder="Search city, state, or ZIP..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="hero-search-divider" />
                <select
                  className="hero-search-select"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <option value="ALL">All states</option>
                  {stateGroups.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="stat-strip">
            <div className="stat-strip-cell">
              <span className="stat-strip-num">{meetups.length}</span>
              <span className="stat-strip-label">Meetups listed</span>
            </div>
            <div className="stat-strip-cell">
              <span className="stat-strip-num">{stateGroups.length}</span>
              <span className="stat-strip-label">States covered</span>
            </div>
            <div className="stat-strip-cell">
              <span className="stat-strip-num">{filtered.length}</span>
              <span className="stat-strip-label">Matching filters</span>
            </div>
            <div className="stat-strip-cell">
              <span className="stat-strip-num">{weeklyCount}</span>
              <span className="stat-strip-label">Meet weekly</span>
            </div>
            <div className="stat-strip-cell stat-strip-live">
              <span className="live-dot" />
              <span className="stat-strip-label">LIVE · v2026.04</span>
            </div>
          </div>
        </div>

        <div className="hero-stage">
          <div className="hero-map-wrap">
            <MeetupMapWrapper
              meetups={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="map-legend">
            <span className="legend-item">
              <span className="legend-dot" />
              Active meetup
            </span>
            <span className="legend-item">
              <span className="legend-dot sel" />
              Selected
            </span>
            <span className="legend-item legend-hint">Click a pin for details</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="eyebrow-orange" style={{ marginBottom: 8 }}>/ Discover</div>
            <h2 className="section-title">
              Every active <em>meetup</em>, one pin each.
              <span className="count">
                {String(filtered.length).padStart(2, "0")} /{" "}
                {String(meetups.length).padStart(2, "0")}
              </span>
            </h2>
            <p className="section-sub">
              Hover a row to highlight on the map. Click to view details and links.
            </p>
          </div>
          <div className="filter-bar">
            <button
              type="button"
              className={`chip ${freqFilter === "ALL" ? "active" : ""}`}
              onClick={() => setFreqFilter("ALL")}
            >
              All <span className="num">{meetups.length}</span>
            </button>
            <button
              type="button"
              className={`chip ${freqFilter === "weekly" ? "active" : ""}`}
              onClick={() => setFreqFilter("weekly")}
            >
              Weekly <span className="num">{weeklyCount}</span>
            </button>
            <button
              type="button"
              className={`chip ${freqFilter === "monthly" ? "active" : ""}`}
              onClick={() => setFreqFilter("monthly")}
            >
              Monthly <span className="num">{meetups.length - weeklyCount}</span>
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M14 14 L18 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3>No meetups match your filters</h3>
            <p>
              Try clearing the search or expanding the state to &ldquo;All states.&rdquo; Or —
              start one yourself.
            </p>
            <Link href="/submit" className="btn btn-primary">
              Submit a meetup
            </Link>
          </div>
        ) : (
          <IndexDirectory
            meetups={filtered}
            allMeetups={meetups}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpen={setOpenId}
          />
        )}
      </section>

      <section className="cta-band">
        <div className="cta-band-inner">
          <div>
            <div className="cta-band-eyebrow">/ Organize</div>
            <h3 className="cta-band-title">
              No meetup in your city? <em>Start one.</em>
            </h3>
          </div>
          <div className="cta-band-actions">
            <Link href="/submit" className="btn-on-orange">
              Submit a meetup →
            </Link>
            <a
              href="https://www.bitcoinisbetter.org/learn"
              className="btn-on-orange-ghost"
            >
              Read the playbook
            </a>
          </div>
        </div>
      </section>

      <MeetupDrawer meetup={openMeetup} onClose={() => setOpenId(null)} />
    </>
  );
}
