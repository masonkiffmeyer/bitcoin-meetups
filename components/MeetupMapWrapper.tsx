"use client";

import dynamic from "next/dynamic";
import type { Meetup } from "@/lib/types";

const Map = dynamic(() => import("./MeetupMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-bg-card rounded-lg">
      <div className="text-ink-muted text-sm">Loading map...</div>
    </div>
  ),
});

type Props = {
  meetups: Meetup[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
};

export default function MeetupMapWrapper(props: Props) {
  return <Map {...props} />;
}
