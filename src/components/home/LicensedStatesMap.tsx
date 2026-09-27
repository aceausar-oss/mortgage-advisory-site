import { geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import us from "us-atlas/states-albers-10m.json";

// Licensed-states map (CLAUDE.md §4.3), rendered to static SVG on the server. No map API, no client JS.
const LICENSED: Record<string, string> = { "06": "CA", "48": "TX", "12": "FL", "08": "CO" };

const topo = us as unknown as Topology<{ states: GeometryCollection<{ name: string }>; nation: GeometryCollection }>;
const states = feature(topo, topo.objects.states).features;
const borders = mesh(topo, topo.objects.states, (a, b) => a !== b);
const path = geoPath();

export function LicensedStatesMap() {
  return (
    <figure className="space-y-3">
      <svg viewBox="0 0 975 610" role="img" aria-labelledby="map-title" className="h-auto w-full">
        <title id="map-title">Map of the United States highlighting California, Texas, Florida, and Colorado, where The Mortgage Advisory is licensed</title>
        {states.map((s) => (
          <path key={String(s.id)} d={path(s) ?? undefined} fill={LICENSED[String(s.id)] ? "var(--color-brand-blue)" : "#e4ebf1"} />
        ))}
        <path d={path(borders) ?? undefined} fill="none" stroke="#ffffff" strokeWidth={1} strokeLinejoin="round" />
        {states
          .filter((s) => LICENSED[String(s.id)])
          .map((s) => {
            const [x, y] = path.centroid(s);
            return (
              <text
                key={`label-${s.id}`}
                x={x + (s.id === "12" ? 18 : 0)}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-brand-ink font-heading text-[22px] font-bold"
              >
                {LICENSED[String(s.id)]}
              </text>
            );
          })}
      </svg>
      <figcaption className="text-center font-heading text-sm font-semibold text-brand-slate">Licensed in California, Texas, Florida, and Colorado</figcaption>
    </figure>
  );
}
