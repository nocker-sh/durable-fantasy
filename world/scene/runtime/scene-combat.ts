import { approachMonster } from "#/world/scene/approach-monster"
import { MELEE_REACH } from "#/world/core/monsters"
import { cellOf } from "#/world/scene/runtime/cell-of"
import type { PendingAction } from "#/world/scene/runtime/action-target"
import type { SceneMovement } from "#/world/scene/runtime/scene-movement"
import type { Walker } from "#/world/scene/runtime/walker"
import type { V2 } from "#/world/scene/construction/registry"
import type { Cell } from "#/world/scene/runtime/types"

type Target = { pos: V2; body: { visible: boolean }; spawn: { id: string } }
type Props = Readonly<{
  monsters: readonly Target[]
  me: Pick<Walker, "pos" | "path" | "head"> & { fig: Pick<Walker["fig"], "face"> }
  action: Pick<PendingAction<unknown>, "clear" | "select" | "endFight" | "fighting">
  movement: Pick<SceneMovement, "frozen" | "walkTo">
  onWalk(path: Cell[]): void
  playSwing(until: number): void
  onSwing(id: string): void
}>

/** 描画ごとの追跡と攻撃通知を扱う。命中と報酬はサーバーが決める。 */
export class SceneCombat {
  private readonly state = { attackDelay: 1500, lastSwing: 0, lastRepath: 0 }

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly fight = (id: string): void => {
    if (this.props.movement.frozen) return
    this.props.action.clear()
    this.props.action.select({ kind: "fight", id })
    this.state.lastRepath = 0
  }

  readonly setAttackDelay = (ms: number): void => {
    this.state.attackDelay = ms
  }

  readonly update = (wall: number): void => {
    const target = this.props.action.fighting ? this.props.monsters.find((m) => m.spawn.id === this.props.action.fighting) : undefined
    if (!target) return
    if (!target.body.visible) return this.props.action.endFight()
    const me = this.props.me
    if (Math.hypot(target.pos[0] - me.pos[0], target.pos[1] - me.pos[1]) > MELEE_REACH) this.pursue(target, wall)
    else this.strike(target, wall)
  }

  private pursue(target: Target, wall: number): void {
    if (!(wall - this.state.lastRepath > 600)) return
    this.state.lastRepath = wall
    approachMonster({ m: target, from: this.props.me.pos, reach: MELEE_REACH, tryWalk: (point) => this.props.movement.walkTo(point, true) })
  }

  private strike(target: Target, wall: number): void {
    const me = this.props.me
    if (me.path.length > 1) {
      me.path = [me.path[0]]
      this.props.onWalk([cellOf(me.path[0])])
    }
    me.head = Math.atan2(target.pos[0] - me.pos[0], target.pos[1] - me.pos[1])
    me.fig.face(me.head)
    if (!(wall - this.state.lastSwing >= this.state.attackDelay)) return
    this.state.lastSwing = wall
    this.props.playSwing(performance.now() + 600)
    this.props.onSwing(target.spawn.id)
  }
}
