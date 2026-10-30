import { gableRoofPanels } from "../../../lib/engine/gable-roof-panels"
import { flueWalls } from "../../town/flue-walls"
import { framedWindow } from "#/world/scene/construction/framed-window"
import { subtractRectangles } from "../../../lib/engine/rectangle-subtraction"
import * as THREE from "three"
import type { BuildingEnvelope } from "../../town/building-envelope"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "./materials"

type Point = [number, number, number]
/** Dimensioned shell: no random bay windows, extra chimneys or guessed storey heights. */
export function authoredBuilding(root: THREE.Group, site: BuildingEnvelope, ground: (x: number, z: number) => number): THREE.Group {
  const x0State = site.bounds,
    x0 = x0State[0],
    z0 = x0State[1],
    x1 = x0State[2],
    z1 = x0State[3],
    gb = new GB(),
    out = new THREE.Group()
  out.name = `authored-building:${site.id}`
  const low = (r: readonly number[]) => Math.min(ground(r[0], r[1]), ground(r[2], r[1]), ground(r[0], r[3]), ground(r[2], r[3]))
  gb.box({ side: M.stoneDark, top: M.stone, x0: x0, y0: low(site.bounds), z0: z0, x1: x1, y1: site.floorY, z1: z1, repeat: 4 })
  const addWall = (a: Point, b: Point, door: boolean) => {
    const width = Math.hypot(b[0] - a[0], b[2] - a[2]),
      dx = (b[0] - a[0]) / width,
      dz = (b[2] - a[2]) / width
    const p = (u: number, y: number): Point => [a[0] + dx * u, y, a[2] + dz * u]
    const panel = (inputProps: { start: number; end: number; bottom: number; top: number }) => {
      const start = inputProps.start
      const end = inputProps.end
      const bottom = inputProps.bottom
      const top = inputProps.top

      if (end > start && top > bottom) gb.quad({ material: M.plaster, a: p(start, bottom), b: p(end, bottom), c: p(end, top), d: p(start, top), repeatU: 2, repeatV: 2 })
    }
    const nx = -dz,
      nz = dx
    const cuts = site.windows
      .filter((w) => w.outward[0] === nx && w.outward[1] === nz)
      .map((w) => {
        const centre = (w.point[0] - a[0]) * dx + (w.point[1] - a[2]) * dz
        return { x0: centre - w.width / 2, z0: site.floorY + w.sill, x1: centre + w.width / 2, z1: site.floorY + w.sill + w.height }
      })
    if (door) {
      const centre = (site.door.point[0] - a[0]) * dx + (site.door.point[1] - a[2]) * dz
      cuts.push({ x0: centre - site.door.width / 2, z0: site.floorY, x1: centre + site.door.width / 2, z1: site.floorY + site.door.height })
    }
    for (const r of subtractRectangles({ x0: 0, z0: site.floorY, x1: width, z1: site.eaveY }, cuts)) panel({ start: r.x0, end: r.x1, bottom: r.z0, top: r.z1 })
  }
  addWall([x0, site.floorY, z1], [x1, site.floorY, z1], site.door.outward[1] === 1)
  addWall([x1, site.floorY, z0], [x0, site.floorY, z0], site.door.outward[1] === -1)
  addWall([x1, site.floorY, z1], [x1, site.floorY, z0], site.door.outward[0] === 1)
  addWall([x0, site.floorY, z0], [x0, site.floorY, z1], site.door.outward[0] === -1)
  const alongX = site.ridgeAxis === "x",
    length = alongX ? x1 - x0 : z1 - z0,
    span = alongX ? z1 - z0 : x1 - x0,
    mid = span / 2,
    ov = site.overhang
  const p = (u: number, y: number, w: number): Point => (alongX ? [x0 + u, y, z0 + w] : [x0 + w, y, z0 + u])
  const roof = { bounds: { x0, z0, x1, z1 }, eave: site.eaveY, ridge: site.ridgeY, ridgeAxis: site.ridgeAxis, overhang: ov }
  const penetrations = site.chimneys.map((c) => ({ x0: c.rect[0], z0: c.rect[1], x1: c.rect[2], z1: c.rect[3] }))
  const slopeLength = Math.hypot(1, (site.ridgeY - site.eaveY) / mid)
  for (const panel of gableRoofPanels(roof, penetrations)) {
    const aState = panel,
      a = aState[0],
      b = aState[1],
      d = aState[3],
      run = alongX ? 0 : 2,
      cross = alongX ? 2 : 0
    gb.quad({
      material: M[site.roof],
      a: panel[0],
      b: panel[1],
      c: panel[2],
      d: panel[3],
      repeatU: 4,
      repeatV: 4,
      offsetU: (Math.sign(b[run] - a[run]) * a[run]) / 4,
      offsetV: (Math.sign(d[cross] - a[cross]) * a[cross] * slopeLength) / 4,
    })
  }
  const triangle = (a: Point, b: Point, c: Point) =>
    alongX ? gb.tri({ material: M.plaster, a: a, b: b, c: c, uvA: [0, 0], uvB: [1, 0], uvC: [0.5, 1] }) : gb.tri({ material: M.plaster, a: b, b: a, c: c, uvA: [0, 0], uvB: [1, 0], uvC: [0.5, 1] })
  triangle(p(length, site.eaveY, span), p(length, site.eaveY, 0), p(length, site.ridgeY, mid))
  triangle(p(0, site.eaveY, 0), p(0, site.eaveY, span), p(0, site.ridgeY, mid))
  for (const step of site.steps) {
    const aState2 = step.rect,
      a = aState2[0],
      b = aState2[1],
      c = aState2[2],
      d = aState2[3],
      bottom = low(step.rect)
    if (bottom > step.height + 1e-6) throw new Error("Entry step intersects its terrain")
    gb.box({ side: M.stone, top: M.stoneDark, x0: a, y0: Math.min(bottom, step.height - 0.001), z0: b, x1: c, y1: step.height, z1: d, repeat: 4 })
  }
  for (const chimney of site.chimneys) {
    const aState3 = chimney.rect,
      a = aState3[0],
      b = aState3[1],
      c = aState3[2],
      d = aState3[3]
    for (const wall of flueWalls({ x0: a, z0: b, x1: c, z1: d }, chimney.wallThickness).walls)
      gb.box({ side: M.stone, top: M.stoneDark, x0: wall.x0, y0: site.eaveY, z0: wall.z0, x1: wall.x1, y1: chimney.top, z1: wall.z1, repeat: 4, bottom: true })
  }
  for (const window of site.windows) out.add(framedWindow(window, site.floorY, site.id))
  const shell = gb.build()
  shell.name = "building-envelope"
  out.add(shell)
  const nx = site.door.outward[0],
    nz = site.door.outward[1],
    tx = -nz,
    tz = nx
  const door = new GB(),
    pointAt = (u: number, n: number) => [site.door.point[0] + tx * u + nx * n, site.door.point[1] + tz * u + nz * n]
  const doorBox = (inputProps: { u0: number; u1: number; y0: number; y1: number; depth: number; material: THREE.Material; normal?: number }) => {
    const u0 = inputProps.u0
    const u1 = inputProps.u1
    const y0 = inputProps.y0
    const y1 = inputProps.y1
    const depth = inputProps.depth
    const material = inputProps.material
    const normal = inputProps.normal === undefined ? -site.door.recess : inputProps.normal

    const a = pointAt(u0, normal - depth / 2),
      b = pointAt(u1, normal + depth / 2)
    door.box({ side: material, top: material, x0: Math.min(a[0], b[0]), y0: y0, z0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: y1, z1: Math.max(a[1], b[1]), repeat: 2 })
  }
  const leafBottom = site.floorY + site.door.leafBottom,
    leafHeight = site.door.leafTop - site.door.leafBottom
  const halfLeaf = site.door.width / 2 - site.door.frameInset
  doorBox({ u0: -halfLeaf, u1: halfLeaf, y0: site.floorY + site.door.leafBottom, y1: site.floorY + site.door.leafTop, depth: site.door.leafThickness, material: M.woodV })
  const frame = new GB()
  // The jamb fills the wall reveal; its inner edge is the audited clear aperture.
  for (const side of [-1, 1]) {
    const a = pointAt(side * halfLeaf, 0),
      b = pointAt((side * site.door.width) / 2, -site.door.recess)
    frame.box({
      side: M.woodDark,
      top: M.woodDark,
      x0: Math.min(a[0], b[0]),
      y0: site.floorY,
      z0: Math.min(a[1], b[1]),
      x1: Math.max(a[0], b[0]),
      y1: site.floorY + site.door.height,
      z1: Math.max(a[1], b[1]),
      repeat: 2,
    })
  }
  const top = (u: number, n: number): Point => {
    const p = pointAt(u, n)
    return [p[0], site.floorY + site.door.height, p[1]]
  }
  frame.quad({ material: M.plaster, a: top(-halfLeaf, 0), b: top(halfLeaf, 0), c: top(halfLeaf, -site.door.recess), d: top(-halfLeaf, -site.door.recess), repeatU: 2, repeatV: 2 })
  const jamb = frame.build()
  jamb.name = "entry-door-frame"
  out.add(jamb)
  for (const at of [0.2, 0.8])
    doorBox({
      u0: -halfLeaf * 0.9,
      u1: halfLeaf * 0.9,
      y0: leafBottom + leafHeight * at,
      y1: leafBottom + leafHeight * at + Math.min(site.door.frameInset, leafHeight * 0.05),
      depth: site.door.leafThickness + 2 * site.door.braceProjection,
      material: M.woodDark,
    })
  const handle = site.door.hingeSign * (halfLeaf - site.door.handleAlong)
  doorBox({
    u0: handle - site.door.frameInset,
    u1: handle + site.door.frameInset,
    y0: leafBottom + leafHeight * 0.5,
    y1: leafBottom + leafHeight * 0.56,
    depth: site.door.leafThickness + 2 * site.door.handleProjection,
    material: M.iron,
  })
  const leaf = door.build()
  leaf.name = "entry-door-panel"
  const entry = new THREE.Group()
  entry.name = "entry-door"
  entry.add(leaf, jamb)
  out.add(entry)
  const along = (point: readonly number[]) => (point[0] - site.door.point[0]) * nx + (point[1] - site.door.point[1]) * nz
  const ends = site.steps.map((s) => ({
    start: Math.min(along([s.rect[0], s.rect[1]]), along([s.rect[2], s.rect[3]])),
    end: Math.max(along([s.rect[0], s.rect[1]]), along([s.rect[2], s.rect[3]])),
    height: s.height,
  }))
  const rail = (a: THREE.Vector3, b: THREE.Vector3, name: string) => {
    const delta = b.clone().sub(a),
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(site.railInset * 0.45, site.railInset * 0.45, delta.length(), 6), M.woodDark)
    mesh.name = name
    mesh.position.copy(a).add(b).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
    out.add(mesh)
  }
  const first = ends[0],
    last = ends[ends.length - 1],
    halfWidth = ((nx === 0 ? site.steps[0].rect[2] - site.steps[0].rect[0] : site.steps[0].rect[3] - site.steps[0].rect[1]) - site.railInset) / 2
  const point = (distance: number, cross: number, height: number) => new THREE.Vector3(site.door.point[0] + nx * distance + tx * cross, height, site.door.point[1] + nz * distance + tz * cross)
  for (const side of [-1, 1]) {
    const cross = side * halfWidth
    const knots = [
      [first.start, first.height],
      [first.end, first.height],
      [last.start, last.height],
      [last.end, last.height],
    ]
    for (let i = 0; i < knots.length - 1; i++) rail(point(knots[i][0], cross, knots[i][1] + site.railHeight), point(knots[i + 1][0], cross, knots[i + 1][1] + site.railHeight), "entry-handrail")
    for (const step of ends) {
      const at = (step.start + step.end) / 2,
        t = Math.max(0, Math.min(1, (at - first.end) / (last.start - first.end)))
      const height = first.height + (last.height - first.height) * t + site.railHeight
      rail(point(at, cross, step.height), point(at, cross, height), "entry-post")
    }
  }
  out.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
  root.add(out)
  return out
}
