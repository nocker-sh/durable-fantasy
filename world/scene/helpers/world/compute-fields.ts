import { fbm } from "#/lib/engine/fbm"
import { vnoise } from "#/lib/engine/vnoise"
import { Polyline } from "#/lib/engine/polyline"
import { FR, GN, layout, F, PLAZA_H } from "#/world/scene/world"
import type { RoadPath } from "#/world/scene/world"
import { baseH } from "#/world/scene/helpers/world/base-h"
import { computeH } from "#/world/scene/helpers/world/compute-h"

export function computeFields() {
  const river = new Polyline(layout.value.river)
  const trails = (layout.value.trails ?? []).map((points) => new Polyline(points))
  const roadPaths: RoadPath[] = layout.value.roads.map((road) => ({
    path: new Polyline(road.pts),
    width: road.w,
    kind: road.kind === "cobble" ? 1 : road.kind === "dirt" ? 2 : 3,
  }))
  PLAZA_H.value = baseH(layout.value.plaza[0], layout.value.plaza[1], layout.value)
  for (const j = { value: 0 }; j.value < GN; j.value++)
    for (const i = { value: 0 }; i.value < GN; i.value++) {
      const x = i.value / FR,
        z = j.value / FR,
        k = j.value * GN + i.value
      const dr = river.distance(x, z)
      F.river[k] = dr
      const best = { value: 1e9 },
        kind = { value: 0 }
      // no road is laid with a rule: it wanders a little off its line, swells and narrows as feet and
      // wheels have worn it, and its edge is ragged where the verge pushes in
      const sd = layout.value.seed
      const wx = (vnoise({ x: x, y: z, scale: 0.14, seed: sd + 401 }) - 0.5) * 0.9,
        wz = (vnoise({ x: x, y: z, scale: 0.14, seed: sd + 402 }) - 0.5) * 0.9
      const swell = 1 + (fbm({ x: x, y: z, scale: 0.2, seed: sd + 403 }) - 0.5) * 0.5
      const ragged = (vnoise({ x: x, y: z, scale: 1.7, seed: sd + 404 }) - 0.5) * 0.16
      for (const road of roadPaths) {
        const d = road.path.distance(x + wx, z + wz) - road.width * swell + ragged
        if (d < best.value) {
          best.value = d
          kind.value = road.kind
        }
      }
      F.road[k] = best.value
      const tr = { value: 1e9 }
      for (const trail of trails) tr.value = Math.min(tr.value, trail.distance(x, z))
      F.trail[k] = tr.value
      F.roadKind[k] = kind.value
      F.h[k] = computeH({ x: x, z: z, dr: dr, roads: roadPaths })
    }
}
