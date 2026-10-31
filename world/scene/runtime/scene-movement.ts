import { findPath } from "#/world/scene/path"
import { walkH } from "#/world/scene/walk-h"
import { isFree } from "#/world/scene/is-free"
import { cellOf } from "#/world/scene/runtime/cell-of"
import { center } from "#/world/scene/runtime/center"
import { getHeldWalkCandidates } from "#/world/scene/runtime/get-held-walk-candidates"
import type { Vector3 } from "three"
import type { Walker } from "#/world/scene/runtime/walker"
import type { PendingAction } from "#/world/scene/runtime/action-target"
import type { V2 } from "#/world/scene/construction/registry"
import type { Cell } from "#/world/scene/runtime/types"

type Props = Readonly<{
  me: Pick<Walker, "path" | "pos">
  action: Pick<PendingAction<unknown>, "clear">
  marker: { visible: boolean; position: Vector3 }
  focus: Vector3
  movement: { yaw: number }
  onWalk(path: Cell[]): void
}>

/** 一つの描画に属する移動入力と経路を扱い、停止と凍結で行動予約を同じ順で外す。 */
export class SceneMovement {
  private readonly state: { frozen: boolean; held: [number, number] | null } = { frozen: false, held: null }

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  get frozen(): boolean {
    return this.state.frozen
  }

  readonly freeze = (on: boolean): void => {
    this.state.frozen = on
    if (on) this.stop()
  }

  readonly walkTo = (target: V2, keepAction = false): boolean => {
    if (this.state.frozen) return false
    if (!keepAction) this.props.action.clear()
    const me = this.props.me
    const from = me.path.length ? me.path[0] : me.pos
    const path = findPath(from, target, true)
    if (!path) return false
    me.path = me.path.length ? [me.path[0], ...path.slice(1)] : path.slice(1)
    const end = path[path.length - 1]
    this.props.marker.position.set(end[0], walkH(end[0], end[1]) + 0.04, end[1])
    this.props.marker.visible = me.path.length > 0
    if (me.path.length) this.props.onWalk([cellOf(from), ...path.slice(1).map(cellOf)])
    return true
  }

  readonly placePlayer = (at: Cell): void => {
    const point = center(at)
    if (!isFree(point[0], point[1])) return
    this.props.action.clear()
    this.props.me.pos = point
    this.props.me.path = []
    this.props.focus.set(point[0], walkH(point[0], point[1]) + 0.6, point[1])
  }

  readonly hold = (direction: [number, number] | null): void => {
    this.state.held = direction && (direction[0] || direction[1]) ? direction : null
  }

  readonly stepHeld = (): void => {
    const me = this.props.me
    if (!this.state.held || this.state.frozen || me.path.length > 1) return
    for (const next of getHeldWalkCandidates(this.state.held, this.props.movement.yaw, me.path.length ? me.path[0] : me.pos)) {
      if (!isFree(next[0], next[1])) continue
      this.walkTo(next)
      return
    }
  }

  readonly stop = (): void => {
    this.props.action.clear()
    const me = this.props.me
    if (me.path.length > 1) {
      me.path = [me.path[0]]
      this.props.onWalk([cellOf(me.path[0])])
    }
    this.props.marker.visible = false
  }
}
