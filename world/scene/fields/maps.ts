import type * as THREE from "three";
import { GB } from "../gfx";
import { THINGS } from "../things";
import { M, barrel, crate, sack, fence, woodpile, updaters, places, type V2 } from "../build";
import { isFree, roadD } from "../world";
import { LAYOUTS, OPEN_SIDES } from "../../maps/ground-layouts.ts";
import { orchard, vineyard } from "./orchards.ts";
import { signboard, cairn, rustedMachine, brokenTower, netShed, boat, dryingRack, charcoalKiln, ruinedWall, cityWall, emptyShrine } from "./landmarks.ts";
import { broadleaves, rocks, pines, tufts, logs, stumps, mushrooms, shrubs, branches, deadTrees, trunkGeo } from "./vegetation.ts";
import { scatter, edgeward, offRoad } from "./scatter.ts";
import { type Spot, instanced } from "./instancing.ts";

// ---------------------------------------------------------------- builders
function meadow(root: THREE.Group) {
  orchard(root, 6, 8, 4, 3);
  vineyard(root, 6, 16, 3, 7);
  signboard(root, 26.2, 6.4, ["オットーの果樹園"], 0.2);
  // a lone old tree on the hill, the meadow's landmark
  broadleaves(root, [{ x: 34, z: 13, s: 1.6, r: 0.4 }], M.leaf);
  rocks(root, [
    { x: 35.6, z: 14.2, s: 0.8, r: 1 },
    { x: 32.8, z: 14.4, s: 0.5, r: 2 },
  ]);
  // a shallow pond
  broadleaves(
    root,
    scatter(2011, 26, 0.7, 1.1, (x, z) => edgeward(5)(x, z) && offRoad(2)(x, z)),
    M.leaf2,
  );
  pines(
    root,
    scatter(2012, 14, 0.8, 1.1, (x, z) => edgeward(3)(x, z) && offRoad(2)(x, z)),
  );
  rocks(root, scatter(2013, 30, 0.3, 0.9, offRoad(1.2)));
  tufts(root, scatter(2014, 160, 0.7, 1.2, offRoad(0.9)));
  // the meadow left to itself: fallen trunks gone to moss, old stumps, toadstools at the wood's edge
  logs(root, scatter(2015, 7, 0.8, 1.1, offRoad(1.6)), M.woodDark);
  stumps(root, scatter(2016, 9, 0.7, 1.0, offRoad(1.4)));
  mushrooms(
    root,
    scatter(2017, 12, 0.8, 1.1, (x, z) => edgeward(7)(x, z) && offRoad(1.2)(x, z)),
  );
  // shrubs along the field edges and round the pond, branches fallen from the old trees, loose stones
  shrubs(
    root,
    scatter(2018, 34, 0.6, 1.1, (x, z) => edgeward(9)(x, z) && offRoad(1.5)(x, z)),
  );
  branches(root, scatter(2019, 18, 0.7, 1.2, offRoad(1.0)));
  rocks(root, scatter(2020, 40, 0.15, 0.35, offRoad(0.8)));
  // a cairn where the path to the dunes leaves the road
  cairn(root, 25.6, 30.6);
  const g = new GB();
  barrel(g, 25.6, 9.2);
  crate(g, 26.6, 9.6, 0.5);
  sack(g, 25.8, 10.2);
  // ash swept off the road into heaps at its side, every few steps
  ashHeaps(g, "south-meadow", 3101);
  root.add(g.build());
  // slimes in the open grass south of the orchard, hares near the woods
  // the slimes and hares here are the meadow's creatures (core/monsters.ts), drawn by the scene
}

function dunes(root: THREE.Group) {
  rustedMachine(root, 34, 33);
  rustedMachine(root, 12, 12);
  tufts(root, scatter(2021, 200, 0.6, 1.1, offRoad(0.8)));
  deadTrees(root, scatter(2022, 10, 0.8, 1.2, offRoad(2)));
  rocks(root, scatter(2023, 18, 0.3, 1.0, offRoad(1.2)), M.rockDark);
  // stakes along the road so travellers keep to it when the sand blows
  const st: Spot[] = [];
  for (let t = 0; t < 1; t += 0.05) {
    const pts = LAYOUTS["red-dunes"].roads[0].pts,
      k = Math.floor(t * (pts.length - 1));
    const [x, z] = pts[k];
    st.push({ x: x + 1.3, z: z + 0.4, s: 1, r: t * 9 });
  }
  instanced(root, trunkGeo, M.woodDark, st, (s) => [
    [s.x, s.z],
    [0.06, s.r, 0],
    [0.45, 1.1, 0.45],
  ]);
}

