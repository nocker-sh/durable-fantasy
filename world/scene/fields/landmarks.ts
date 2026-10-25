import * as THREE from "three";
import { GB, colorMat, mat } from "../gfx";
import { M, chimneys, fireLights, type V2 } from "../build";
import { Rng } from "../pix";
import { leafTex } from "../textures";
import { N, blockCircle, blockRect, groundH } from "../world";
import { rust, rustDark, rocks, rockGeo } from "./vegetation.ts";
import { type Spot, instanced } from "./instancing.ts";

// ---------------------------------------------------------------- landmarks
export function signboard(root: THREE.Group, x: number, z: number, lines: string[], rot = 0) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#b08a5e";
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "#8a6a48";
  for (let y = 0; y < 128; y += 32) g.fillRect(0, y, 256, 3);
  g.fillStyle = "#1e1410";
  g.font = 'bold 34px "DotGothic16", sans-serif';
  g.textAlign = "center";
  g.textBaseline = "middle";
  const size = Math.min(34, Math.floor(236 / Math.max(...lines.map((l) => l.length))));
  g.font = `bold ${size}px "DotGothic16", sans-serif`;
  lines.forEach((l, i) => g.fillText(l, 128, 64 + (i - (lines.length - 1) / 2) * (size + 8)));
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  const grp = new THREE.Group();
  const y0 = groundH(x, z);
  const gb = new GB();
  gb.box(M.woodDark, null, -0.5, 0, -0.04, -0.42, 1.3, 0.04, 2);
  gb.box(M.woodDark, null, 0.42, 0, -0.04, 0.5, 1.3, 0.04, 2);
  grp.add(gb.build());
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
  board.position.set(0, 1.0, 0.05);
  board.castShadow = true;
  grp.add(board);
  grp.position.set(x, y0, z);
  grp.rotation.y = rot;
  root.add(grp);
  blockCircle(x, z, 0.5);
}

/** A city wall across the map at `z` with a shut gate at `gx`, and the sign about the work. */
export function cityWall(root: THREE.Group, z: number, gx: number, chimneysBehind: boolean) {
  const gb = new GB();
  for (const [x0, x1] of [
    [0, gx - 2.4],
    [gx + 2.4, N],
  ] as V2[]) {
    const y = Math.min(groundH(x0 + 1, z), groundH(x1 - 1, z));
    gb.box(M.ashlar, M.stone, x0, y - 0.8, z - 0.6, x1, y + 3.4, z + 0.6, 2);
    for (let x = x0 + 0.4; x < x1 - 0.4; x += 1.2) gb.box(M.ashlar, M.stone, x, y + 3.4, z - 0.6, x + 0.6, y + 3.9, z + 0.6, 2);
    blockRect(x0, z - 0.7, x1, z + 0.7);
  }
  for (const x of [gx - 3, gx + 3]) {
    const y = groundH(x, z);
    gb.box(M.ashlar, M.stone, x - 1.3, y - 0.8, z - 1.3, x + 1.3, y + 4.8, z + 1.3, 2);
    blockRect(x - 1.35, z - 1.35, x + 1.35, z + 1.35);
  }
  const y = groundH(gx, z);
  gb.box(M.woodDark, M.woodDark, gx - 1.7, y - 0.2, z - 0.2, gx + 1.7, y + 3.2, z + 0.2, 2); // the gate, shut
  for (const t of [0.8, 2.2]) gb.box(M.iron, null, gx - 1.7, y + t, z + 0.2, gx + 1.7, y + t + 0.12, z + 0.26, 1);
  blockRect(gx - 1.8, z - 0.3, gx + 1.8, z + 0.3);
  // scaffolding and a barrier: the town beyond is still being built
  for (const x of [gx - 1.4, gx + 1.4]) gb.box(M.wood, null, x - 0.06, y, z + 1.4, x + 0.06, y + 1.0, z + 1.52, 2);
  gb.box(M.wood, M.wood, gx - 1.6, y + 0.7, z + 1.38, gx + 1.6, y + 0.86, z + 1.54, 2);
  blockRect(gx - 1.7, z + 1.2, gx + 1.7, z + 1.7);
  root.add(gb.build());
  signboard(root, gx + 2.4, z + 2.2, ["この先は工事中", "まだ入れない"], -0.2);
  if (chimneysBehind)
    for (const [cx, cz] of [
      [14, z - 4],
      [21, z - 7],
      [31, z - 5],
      [37, z - 8],
    ] as V2[]) {
      const g2 = new GB();
      const cy = groundH(cx, cz);
      g2.box(M.stoneDark, M.stone, cx - 0.4, cy, cz - 0.4, cx + 0.4, cy + 5.2, cz + 0.4, 2);
      root.add(g2.build());
      chimneys.push(new THREE.Vector3(cx, cy + 5.3, cz));
    }
}

