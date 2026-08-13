import { feature } from "topojson-client";

const ATLAS_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// The states topojson is roughly 1MB uncompressed and every map component on
// the page needs it. Each component used to keep its own cache, so the home
// page (hero map + mini map) fired two requests, and the hero map re-fetched
// on every resize step. One shared promise means one download per session,
// which matters most on a phone connection.
let atlasPromise: Promise<any> | null = null;

export function loadStatesGeo(): Promise<any> {
  if (!atlasPromise) {
    atlasPromise = fetch(ATLAS_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`us-atlas request failed: ${r.status}`);
        return r.json();
      })
      .then((us: any) => feature(us, us.objects.states) as any)
      .catch((err) => {
        // Don't cache a failure — a flaky mobile connection should be able to
        // retry on the next mount.
        atlasPromise = null;
        throw err;
      });
  }
  return atlasPromise;
}
