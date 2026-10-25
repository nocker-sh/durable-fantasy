// The world map (ui.md §3.3) drawn from the world grid (grid.ts): each map at the middle of its
// square in a 100×100 field, north up; the lines between them are the ways across. Cities beyond
// their gates hold squares too, drawn but not entered yet.
import { MAPS } from "./index.ts";
import { GRID_SIZE, STEP, WORLD, squareAt, type Side } from "./grid.ts";

export interface WorldNode {
  id: string;
  x: number;
  y: number;
  city?: string;
}

const pos = (at: readonly [number, number]) => ({ x: ((at[0] + 0.5) * 100) / GRID_SIZE.cols, y: ((at[1] + 0.5) * 100) / GRID_SIZE.rows });

/** The town's squares carry its name. */
const CITY: Record<string, string> = { phanthiet: "ファンティエット" };

export const WORLD_NODES: readonly WorldNode[] = WORLD.filter((s) => s.map).map((s) => ({ id: s.map!, ...pos(s.at), ...(CITY[s.map!.split("-")[0]] ? { city: CITY[s.map!.split("-")[0]] } : {}) }));

/** Cities not built yet, and the map at their gate. */
export const LOCKED_CITIES: readonly { name: string; x: number; y: number; from: string }[] = WORLD.filter((s) => s.city).map((s) => {
  const gate = (["n", "e", "s", "w"] as Side[]).map((d) => squareAt(s.at[0] + STEP[d][0], s.at[1] + STEP[d][1])).find((o) => o?.map?.endsWith("-gate"));
  return { name: s.city!, ...pos(s.at), from: gate?.map ?? "" };
});

/** The map to mark as "you are here": indoors, the street the building stands on. */
export function worldNodeOf(mapId: string): WorldNode | undefined {
  const direct = WORLD_NODES.find((n) => n.id === mapId);
  if (direct) return direct;
  const out = MAPS[mapId]?.warps[0]?.to.map;
  return out ? WORLD_NODES.find((n) => n.id === out) : undefined;
}

/** Each road between two maps once. */
export function worldRoads(): [WorldNode, WorldNode][] {
  const out: [WorldNode, WorldNode][] = [];
  for (const a of WORLD_NODES)
    for (const w of MAPS[a.id]?.warps ?? []) {
      const b = WORLD_NODES.find((n) => n.id === w.to.map);
      if (b && a.id < b.id) out.push([a, b]);
    }
  return out;
}
