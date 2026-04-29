"use client";

import dynamic from "next/dynamic";
import type { Meetup } from "@/lib/types";

const Map = dynamic(() => import("./MeetupMap"), {
  ssr: false,
  loading: () => (
    <div className="map-frame">
      <div className="map-loading">
        <span className="mono">LOADING MAP…</span>
      </div>
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
