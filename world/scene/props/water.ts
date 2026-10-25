import { M, barrel, bucket } from "../build";
import { blockCircle, blockRect } from "../world";
import type { Thing } from "./types.ts";
import { y0, wicker, lanternGlass } from "./materials.ts";

const waterThings: Readonly<Record<string, Thing>> = {
  "lidded-bucket": {
    name: "蓋をした水桶",
    group: "水と火",
    r: 0.2,
    build: (gb, x, z) => {
      const y = y0(x, z);
      bucket(gb, x, z, y, false);
      gb.cyl(M.wood, M.wood, x, z, y + 0.24, y + 0.27, 0.16, 0.16, 8, 1);
      blockCircle(x, z, 0.18);
    },
  },
  "water-butt": {
    name: "蓋をした雨水樽",
    group: "水と火",
    r: 0.35,
    build: (gb, x, z) => {
      const y = y0(x, z);
      barrel(gb, x, z, 0.85, 0.32);
      gb.cyl(M.wood, M.wood, x, z, y + 0.85, y + 0.9, 0.34, 0.34, 10, 1);
      gb.box(M.iron, null, x - 0.03, y + 0.9, z - 0.15, x + 0.03, y + 0.95, z + 0.15, 1);
      blockCircle(x, z, 0.34);
    },
  },
  kindling: {
    name: "焚きつけの束",
    group: "水と火",
    r: 0.2,
    build: (gb, x, z, _s, along) => {
      const y = y0(x, z);
      for (let k = 0; k < 7; k++) {
        const o = (k - 3) * 0.04;
        if (along) gb.box(M.woodV, null, x - 0.3, y + 0.02 + (k % 2) * 0.04, z + o - 0.015, x + 0.3, y + 0.05 + (k % 2) * 0.04, z + o + 0.015, 1);
        else gb.box(M.woodV, null, x + o - 0.015, y + 0.02 + (k % 2) * 0.04, z - 0.3, x + o + 0.015, y + 0.05 + (k % 2) * 0.04, z + 0.3, 1);
      }
      gb.cyl(M.rope, null, x, z, y + 0.03, y + 0.12, 0.08, 0.08, 6, 1);
      blockCircle(x, z, 0.2);
    },
  },
  "log-basket": {
    name: "薪籠",
    group: "水と火",
    r: 0.25,
    build: (gb, x, z) => {
      const y = y0(x, z);
      gb.cyl(wicker, null, x, z, y, y + 0.35, 0.22, 0.26, 8, 1);
      for (let k = 0; k < 4; k++) gb.box(M.woodV, M.woodDark, x - 0.18 + k * 0.1, y + 0.28, z - 0.2, x - 0.1 + k * 0.1, y + 0.42, z + 0.2, 1);
      blockCircle(x, z, 0.24);
    },
  },
  "hand-lantern": {
    name: "軒に吊るした手提げランタン",
    group: "水と火",
    wall: "hang",
    r: 0,
    build: (gb, x, z) => {
      const y = y0(x, z);
      gb.box(M.iron, null, x - 0.08, y + 1.75, z - 0.08, x + 0.08, y + 1.78, z + 0.08, 1);
      gb.box(M.iron, null, x - 0.01, y + 1.78, z - 0.01, x + 0.01, y + 1.95, z + 0.01, 1);
      gb.box(lanternGlass(), null, x - 0.06, y + 1.6, z - 0.06, x + 0.06, y + 1.75, z + 0.06, 1);
    },
  },
  "wood-stack": {
    name: "壁ぎわに積んだ薪",
    group: "水と火",
    wall: "stand",
    r: 0.35,
    build: (gb, x, z, seed, along) => {
      const y = y0(x, z);
      const [hx, hz] = along ? [0.55, 0.18] : [0.18, 0.55];
      // split logs in rows, the ends showing, each row a little shorter
      for (let k = 0; k < 4; k++) {
        const t = k * 0.05;
        gb.box(k % 2 ? M.wood : M.woodDark, M.wood, x - hx + (along ? t : 0), y + k * 0.16, z - hz + (along ? 0 : t), x + hx - (along ? t : 0), y + k * 0.16 + 0.16, z + hz - (along ? 0 : t), 1);
      }
      void seed;
      blockRect(x - hx, z - hz, x + hx, z + hz);
    },
  },
  "bucket-yoke": {
    name: "壁に掛けた天秤棒と桶",
    group: "水と火",
    wall: "hang",
    r: 0,
    build: (gb, x, z, _seed, along) => {
      const y = y0(x, z) + 1.3;
      const [hx, hz] = along ? [0.5, 0.03] : [0.03, 0.5];
      gb.box(M.woodV, null, x - hx, y, z - hz, x + hx, y + 0.05, z + hz, 1);
      for (const s of [-1, 1]) {
        const bx = along ? x + s * 0.4 : x,
          bz = along ? z : z + s * 0.4;
        gb.cyl(M.wood, M.woodDark, bx, bz, y - 0.45, y - 0.15, 0.1, 0.12, 8, 1);
      }
    },
  },
};

export { waterThings };
