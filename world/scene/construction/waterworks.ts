import type * as THREE from "three";
import { GB } from "../gfx";
import { PixBuf, Rng, pick } from "../pix";
import { groundH, bridgeDeckH, WATER_Y, currentLayout } from "../world";
import { M } from "./materials.ts";
import { addSprite } from "./sprites.ts";
import { bucket } from "./furniture.ts";
import { stair } from "./fences.ts";
import { places } from "./registry.ts";

// ---------------------------------------------------------------- bridge, lavoir, embankment railings
function bridge(root: THREE.Group) {
  const B = currentLayout().bridge;
  const gb = new GB();
  const n = 14;
  for (let i = 0; i < n; i++) {
    const xa = B.x0 + ((B.x1 - B.x0) * i) / n,
      xb = B.x0 + ((B.x1 - B.x0) * (i + 1)) / n;
    const ya = bridgeDeckH(xa),
      yb = bridgeDeckH(xb);
    // deck
    gb.quad(M.ashlar, [xa, ya, B.z1], [xb, yb, B.z1], [xb, yb, B.z0], [xa, ya, B.z0], 4, 4);
    // sides with arch underside
    const archY = (x: number) => {
      const c = (B.x0 + B.x1) / 2,
        hw = 1.9;
      const t = (x - c) / hw;
      return Math.abs(t) < 1 ? -1.0 + Math.sqrt(1 - t * t) * 0.85 : -1.6;
    };
    for (const z of [B.z1, B.z0]) {
      const p = z === B.z1;
      const q = (x: number, y: number): [number, number, number] => [x, y, z];
      if (p) gb.quad(M.ashlar, q(xa, archY(xa)), q(xb, archY(xb)), q(xb, yb), q(xa, ya), 4, 4);
      else gb.quad(M.ashlar, q(xb, archY(xb)), q(xa, archY(xa)), q(xa, ya), q(xb, yb), 4, 4);
      // parapet
      const zi = p ? z - 0.18 : z + 0.18;
      gb.quad(M.ashlar, [xa, ya, p ? z : zi], [xb, yb, p ? z : zi], [xb, yb + 0.5, p ? z : zi], [xa, ya + 0.5, p ? z : zi], 4, 4);
      gb.quad(M.ashlar, [xb, yb, p ? zi : z], [xa, ya, p ? zi : z], [xa, ya + 0.5, p ? zi : z], [xb, yb + 0.5, p ? zi : z], 4, 4);
      gb.quad(M.ashlar, [xa, ya + 0.5, Math.max(z, zi)], [xb, yb + 0.5, Math.max(z, zi)], [xb, yb + 0.5, Math.min(z, zi)], [xa, ya + 0.5, Math.min(z, zi)], 4, 4);
    }
    // arch soffit
    const c = (B.x0 + B.x1) / 2;
    if (Math.abs((xa + xb) / 2 - c) < 1.9) {
      const archYa = -1.0 + Math.sqrt(Math.max(0, 1 - ((xa - c) / 1.9) ** 2)) * 0.85;
      const archYb = -1.0 + Math.sqrt(Math.max(0, 1 - ((xb - c) / 1.9) ** 2)) * 0.85;
      gb.quad(M.stoneDark, [xa, archYa, B.z0], [xb, archYb, B.z0], [xb, archYb, B.z1], [xa, archYa, B.z1], 4, 4);
    }
  }
  root.add(gb.build());
}

function lavoir(root: THREE.Group) {
  const L = currentLayout().lavoir;
  const gb = new GB();
  const y = L.h;
  // washing slabs sloping into the water
  for (let z = L.z0 + 0.3; z < L.z1 - 0.2; z += 0.85) {
    const xe = L.x1 + 0.05;
    gb.quad(M.ashlar, [xe - 0.1, y + 0.12, z + 0.35], [xe + 0.35, WATER_Y + 0.02, z + 0.35], [xe + 0.35, WATER_Y + 0.02, z - 0.35], [xe - 0.1, y + 0.12, z - 0.35], 4, 4);
    gb.box(M.ashlar, null, xe - 0.4, y - 0.02, z - 0.35, xe - 0.1, y + 0.12, z + 0.35, 4);
  }
  // shed roof on posts, sloping toward the river
  const gy = groundH(L.x0 - 0.3, (L.z0 + L.z1) / 2);
  for (const z of [L.z0 + 0.1, (L.z0 + L.z1) / 2, L.z1 - 0.1]) {
    gb.box(M.woodV, M.woodDark, L.x1 + 0.02, y, z - 0.07, L.x1 + 0.16, gy + 1.5, z + 0.07, 2);
  }
  const yA = gy + 2.0,
    yB = gy + 1.45;
  gb.quad(M.roof2, [L.x0 - 0.6, yA, L.z1 + 0.3], [L.x1 + 0.6, yB, L.z1 + 0.3], [L.x1 + 0.6, yB, L.z0 - 0.3], [L.x0 - 0.6, yA, L.z0 - 0.3], 4, 4);
  gb.box(M.woodDark, M.woodDark, L.x1 + 0.02, yB - 0.12, L.z0 - 0.2, L.x1 + 0.16, yB, L.z1 + 0.2, 2);
  root.add(gb.build());
  // laundry baskets & washboards on the ledge
  addSprite(root, laundryBasket(1), L.x0 + 0.35, y, L.z0 + 0.6);
  addSprite(root, laundryBasket(2), L.x0 + 0.35, y, L.z1 - 0.9);
  const g2 = new GB();
  bucket(g2, L.x0 + 0.3, L.z0 + 1.6, y, true);
  root.add(g2.build());
  stair(
    root,
    currentLayout().lavStairs.x0,
    currentLayout().lavStairs.x1,
    currentLayout().lavStairs.z0,
    currentLayout().lavStairs.z1,
    L.h,
    groundH((currentLayout().lavStairs.x0 + currentLayout().lavStairs.x1) / 2, currentLayout().lavStairs.z1 + 0.1),
    6,
    M.stone,
  );
  places.lavoir1 = [L.x1 - 0.35, L.z0 + 0.7];
  places.lavoir2 = [L.x1 - 0.35, L.z0 + 2.2];
  places.lavoir3 = [L.x1 - 0.35, L.z1 - 0.5];
}

function laundryBasket(seed: number): PixBuf {
  const b = new PixBuf(32, 24);
  const r = new Rng(seed);
  const cl = ["cLinen", "cBlue", "cRed", "wool"];
  for (let k = 0; k < 7; k++) {
    const cx = 6 + r.int(20),
      cy = 6 + r.int(4),
      ramp = cl[r.int(4)];
    for (let y = -4; y < 5; y++) for (let x = -6; x < 7; x++) if (Math.hypot(x / 6, y / 4) < 1) b.set(cx + x, cy + y, pick(ramp, 0.65 - y * 0.06 + Math.sin(x * 0.9 + k) * 0.1, cx + x, cy + y));
  }
  for (let y = 10; y < 24; y++)
    for (let x = 1; x < 31; x++) {
      const ins = Math.round((y - 10) * 0.18);
      if (x < 1 + ins || x > 30 - ins) continue;
      const weave = (x + (y >> 1)) % 4 < 2 !== (((y >> 1) & 1) === 0);
      b.set(x, y, pick("thatch", (y < 12 ? 0.8 : 0.55) + (weave ? 0.1 : -0.1) - (x - 16) / 40 - (y === 23 ? 0.5 : 0), x, y));
    }
  return b;
}

export { bridge, lavoir };
