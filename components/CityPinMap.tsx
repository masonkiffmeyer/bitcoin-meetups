import type { Meetup } from "@/lib/types";

const W = 400;
const H = 340;
const PAD = 40;

type Props = {
  cityName: string;
  meetups: Meetup[];
};

/**
 * Renders meetup pins projected into a simple bounding-box layout
 * with a faint hand-drawn street grid as visual texture. Server-renderable.
 * If only one meetup exists, centers it; if several, uses lat/lng bounds.
 */
export default function CityPinMap({ cityName, meetups }: Props) {
  const pts = meetups.map((m) => ({ name: m.name, venue: m.venue, lat: m.lat, lng: m.lng }));

  let minLng = Math.min(...pts.map((p) => p.lng));
  let maxLng = Math.max(...pts.map((p) => p.lng));
  let minLat = Math.min(...pts.map((p) => p.lat));
  let maxLat = Math.max(...pts.map((p) => p.lat));

  // Pad bounds for single-point or near-collinear sets so pins don't snap to edges
  if (maxLng - minLng < 0.02) {
    minLng -= 0.02;
    maxLng += 0.02;
  }
  if (maxLat - minLat < 0.02) {
    minLat -= 0.02;
    maxLat += 0.02;
  }

  const project = (lng: number, lat: number) => {
    const u = (lng - minLng) / (maxLng - minLng);
    const v = 1 - (lat - minLat) / (maxLat - minLat); // flip Y
    return { x: PAD + u * (W - PAD * 2), y: PAD + v * (H - PAD * 2) };
  };

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  return (
    <div className="geo-panel">
      <div className="hairgrid-fine" />
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {/* Stylized street grid — slightly skewed for organic feel */}
        <g stroke="var(--line)" strokeWidth="0.6" fill="none">
          {[60, 110, 160, 210, 260, 310].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x - 28} y2={H} />
          ))}
          {[60, 110, 160, 220, 270, 320].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y + 14} />
          ))}
        </g>

        {/* Meetup pins */}
        {pts.map((p, i) => {
          const { x, y } = project(p.lng, p.lat);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="14" fill="rgba(247,147,26,0.15)" />
              <circle cx={x} cy={y} r="6" fill="var(--orange)" stroke="#FFFFFF" strokeWidth="2" />
              <text
                x={x + 14}
                y={y - 4}
                fontSize="10"
                fill="var(--ink)"
                fontFamily="Geist"
                fontWeight="500"
              >
                {p.name}
              </text>
              <text
                x={x + 14}
                y={y + 8}
                fontSize="9"
                fill="var(--ink-muted)"
                fontFamily="Geist Mono"
                letterSpacing="0.04em"
              >
                {p.venue.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="geo-panel-label">
        {cityName.toUpperCase()} · {centerLat.toFixed(2)}°N {Math.abs(centerLng).toFixed(2)}°W
      </div>
      <div className="geo-panel-meta">
        {pts.length} {pts.length === 1 ? "NODE" : "NODES"}
      </div>
    </div>
  );
}
