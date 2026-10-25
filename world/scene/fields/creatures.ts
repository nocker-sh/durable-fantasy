import { outlineShape } from "../outline";
import * as THREE from "three";
import { colorMat, toTex } from "../gfx";
import { critters } from "../actors";
import type { V2 } from "../build";
import { PixBuf, Rng, hash2 } from "../pix";
import { groundH, isFree } from "../world";

// ---------------------------------------------------------------- creatures
/**
 * A slime: hops about the grass on its own business and never comes for you (world.md: monsters are
 * ordinary creatures now). Where it goes is decided in the browser for now; the server will own
 * monsters once there is combat.
 */
/** A slime's body: a dome of jelly, a shine, two eyes. */
/**
 * A slime's skin, drawn as pixels (wrapped round the dome: x is the way round, the front at a
 * quarter; y from the crown down to the rim): a few tones of its own colour, a bright gleam up on
 * the left, little bubbles inside, and two eyes with a catchlight. Eyes only: creatures have no
 * mouth or nose drawn (ui.md §6.4.2).
 */
const SLIME_W = 64,
  SLIME_H = 16;

const slimeTexCache = new Map<number, THREE.Texture>();

function slimeTex(color: number): THREE.Texture {
  const hit = slimeTexCache.get(color);
  if (hit) return hit;
  const base: [number, number, number] = [(color >> 16) & 255, (color >> 8) & 255, color & 255];
  const mix = (k: number, to: number): [number, number, number] => base.map((c) => Math.round(c + (to - c) * k)) as [number, number, number];
  // tones: rim shadow, shade, body, lit, gleam
  const tone = [mix(0.55, 20), mix(0.28, 30), base, mix(0.28, 255), mix(0.88, 255)];
  const eye: [number, number, number] = [30, 22, 38],
    white: [number, number, number] = [250, 250, 244];
  const b = new PixBuf(SLIME_W, SLIME_H);
  const front = SLIME_W / 4;
  b.fill((x, y) => {
    // shading by height on the dome, a band of dither between tones
    const k = y / (SLIME_H - 1);
    let t = k < 0.3 ? 3 : k < 0.72 ? 2 : k < 0.9 ? 1 : 0;
    if (k > 0.25 && k < 0.35) t = (x + y) % 2 ? 3 : 2;
    if (k > 0.67 && k < 0.77) t = (x + y) % 2 ? 2 : 1;
    // bubbles: a few lighter dots, fixed in the gel
    if (hash2(x, y, 7) > 0.95 && y > 3 && y < 12) t = Math.min(4, t + 1);
    const dx = x - front;
    // the gleam, up and to the left of the face
    if ((y === 3 && dx >= -7 && dx <= -4) || (y === 4 && dx >= -8 && dx <= -6) || (y === 5 && dx === -8)) t = 4;
    if (y === 3 && dx === -3) t = 3;
    // eyes: two pixels wide, three tall, a catchlight at the top
    for (const ex of [-4, 3]) if (dx >= ex && dx <= ex + 1 && y >= 6 && y <= 8) return y === 6 && dx === ex ? white : eye;
    return tone[Math.max(0, Math.min(4, t))];
  });
  const tex = toTex(b, false);
  tex.wrapS = THREE.RepeatWrapping;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  slimeTexCache.set(color, tex);
  return tex;
}

export function slimeBody(color: number): THREE.Group {
  const body = new THREE.Group();
  const gel = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 7, 0, Math.PI * 2, 0, Math.PI * 0.62), new THREE.MeshLambertMaterial({ map: slimeTex(color), transparent: true, opacity: 0.92 }));
  gel.position.y = -0.06;
  gel.castShadow = true;
  body.add(gel);
  return body;
}

/** A hare's body: blocky, long-eared. */
export function hareBody(): THREE.Group {
  const body = new THREE.Group();
  const fur = colorMat(0x8a7058),
    pale = colorMat(0xd8ccb8);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.26), fur);
  b.position.y = 0.09;
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.12), fur);
  h.position.set(0, 0.17, 0.14);
  for (const dx of [-0.03, 0.03]) {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.13, 0.04), fur);
    ear.position.set(dx, 0.28, 0.12);
    body.add(ear);
  }
  // eyes only, one on each side of the head
  for (const sx of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.025, 0.025), new THREE.MeshBasicMaterial({ color: 0x1a1420 }));
    e.position.set(sx * 0.056, 0.19, 0.17);
    body.add(e);
  }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.05), pale);
  tail.position.set(0, 0.12, -0.14);
  b.castShadow = true;
  body.add(b, h, tail);
  return body;
}