export function rustedMachine(root: THREE.Group, x: number, z: number) {
  // a walking engine from the war, half sunk in the sand for two hundred years
  const gb = new GB();
  const y = groundH(x, z) - 0.6;
  gb.box(rust, rustDark, x - 1.6, y, z - 1.0, x + 1.4, y + 1.6, z + 1.1, 2);
  gb.box(rustDark, rust, x - 1.0, y + 1.6, z - 0.7, x + 0.8, y + 2.3, z + 0.7, 2);
  gb.cyl(rust, rustDark, x + 1.9, z + 0.2, y + 0.2, y + 1.4, 0.35, 0.3, 8, 2);
  gb.box(rustDark, null, x - 2.6, y, z + 0.6, x - 1.6, y + 0.3, z + 0.9, 2); // a leg, fallen
  gb.box(rustDark, null, x + 0.2, y + 2.3, z - 0.1, x + 0.3, y + 3.2, z, 1); // a mast
  root.add(gb.build());
  blockRect(x - 1.8, z - 1.2, x + 2.3, z + 1.3);
}

export function brokenTower(root: THREE.Group, x: number, z: number) {
  // an old watchtower on the cliff, its top long fallen
  const gb = new GB();
  const y = groundH(x, z);
  gb.cyl(M.ashlar, M.stone, x, z, y - 0.4, y + 3.6, 1.2, 1.05, 10, 2);
  gb.cyl(M.ashlar, null, x + 0.3, z, y + 3.6, y + 4.5, 0.9, 0.7, 7, 2);
  gb.box(M.dark, null, x - 0.3, y, z + 1.1, x + 0.3, y + 1.3, z + 1.2, 1);
  root.add(gb.build());
  rocks(root, [
    { x: x + 1.8, z: z + 0.6, s: 0.7, r: 1 },
    { x: x - 1.6, z: z + 1.2, s: 0.5, r: 2 },
    { x: x + 0.8, z: z - 1.8, s: 0.6, r: 3 },
  ]);
  blockCircle(x, z, 1.4);
}

export function netShed(root: THREE.Group, x: number, z: number, rot: number) {
  // Jacob's net shed: no hearth and no bed, only nets, floats and oars
  const g = new THREE.Group();
  const gb = new GB();
  gb.box(M.woodV, M.wood, -1.2, -0.3, -0.9, 1.2, 1.5, 0.9, 2);
  gb.quad(M.thatch, [-1.4, 1.5, 1.05], [1.4, 1.5, 1.05], [1.4, 2.3, 0], [-1.4, 2.3, 0], 1, 1);
  gb.quad(M.thatch, [1.4, 1.5, -1.05], [-1.4, 1.5, -1.05], [-1.4, 2.3, 0], [1.4, 2.3, 0], 1, 1);
  gb.box(M.dark, null, -0.35, 0, 0.9, 0.35, 1.2, 0.94, 1);
  g.add(gb.build());
  g.position.set(x, groundH(x, z), z);
  g.rotation.y = rot;
  root.add(g);
  blockRect(x - 1.4, z - 1.4, x + 1.4, z + 1.4);
}

export function boat(root: THREE.Group, x: number, z: number, rot: number) {
  const g = new THREE.Group();
  const gb = new GB();
  gb.box(M.woodDark, M.wood, -1.3, 0, -0.45, 1.3, 0.45, 0.45, 2);
  gb.box(M.wood, null, -1.25, 0.45, -0.5, 1.25, 0.52, -0.42, 2);
  gb.box(M.wood, null, -1.25, 0.45, 0.42, 1.25, 0.52, 0.5, 2);
  gb.box(M.wood, null, -0.2, 0.3, -0.42, 0.2, 0.4, 0.42, 2);
  g.add(gb.build());
  g.position.set(x, groundH(x, z) + 0.05, z);
  g.rotation.set(0, rot, 0.12);
  root.add(g);
  blockCircle(x, z, 1.2);
}

