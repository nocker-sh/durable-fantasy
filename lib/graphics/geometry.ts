import * as THREE from "three";

type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);

interface Group {
  pos: number[];
  uv: number[];
}

/** Accumulates flat-shaded triangles per material, then emits merged meshes. */
export class GeometryBuilder {
  groups = new Map<THREE.Material, Group>();
  private g(m: THREE.Material): Group {
    let g = this.groups.get(m);
    if (!g) {
      g = { pos: [], uv: [] };
      this.groups.set(m, g);
    }
    return g;
  }
  tri(m: THREE.Material, a: V3, b: V3, c: V3, ua: [number, number], ub: [number, number], uc: [number, number]) {
    const g = this.g(m);
    g.pos.push(...a, ...b, ...c);
    g.uv.push(...ua, ...ub, ...uc);
  }
  /** a..d counter-clockwise seen from the front: bottom-left, bottom-right, top-right, top-left.
   *  ru/rv: world units per texture repeat; ru=0 means fit 0..1. */
  quad(m: THREE.Material, a: V3, b: V3, c: V3, d: V3, ru = 0, rv = 0, u0 = 0, v0 = 0) {
    const w = len(sub(b, a)),
      h = len(sub(d, a));
    const U = ru ? w / ru : 1,
      V = rv ? h / rv : 1;
    this.tri(m, a, b, c, [u0, v0], [u0 + U, v0], [u0 + U, v0 + V]);
    this.tri(m, a, c, d, [u0, v0], [u0 + U, v0 + V], [u0, v0 + V]);
  }
  box(side: THREE.Material, top: THREE.Material | null, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r = 2, bottom = false) {
    const p = (x: number, y: number, z: number): V3 => [x, y, z];
    this.quad(side, p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1), r, r, x0 / r, y0 / r); // +z
    this.quad(side, p(x1, y0, z0), p(x0, y0, z0), p(x0, y1, z0), p(x1, y1, z0), r, r, -x1 / r, y0 / r); // -z
    this.quad(side, p(x1, y0, z1), p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), r, r, -z1 / r, y0 / r); // +x
    this.quad(side, p(x0, y0, z0), p(x0, y0, z1), p(x0, y1, z1), p(x0, y1, z0), r, r, z0 / r, y0 / r); // -x
    if (top) this.quad(top, p(x0, y1, z1), p(x1, y1, z1), p(x1, y1, z0), p(x0, y1, z0), r, r, x0 / r, -z1 / r);
    if (bottom) this.quad(top ?? side, p(x0, y0, z0), p(x1, y0, z0), p(x1, y0, z1), p(x0, y0, z1), r, r);
  }
  cyl(side: THREE.Material, top: THREE.Material | null, cx: number, cz: number, y0: number, y1: number, r0: number, r1 = r0, seg = 10, ru = 2) {
    const circ = 2 * Math.PI * Math.max(r0, r1);
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2,
        a1 = ((i + 1) / seg) * Math.PI * 2;
      const P = (a: number, y: number, r: number): V3 => [cx + Math.cos(a) * r, y, cz - Math.sin(a) * r];
      const u0 = ((i / seg) * circ) / ru,
        u1 = (((i + 1) / seg) * circ) / ru;
      const v = (y1 - y0) / ru;
      this.tri(side, P(a0, y0, r0), P(a1, y0, r0), P(a1, y1, r1), [u0, 0], [u1, 0], [u1, v]);
      this.tri(side, P(a0, y0, r0), P(a1, y1, r1), P(a0, y1, r1), [u0, 0], [u1, v], [u0, v]);
      if (top && r1 > 0) {
        const c: V3 = [cx, y1, cz];
        const t0 = P(a0, y1, r1),
          t1 = P(a1, y1, r1);
        this.tri(top, c, t0, t1, [0.5, 0.5], [0.5 + Math.cos(a0) * 0.5, 0.5 + Math.sin(a0) * 0.5], [0.5 + Math.cos(a1) * 0.5, 0.5 + Math.sin(a1) * 0.5]);
      }
    }
  }
  build(shadows = true): THREE.Group {
    const out = new THREE.Group();
    for (const [m, g] of this.groups) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(g.pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(g.uv, 2));
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, m);
      mesh.castShadow = shadows;
      mesh.receiveShadow = true;
      out.add(mesh);
    }
    this.groups.clear();
    return out;
  }
}
