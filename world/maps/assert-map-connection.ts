import { walkable } from "#/world/maps/walkable"
import { cellDistance } from "#/world/maps/cell-distance"
import type { MapDefinition, Warp } from "#/world/maps/types"

type Props = Readonly<{ source: string; warp: Warp; maps: Readonly<Record<string, MapDefinition>> }>

/** An arrival must resolve to free ground clear of every destination trigger. */
export function assertMapConnection(props: Props): void {
  const destination = props.warp.to.map,
    target = Object.hasOwn(props.maps, destination) ? props.maps[destination] : undefined,
    label = `${props.source} -> ${destination}`
  if (!target || target.id !== destination) throw new Error(`Map connection destination is missing or miskeyed: ${label}`)
  if (!walkable(target, props.warp.to.at)) throw new Error(`Map connection arrival is blocked: ${label}`)
  if (target.warps.some((warp) => cellDistance(warp.at, props.warp.to.at) <= 1)) throw new Error(`Map connection arrival touches a warp trigger: ${label}`)
}