function cliff(root: THREE.Group) {
  brokenTower(root, 30.5, 24);
  pines(
    root,
    scatter(2031, 40, 0.8, 1.2, (x, z) => x < 20 && offRoad(2)(x, z)),
  );
  rocks(root, scatter(2032, 40, 0.4, 1.2, offRoad(1.2)), M.rockDark);
  tufts(root, scatter(2033, 140, 0.6, 1.1, offRoad(0.9)));
  deadTrees(
    root,
    scatter(2034, 6, 0.8, 1.1, (x, z) => x > 26 && offRoad(2)(x, z)),
  );
  // a low fence on the sea side of the road, stopping short of the tower
  const pts = LAYOUTS["sea-cliff"].roads[0].pts.filter((_, i) => i % 3 === 0).map(([x, z]) => [x + 2.2, z] as V2);
  fence(
    root,
    pts.filter(([, z]) => z > 27.5),
    [],
    0.55,
  );
  fence(
    root,
    pts.filter(([, z]) => z < 20.5),
    [],
    0.55,
  );
}

function sheds(root: THREE.Group) {
  netShed(root, 28, 27, 0.1);
  netShed(root, 28.5, 35, -0.05);
  boat(root, 35.5, 29, 1.4);
  boat(root, 36.4, 33.5, 1.7);
  boat(root, 34.8, 38, 1.5);
  dryingRack(root, 31.6, 24.6);
  dryingRack(root, 31.8, 39.4);
  places.netRack = [31.6, 25.6]; // where Jacob works before dawn
  const g = new GB();
  barrel(g, 30.4, 29.4);
  barrel(g, 30.8, 30);
  crate(g, 30.2, 33.2, 0.55);
  crate(g, 30.6, 33.8, 0.45);
  sack(g, 31, 32.4);
  root.add(g.build());
  signboard(root, 22.2, 31.2, ["ヤコブの網小屋"], 0.1);
  rocks(
    root,
    scatter(2041, 26, 0.3, 1.0, (x, z) => offRoad(1.2)(x, z)),
    M.rockDark,
  );
  tufts(
    root,
    scatter(2042, 120, 0.6, 1.1, (x, z) => x < 28 && offRoad(0.9)(x, z)),
  );
  pines(
    root,
    scatter(2043, 26, 0.8, 1.2, (x, z) => x < 18 && offRoad(2)(x, z)),
  );
}

function forestEdge(root: THREE.Group) {
  // Josef's clearing: stumps, stacked trunks, a chopping block and the charcoal mound
  charcoalKiln(root, 16, 26);
  places.kiln = [17.6, 27.4]; // where Josef tends the fire
  const g = new GB();
  woodpile(g, 20, 27.5, 2.2, 4, true);
  woodpile(g, 12.6, 20.7, 1.6, 3, false);
  ashHeaps(g, "forest-edge", 3102);
  root.add(g.build());
  logs(root, [
    { x: 14, z: 29.6, s: 1, r: 0.2 },
    { x: 14.3, z: 30.3, s: 0.9, r: 0.15 },
  ]);
  stumps(
    root,
    scatter(2051, 16, 0.8, 1.2, (x, z) => Math.hypot(x - 16, z - 26) < 7 && offRoad(1.2)(x, z)),
  );
  signboard(root, 21.6, 24.2, ["ヨーゼフの炭焼き場"], 0.3);
  pines(
    root,
    scatter(2052, 260, 0.9, 1.4, (x, z) => Math.hypot(x - 16, z - 26) > 7.5 && offRoad(1.8)(x, z)),
  );
  broadleaves(
    root,
    scatter(2053, 20, 0.8, 1.1, (x, z) => x > 32 && offRoad(2)(x, z)),
    M.autumn,
  );
  rocks(root, scatter(2054, 20, 0.3, 0.8, offRoad(1.2)), M.rockDark);
  tufts(root, scatter(2055, 60, 0.6, 1.0, offRoad(0.9)));
  // the wood's edge: undergrowth between the pines, what the axe left lying, toadstools in the shade
  shrubs(
    root,
    scatter(2056, 40, 0.7, 1.2, (x, z) => Math.hypot(x - 16, z - 26) > 8 && offRoad(1.6)(x, z)),
  );
  branches(root, scatter(2057, 30, 0.7, 1.2, offRoad(1.0)));
  mushrooms(
    root,
    scatter(2058, 18, 0.8, 1.1, (x, z) => Math.hypot(x - 16, z - 26) > 8 && offRoad(1.2)(x, z)),
  );
  rocks(root, scatter(2059, 30, 0.15, 0.35, offRoad(0.8)), M.rockDark);
}

/** Ash swept to the side of the first road in heaps, at intervals (things.ts). */
function ashHeaps(gb: GB, map: string, seed: number) {
  const pts = LAYOUTS[map].roads[0].pts;
  for (let k = 3; k < pts.length - 3; k += 5) {
    const [x, z] = pts[k],
      [nx, nz] = pts[k + 1];
    const len = Math.hypot(nx - x, nz - z) || 1;
    const side = (k / 5) % 2 ? 1 : -1;
    const px = x - ((nz - z) / len) * 1.5 * side,
      pz = z + ((nx - x) / len) * 1.5 * side;
    if (roadD(px, pz) > 0.4 && isFree(px, pz)) THINGS["ash-heap"].build(gb, px, pz, seed + k, true);
  }
}

