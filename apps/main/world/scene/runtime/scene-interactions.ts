import { REACH } from "#/world/core/gather-rules"
import { isFree } from "#/world/scene/is-free"
import { getApproachCandidates } from "#/world/scene/runtime/get-approach-candidates"
import type { PendingAction } from "#/world/scene/runtime/action-target"
import type { SceneMovement } from "#/world/scene/runtime/scene-movement"
import type { Walker } from "#/world/scene/runtime/walker"
import type { V2 } from "#/world/scene/construction/registry"

type Resident = { pos: V2 }
type Props<T extends Resident> = Readonly<{
  me: Pick<Walker, "pos" | "path">
  action: PendingAction<T>
  movement: Pick<SceneMovement, "frozen" | "walkTo">
  spots: ReadonlyMap<string, { at: V2 }>
  personOf(id: number): T | undefined
  reach(resident: T): void
  marker: { visible: boolean }
  stationAt(id: string): void
  gatherAt(id: string): void
}>

/** 到着前の予約と通知を扱い、新しい行動が通知中に選ばれても前の到着で消費しない。 */
export class SceneInteractions<T extends Resident> {
  constructor(private readonly props: Props<T>) {
    Object.freeze(this)
  }

  readonly arrive = (): void => {
    this.props.marker.visible = false
    const arrived = this.props.action.arrive()
    if (arrived?.kind === "talk") this.props.reach(arrived.resident)
    else if (arrived?.kind === "spot") this.arriveSpot(arrived.id)
  }

  private readonly arriveSpot = (id: string): void => {
    if (id.startsWith("station:")) this.props.stationAt(id.slice(8))
    else this.props.gatherAt(id)
  }

  readonly approachSpot = (id: string): void => {
    const spot = this.props.spots.get(id)
    if (!spot || this.props.movement.frozen) return
    this.props.action.clear()
    if (Math.hypot(this.props.me.pos[0] - spot.at[0], this.props.me.pos[1] - spot.at[1]) <= (REACH - 0.6) / 2) {
      this.arriveSpot(id)
      return
    }
    for (const point of getApproachCandidates({ from: this.props.me.pos, at: spot.at, radii: [0.8, 1.1] })) {
      if (!isFree(point[0], point[1]) || !this.props.movement.walkTo(point)) continue
      this.props.action.select({ kind: "spot", id })
      if (!this.props.me.path.length) {
        this.props.action.clear()
        this.arriveSpot(id)
      }
      return
    }
  }

  readonly approach = (id: number): void => {
    if (this.props.movement.frozen) return
    const resident = this.props.personOf(id)
    if (!resident) return
    this.props.action.clear()
    this.props.action.select({ kind: "talk", resident })
    if (Math.hypot(this.props.me.pos[0] - resident.pos[0], this.props.me.pos[1] - resident.pos[1]) < 1.6) {
      this.reachResident(resident)
      return
    }
    for (const point of getApproachCandidates({ from: this.props.me.pos, at: resident.pos, radii: [0.9, 1.3, 1.8, 2.4], normalize: true })) {
      if (!isFree(point[0], point[1]) || !this.props.movement.walkTo(point, true)) continue
      if (!this.props.me.path.length) this.reachResident(resident)
      return
    }
    this.reachResident(resident)
  }

  private readonly reachResident = (resident: T): void => {
    this.props.action.arrive()
    this.props.reach(resident)
  }
}
