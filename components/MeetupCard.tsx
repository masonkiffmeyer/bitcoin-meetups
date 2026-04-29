import Link from "next/link";
import type { Meetup } from "@/lib/types";
import { stateSlug, citySlug } from "@/data/meetups";

export default function MeetupCard({ meetup, highlighted }: { meetup: Meetup; highlighted?: boolean }) {
  return (
    <Link
      href={`/${stateSlug(meetup.state)}/${citySlug(meetup.city)}/${meetup.slug}`}
      className={`block rounded-lg border p-4 transition-all hover:border-bitcoin-orange/50 hover:bg-bg-elevated/40 ${
        highlighted
          ? "border-bitcoin-orange/40 bg-bitcoin-orange/5"
          : "border-line-subtle bg-bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="text-white font-medium text-sm leading-tight">{meetup.name}</div>
        {meetup.beginnerFriendly && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 whitespace-nowrap">
            Beginner
          </span>
        )}
      </div>
      <div className="text-bitcoin-orange text-xs mb-2">
        {meetup.city}, {meetup.stateAbbr}
      </div>
      <div className="text-ink-muted text-xs">{meetup.cadence}</div>
    </Link>
  );
}