export class Slime {
  get obj() {
    return this.body;
  }
  outline(on: boolean) {
    outlineShape(this.body, on);
  }
  pos: V2;
  target: V2;
  t = 0;
  hop = 0;
  wait: number;
  body: THREE.Group;
  r: Rng;
  constructor(
    root: THREE.Group,
    public area: [number, number, number, number],
    seed: number,
    color: number,
  ) {
    this.r = new Rng(seed);
    this.pos = [area[0] + this.r.next() * (area[2] - area[0]), area[1] + this.r.next() * (area[3] - area[1])];
    this.target = [...this.pos] as V2;
    this.wait = this.r.next() * 3;
    this.body = slimeBody(color);
    root.add(this.body);
  }
  update(dt: number) {
    this.t += dt;
    const dx = this.target[0] - this.pos[0],
      dz = this.target[1] - this.pos[1],
      d = Math.hypot(dx, dz);
    if (this.wait > 0) {
      this.wait -= dt;
      if (this.wait <= 0) {
        for (let k = 0; k < 8; k++) {
          const a = this.area,
            x = Math.min(a[2], Math.max(a[0], this.pos[0] + (this.r.next() - 0.5) * 1.6)),
            z = Math.min(a[3], Math.max(a[1], this.pos[1] + (this.r.next() - 0.5) * 1.6));
          if (isFree(x, z)) {
            this.target = [x, z];
            break;
          }
        }
      }
    } else if (d < 0.05) {
      this.wait = 12 + this.r.next() * 20;
    } else {
      // bounce along in little hops
      this.hop = (this.hop + dt * 2.2) % 1;
      const v = Math.min(d, dt * 0.9);
      this.pos[0] += (dx / d) * v;
      this.pos[1] += (dz / d) * v;
      this.body.rotation.y = Math.atan2(dx, dz);
    }
    const lift = this.wait > 0 ? 0 : Math.sin(this.hop * Math.PI) * 0.22;
    const squash = this.wait > 0 ? 1 + Math.sin(this.t * 2.4) * 0.035 : 1 - Math.sin(this.hop * Math.PI * 2) * 0.1;
    this.body.position.set(this.pos[0], groundH(this.pos[0], this.pos[1]) + 0.06 + lift, this.pos[1]);
    this.body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));
  }
}

/** A hare: sits, nibbles, darts off a few steps. */
export class Hare {
  get obj() {
    return this.body;
  }
  outline(on: boolean) {
    outlineShape(this.body, on);
  }
  pos: V2;
  target: V2;
  wait: number;
  body: THREE.Group;
  r: Rng;
  t = 0;
  constructor(
    root: THREE.Group,
    public area: [number, number, number, number],
    seed: number,
  ) {
    this.r = new Rng(seed);
    this.pos = [area[0] + this.r.next() * (area[2] - area[0]), area[1] + this.r.next() * (area[3] - area[1])];
    this.target = [...this.pos] as V2;
    this.wait = this.r.next() * 4;
    this.body = hareBody();
    root.add(this.body);
  }
  update(dt: number) {
    this.t += dt;
    const dx = this.target[0] - this.pos[0],
      dz = this.target[1] - this.pos[1],
      d = Math.hypot(dx, dz);
    let lift = 0;
    if (this.wait > 0) {
      this.wait -= dt;
      if (this.wait <= 0) {
        const a = this.r.next() * Math.PI * 2,
          far = 1 + this.r.next() * 2.5;
        const x = Math.min(this.area[2], Math.max(this.area[0], this.pos[0] + Math.cos(a) * far));
        const z = Math.min(this.area[3], Math.max(this.area[1], this.pos[1] + Math.sin(a) * far));
        if (isFree(x, z)) this.target = [x, z];
        else this.wait = 1;
      }
    } else if (d < 0.05) this.wait = 2 + this.r.next() * 5;
    else {
      const v = Math.min(d, dt * 2.6);
      this.pos[0] += (dx / d) * v;
      this.pos[1] += (dz / d) * v;
      this.body.rotation.y = Math.atan2(dx, dz);
      lift = Math.abs(Math.sin(this.t * 14)) * 0.08;
    }
    this.body.position.set(this.pos[0], groundH(this.pos[0], this.pos[1]) + lift, this.pos[1]);
  }
}

const SLIME_COLOURS = [0x6ab0a0, 0x8ac06a, 0x6a9ac8, 0xc8a06a];

export function slimes(root: THREE.Group, count: number, area: [number, number, number, number], seed: number) {
  for (let i = 0; i < count; i++) critters.push(new Slime(root, area, seed + i, SLIME_COLOURS[(seed + i) % SLIME_COLOURS.length]));
}

export function hares(root: THREE.Group, count: number, area: [number, number, number, number], seed: number) {
  for (let i = 0; i < count; i++) critters.push(new Hare(root, area, seed + i));
}