function deepForest(root: THREE.Group) {
  ruinedWall(
    root,
    [
      [6, 34],
      [14, 32.6],
      [19, 33.4],
    ],
    61,
  );
  ruinedWall(
    root,
    [
      [29, 14],
      [36, 12.6],
      [42, 14.4],
    ],
    62,
  );
  pines(root, scatter(2061, 230, 1.0, 1.7, offRoad(1.6)), false);
  logs(root, scatter(2062, 18, 0.8, 1.3, offRoad(1.6)), M.woodDark);
  mushrooms(root, scatter(2063, 40, 0.8, 1.2, offRoad(1.0)));
  rocks(root, scatter(2064, 26, 0.4, 1.1, offRoad(1.2)), M.rockDark);
  stumps(root, scatter(2065, 10, 0.8, 1.2, offRoad(1.2)));
  // ferns and dead grass between the trunks, where the light gets through
  tufts(root, scatter(2066, 140, 0.6, 1.0, offRoad(0.9)));
  // the deep wood's floor: thick undergrowth, a litter of fallen branches, mossy stones
  shrubs(root, scatter(2067, 60, 0.8, 1.3, offRoad(1.5)));
  branches(root, scatter(2068, 50, 0.7, 1.3, offRoad(1.0)));
  rocks(root, scatter(2069, 40, 0.15, 0.4, offRoad(0.8)), M.rockDark);
}

function quynhonGate(root: THREE.Group) {
  cityWall(root, 10.5, 24, false);
  signboard(root, 19.4, 33.6, ["南 峠道", "西 樹海", "北 クイニョン"], 0.4);
  pines(
    root,
    scatter(2071, 34, 0.8, 1.2, (x, z) => z > 16 && x < 34 && offRoad(2)(x, z)),
  );
  rocks(
    root,
    scatter(2072, 24, 0.3, 0.9, (x, z) => z > 13 && offRoad(1.2)(x, z)),
  );
  tufts(
    root,
    scatter(2073, 120, 0.6, 1.1, (x, z) => z > 12 && offRoad(0.9)(x, z)),
  );
  const g = new GB();
  crate(g, 28.6, 14.4, 0.6);
  crate(g, 29.2, 15.1, 0.5);
  barrel(g, 19.4, 14.2);
  sack(g, 28.4, 15.6);
  root.add(g.build());
}

function pass(root: THREE.Group) {
  cairn(root, 30.8, 20.8);
  emptyShrine(root, 20.6, 12);
  rocks(root, scatter(2081, 60, 0.4, 1.4, offRoad(1.4)), M.rockDark);
  pines(root, scatter(2082, 50, 0.7, 1.1, offRoad(2.5)));
  tufts(root, scatter(2083, 120, 0.6, 1.0, offRoad(0.9)));
  deadTrees(root, scatter(2084, 8, 0.8, 1.2, offRoad(2)));
}

function hueGate(root: THREE.Group) {
  cityWall(root, 10.5, 24, true);
  pines(
    root,
    scatter(2091, 40, 0.8, 1.2, (x, z) => z > 16 && offRoad(2)(x, z)),
  );
  rocks(
    root,
    scatter(2092, 30, 0.3, 1.0, (x, z) => z > 13 && offRoad(1.2)(x, z)),
    M.rockDark,
  );
  tufts(
    root,
    scatter(2093, 120, 0.6, 1.0, (x, z) => z > 12 && offRoad(0.9)(x, z)),
  );
}

/** Trees (or, in the dunes, dead trees and stones) thick on the rim, closing the view at the edges. */
function rim(root: THREE.Group, id: string, seed: number) {
  const ok = (x: number, z: number) => edgeward(3.5)(x, z) && offRoad(2.2)(x, z) && !(OPEN_SIDES[id]?.includes("e") && x > 30);
  if (id === "red-dunes") {
    deadTrees(root, scatter(seed, 24, 0.9, 1.4, ok));
    rocks(root, scatter(seed + 1, 60, 0.6, 1.6, ok), M.rockDark);
    return;
  }
  pines(root, scatter(seed, 150, 0.9, 1.5, ok), id !== "deep-forest");
}

const BUILDERS: Record<string, (root: THREE.Group) => void> = {
  "south-meadow": meadow,
  "red-dunes": dunes,
  "sea-cliff": cliff,
  "net-sheds": sheds,
  "forest-edge": forestEdge,
  "deep-forest": deepForest,
  "quynhon-gate": quynhonGate,
  "mountain-pass": pass,
  "hue-gate": hueGate,
};

export const FIELD_BUILDERS: Record<string, (root: THREE.Group) => void> = Object.fromEntries(
  Object.entries(BUILDERS).map(([id, b], i) => [
    id,
    (root: THREE.Group) => {
      b(root);
      rim(root, id, 3000 + i * 10);
    },
  ]),
);

void updaters;
