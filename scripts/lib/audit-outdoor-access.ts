import type { SettingDocument } from "#/scripts/lib/setting-document"
import { segmentRectDistance } from "#/lib/engine/segment-rect-distance"
import { MIN_PASSAGE_WIDTH_M } from "#/scripts/lib/spatial-rules"
import type { Access, OutdoorObstacle } from "#/scripts/lib/outdoor-access"
import { outdoorEntrance } from "#/scripts/lib/outdoor-entrance"

/** Reserve a square body envelope along each axis-aligned outdoor segment. */
type Props = {
  doc: SettingDocument
  documents: ReadonlyMap<string, SettingDocument>
  obstacles: readonly OutdoorObstacle[]
  metres: number
  mapTiles: number
  water: { points: readonly (readonly number[])[]; half_width: number }
}

export function auditOutdoorAccess(props: Props): string[] {
  const routes = (props.doc.access_routes ?? []) as Access[],
    errors: string[] = []
  if (props.doc.sanitation_role && props.doc.design_gate === "通過" && !routes.length) errors.push("Sanitation facility has no access route")
  if (props.doc.design_gate === "通過")
    for (const source of props.documents.values()) {
      const incoming = (source.material_routes ?? []) as { to: string }[]
      if (!incoming.some((route) => route.to === props.doc.id)) continue
      const connected = routes.some((route) => (source.kind === "rooms" ? route.from.document === source.building && route.from.room === source.id : route.from.document === source.id))
      if (!connected) errors.push(`Material source ${source.id} has no access route`)
    }
  for (const entry of routes.entries()) {
    const index = entry[0]
    const route = entry[1]

    const fail = (message: string) => errors.push(`Access route ${index + 1}: ${message}`)
    const source = outdoorEntrance(route.from, props.documents, props.metres),
      target = outdoorEntrance({ document: props.doc.id, door: route.door }, props.documents, props.metres),
      points = route.points_tiles
    if (!source || !target || source.map !== target.map) {
      fail("endpoints have no matching outdoor doors on one map")
      continue
    }
    if (!Number.isFinite(route.width_m) || route.width_m < MIN_PASSAGE_WIDTH_M || points.length < 2) {
      fail("invalid width or path")
      continue
    }
    if (route.width_m > Math.min(source.width_m, target.width_m) + 1e-9) fail("path is wider than an endpoint door")
    for (const entry2 of [
      [source, points[0]],
      [target, points[points.length - 1]],
    ] as const) {
      const endpoint = entry2[0]
      const point = entry2[1]
      if (Math.hypot(endpoint.point[0] - point[0], endpoint.point[1] - point[1]) > 1e-6) fail("path does not join its exact doorway")
    }
    const along = (inputProps: { a: number[]; b: number[]; normal: readonly number[]; sign: number }) => {
      const a = inputProps.a
      const b = inputProps.b
      const normal = inputProps.normal
      const sign = inputProps.sign

      const dx = b[0] - a[0],
        dz = b[1] - a[1]
      return (dx * normal[0] + dz * normal[1]) * sign > 0 && Math.abs(dx * normal[1] - dz * normal[0]) < 1e-6
    }
    if (!along({ a: points[0], b: points[1], normal: source.outward, sign: 1 }) || !along({ a: points[points.length - 2], b: points[points.length - 1], normal: target.outward, sign: -1 }))
      fail("path does not leave and enter through the doorway normals")
    const all = new Map(props.obstacles.filter((o) => o.map === source.map).map((o) => [o.id, o.rect]))
    all.set(source.id, source.bounds)
    all.set(target.id, target.bounds)
    const half = route.width_m / props.metres / 2
    for (const i = { value: 1 }; i.value < points.length; i.value++) {
      const a = points[i.value - 1],
        b = points[i.value],
        dx = b[0] - a[0],
        dz = b[1] - a[1]
      if (Math.abs(dx) < 1e-9 === Math.abs(dz) < 1e-9) {
        fail("use nonzero axis-aligned segments")
        continue
      }
      const swept: [number, number, number, number] = [Math.min(a[0], b[0]) - half, Math.min(a[1], b[1]) - half, Math.max(a[0], b[0]) + half, Math.max(a[1], b[1]) + half]
      if (swept[0] < 0 || swept[1] < 0 || swept[2] > props.mapTiles || swept[3] > props.mapTiles) fail("path leaves the map")
      for (const entry3 of all) {
        const id = entry3[0]
        const rect = entry3[1]

        if ((id === source.id && i.value === 1) || (id === target.id && i.value === points.length - 1)) continue
        if (swept[0] < rect[2] - 1e-9 && rect[0] < swept[2] - 1e-9 && swept[1] < rect[3] - 1e-9 && rect[1] < swept[3] - 1e-9) fail(`path crosses ${id}`)
      }
      if (props.water.points.slice(1).some((point, j) => segmentRectDistance(swept, props.water.points[j], point) < props.water.half_width)) fail("path covers water")
    }
    if (props.doc.design_gate === "通過" && route.status !== "designed") fail("access is still proposed")
  }
  return [...new Set(errors)]
}