export function dryingRack(root: THREE.Group, x: number, z: number) {
  // fish split and hung to dry in the cold wind
  const gb = new GB();
  const y = groundH(x, z);
  for (const dx of [-1.1, 1.1]) gb.box(M.woodDark, null, x + dx - 0.05, y, z - 0.05, x + dx + 0.05, y + 1.5, z + 0.05, 2);
  gb.box(M.woodDark, null, x - 1.2, y + 1.42, z - 0.04, x + 1.2, y + 1.5, z + 0.04, 2);
  const fish = colorMat(0x9aa4a8);
  for (let k = 0; k < 7; k++) gb.box(fish, null, x - 1 + k * 0.33 - 0.06, y + 0.95, z - 0.02, x - 1 + k * 0.33 + 0.06, y + 1.4, z + 0.02, 1);
  root.add(gb.build());
  blockRect(x - 1.25, z - 0.3, x + 1.25, z + 0.3);
}

export function charcoalKiln(root: THREE.Group, x: number, z: number) {
  // Josef's charcoal mound, banked with earth and smoking day and night
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), colorMat(0x4a3a34));
  dome.position.set(x, groundH(x, z) - 0.1, z);
  dome.scale.y = 0.8;
  dome.castShadow = true;
  dome.receiveShadow = true;
  root.add(dome);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ color: 0xff7a30 }));
  glow.position.set(x, groundH(x, z) + 0.15, z + 1.17);
  root.add(glow);
  const l = new THREE.PointLight(0xff8a3a, 1.2, 4, 1.5);
  l.position.set(x, groundH(x, z) + 0.4, z + 1.5);
  root.add(l);
  fireLights.push({ light: l, base: 1.2, seed: x });
  chimneys.push(new THREE.Vector3(x, groundH(x, z) + 1.0, z));
  blockCircle(x, z, 1.4);
}

export function cairn(root: THREE.Group, x: number, z: number) {
  const spots: Spot[] = [];
  for (let k = 0; k < 6; k++) spots.push({ x, z, s: 0.7 - k * 0.1, r: k * 1.3 });
  instanced(root, rockGeo, M.rock, spots, (s) => [
    [s.x, groundH(s.x, s.z) + (0.7 - s.s) * 1.2, s.z],
    [s.r, s.r, 0],
    [s.s, s.s * 0.6, s.s],
  ]);
  blockCircle(x, z, 0.5);
}

export function emptyShrine(root: THREE.Group, x: number, z: number) {
  // an altar nobody tends any more, from when the goddess was here
  const gb = new GB();
  const y = groundH(x, z);
  gb.box(M.stoneDark, M.stone, x - 1.2, y - 0.2, z - 0.8, x + 1.2, y + 0.3, z + 0.8, 2);
  gb.box(M.ashlar, M.stone, x - 0.5, y + 0.3, z - 0.4, x + 0.5, y + 1.1, z + 0.4, 2);
  for (const dx of [-1.0, 1.0]) gb.box(M.ashlar, M.stone, x + dx - 0.18, y + 0.3, z - 0.18, x + dx + 0.18, y + (dx < 0 ? 2.2 : 1.3), z + 0.18, 2);
  root.add(gb.build());
  blockRect(x - 1.3, z - 0.9, x + 1.3, z + 0.9);
}

export function ruinedWall(root: THREE.Group, pts: V2[], seed: number) {
  // a fort wall from the war, broken into stretches and grown over with moss
  const gb = new GB();
  const r = new Rng(seed);
  const moss = mat(leafTex("moss", seed));
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, az] = pts[i],
      [bx, bz] = pts[i + 1];
    const steps = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.8);
    for (let k = 0; k < steps; k++) {
      if (r.next() < 0.25) continue;
      const x = ax + ((bx - ax) * k) / steps,
        z = az + ((bz - az) * k) / steps;
      const h = 0.4 + r.next() * 1.6,
        y = groundH(x, z);
      gb.box(M.stoneDark, r.next() < 0.6 ? moss : M.stone, x - 0.42, y - 0.3, z - 0.42, x + 0.42, y + h, z + 0.42, 2);
      blockRect(x - 0.45, z - 0.45, x + 0.45, z + 0.45);
    }
  }
  root.add(gb.build());
}
