// Which ground plan each map is laid out on (layout.ts): read by the scene and by the
// workers that paint the ground, so both see the same map. Data only: nothing here draws.
import { VILLAGE, type Layout } from "./layout.ts";
import { CRAFT, FIELD_LAYOUTS, GATE, INDOOR, MARKET } from "./ground-layouts.ts";

const STREETS: Record<string, Layout> = { phanthiet: VILLAGE, "phanthiet-market": MARKET, "phanthiet-craft": CRAFT, "phanthiet-gate": GATE };

export function layoutOf(map: string): Layout {
  return STREETS[map] ?? FIELD_LAYOUTS[map] ?? (map.includes("-in-") ? INDOOR : VILLAGE);
}
