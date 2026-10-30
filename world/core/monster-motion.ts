import { getMonsterBodyRadius } from "#/world/core/get-monster-body-radius"
import { createMonsterNavigationFree } from "#/world/core/create-monster-navigation-free"
import { MONSTER_MOVE_PERIOD_MS as PERIOD } from "#/world/core/monster-motion-rules"
import { getMonsterRoute, type MonsterRoute } from "#/world/core/get-monster-route"
import { getMonsterRoutePosition } from "#/world/core/get-monster-route-position"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { getMonsterMotionHash } from "#/world/core/get-monster-motion-hash"
import { getMonsterRest } from "#/world/core/get-monster-rest"
import type { Spawn } from "#/world/core/monster-types"

type Props = Readonly<{ spawn: Spawn; free: (x: number, z: number) => boolean }>

/** 地形が固定されたマップで、現在と隣接区間の位置・経路だけを保持する。 */
export class MonsterMotion {
  private readonly points = new Map<number, [number, number]>()
  private readonly routes = new Map<number, MonsterRoute>()
  private readonly phase: number
  private readonly radius: number
  private readonly navigationFree: (x: number, z: number) => boolean

  constructor(private readonly props: Props) {
    this.props = { spawn: { ...props.spawn, area: [...props.spawn.area] }, free: props.free }
    this.phase = getMonsterMotionHash(this.props.spawn.id, 99) * PERIOD
    const radius = getMonsterBodyRadius({ kind: MONSTER_KINDS[this.props.spawn.kind] })
    if (radius instanceof Error) throw radius
    this.radius = radius
    this.navigationFree = createMonsterNavigationFree({ area: this.props.spawn.area, radius, free: this.props.free })
    Object.freeze(this)
  }

  private rest(segment: number): [number, number] {
    const hit = this.points.get(segment)
    if (hit) return hit
    const point = getMonsterRest(this.props.spawn, segment, this.navigationFree)
    this.points.set(segment, point)
    if (this.points.size > 3) this.points.delete(this.points.keys().next().value!)
    return point
  }

  private route(segment: number): MonsterRoute {
    const cached = this.routes.get(segment)
    if (cached) return cached
    const route = getMonsterRoute({ from: this.rest(segment - 1), to: this.rest(segment), area: this.props.spawn.area, radius: this.radius, free: this.props.free })
    if (route instanceof Error) throw route
    this.routes.set(segment, route)
    if (this.routes.size > 3) this.routes.delete(this.routes.keys().next().value!)
    return route
  }

  at(time: number) {
    const t = time + this.phase
    const segment = Math.floor(t / PERIOD)
    return getMonsterRoutePosition({ route: this.route(segment), into: t - segment * PERIOD })
  }
}
