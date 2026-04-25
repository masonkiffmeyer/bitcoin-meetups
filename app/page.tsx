"use client";

import { useMemo, useState } from "react";
import { meetups, getAllStatesWithMeetups } from "@/data/meetups";
import MeetupMapWrapper from "@/components/MeetupMapWrapper";
import MeetupCard from "@/components/MeetupCard";
import Link from "next/link";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [beginnerOnly, setBeginnerOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const states = useMemo(() => getAllStatesWithMeetups(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meetups.filter((m) => {
      if (stateFilter !== "all" && m.stateAbbr !== stateFilter) return false;
      if (beginnerOnly && !m.beginnerFriendly) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.city.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.stateAbbr.toLowerCase().includes(q)
      );
    });
  }, [query, stateFilter, beginnerOnly]);

  const totalMeetups = meetups.length;
  const statesCount = states.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-4xl md:text-5xl text-white font-medium tracking-tight mb-3">
          Find a Bitcoin Meetup Near You
        </h1>
        <p className="text-ink-secondary text-base max-w-2xl mb-6">
          {totalMeetups} bitcoin meetups across {statesCount} states. Search by city or state, or
          click a pin on the map to explore.
        </p>

        {/* Search and filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, state, or ZIP..."
            className="flex-1 min-w-[240px] max-w-md bg-bg-card border border-line-soft rounded px-4 py-2.5 text-sm text-white placeholder-ink-dim focus:outline-none focus:border-bitcoin-orange"
          />
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-bg-card border border-line-soft rounded px-3 py-2.5 text-sm text-white focus:outline-none focus:border-bitcoin-orange"
          >
            <option value="all">All states</option>
            {states.map((s) => (
              <option key={s.abbr} value={s.abbr}>
                {s.name} ({s.count})
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={beginnerOnly}
              onChange={(e) => setBeginnerOnly(e.target.checked)}
              className="w-4 h-4 rounded accent-bitcoin-orange"
            />
            Beginner friendly only
          </label>
        </div>
      </section>

      {/* Map + stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 h-[480px] bg-bg-card border border-line-subtle rounded-lg overflow-hidden">
          <MeetupMapWrapper
            meetups={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <aside className="bg-bg-card border border-line-subtle rounded-lg p-5">
          <div className="text-ink-muted text-xs tracking-widest mb-3">AT A GLANCE</div>
          <div className="space-y-4 mb-6">
            <div>
              <div className="text-3xl text-white font-medium">{totalMeetups}</div>
              <div className="text-ink-secondary text-xs">Total meetups listed</div>
            </div>
            <div>
              <div className="text-3xl text-white font-medium">{statesCount}</div>
              <div className="text-ink-secondary text-xs">States covered</div>
            </div>
            <div>
              <div className="text-3xl text-white font-medium">{filtered.length}</div>
              <div className="text-ink-secondary text-xs">Matching your filters</div>
            </div>
          </div>
          <div className="pt-4 border-t border-line-subtle">
            <div className="text-ink-muted text-xs tracking-widest mb-2">LEGEND</div>
            <div className="flex items-center gap-2 text-xs text-ink-secondary mb-1.5">
              <div className="w-3 h-3 rounded-full bg-bitcoin-orange border border-white"></div>
              Active meetup
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-secondary">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-bitcoin-orange"></div>
              Selected
            </div>
          </div>
        </aside>
      </section>

      {/* Meetup list */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl text-white font-medium">
            {filtered.length === totalMeetups
              ? "All meetups"
              : `${filtered.length} ${filtered.length === 1 ? "meetup" : "meetups"}`}
          </h2>
          {(query || stateFilter !== "all" || beginnerOnly) && (
            <button
              onClick={() => {
                setQuery("");
                setStateFilter("all");
                setBeginnerOnly(false);
              }}
              className="text-xs text-bitcoin-orange hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-ink-muted">
            <p className="mb-3">No meetups match your search.</p>
            <Link href="/submit" className="text-bitcoin-orange hover:underline">
              Know one we don&apos;t have listed? Submit it →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((m) => (
              <MeetupCard key={m.id} meetup={m} highlighted={m.id === selectedId} />
            ))}
          </div>
        )}
      </section>

      {/* Browse by state */}
      <section className="mb-12">
        <h2 className="text-xl text-white font-medium mb-4">Browse by state</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {states.map((s) => (
            <Link
              key={s.abbr}
              href={`/state/${s.slug}`}
              className="block px-3 py-2 rounded border border-line-subtle bg-bg-card hover:border-bitcoin-orange/50 hover:bg-bg-elevated/40 transition-colors"
            >
              <div className="text-white text-sm">{s.name}</div>
              <div className="text-ink-muted text-xs">{s.count} {s.count === 1 ? "meetup" : "meetups"}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Submit CTA */}
      <section className="rounded-lg border border-bitcoin-orange/30 bg-bitcoin-orange/5 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-white font-medium text-base mb-1">
            Run a meetup we don&apos;t have listed?
          </div>
          <div className="text-ink-secondary text-sm">
            Add your group in under a minute. Free, always.
          </div>
        </div>
        <Link
          href="/submit"
          className="bg-bitcoin-orange text-bg-dark px-5 py-2.5 rounded text-sm font-medium hover:bg-bitcoin-orangeLight transition-colors"
        >
          Submit a meetup
        </Link>
      </section>
    </div>
  );
}
