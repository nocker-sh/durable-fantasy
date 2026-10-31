import { PositionSample } from "#/lib/engine/position-sample"
import { PathFollower } from "#/lib/engine/path-follower"
import { blendHeading } from "#/lib/engine/blend-heading"
import { ANIM_DUR } from "#/world/scene/figure/animation"
import type { MotionWalker, WalkerAction } from "#/world/scene/runtime/walker-motion-types"

type Props = Readonly<{ me: MotionWalker; speed: number; heightAt(x: number, z: number): number }>

/** 経路の実時間と姿勢の補間時間を区別し、歩行者ごとに地面の高さを再利用する。 */
export class WalkerMotion {
  private readonly ground = new WeakMap<MotionWalker, PositionSample>()
  private readonly state: { action: WalkerAction | null } = { action: null }
  private readonly follower: PathFollower

  constructor(private readonly props: Props) {
    this.follower = new PathFollower({ speed: props.speed })
    Object.freeze(this)
  }

  get action(): WalkerAction | null {
    return this.state.action
  }

  set action(value: WalkerAction | null) {
    this.state.action = value
  }

  readonly step = (walker: MotionWalker, dt: number, elapsed = dt): boolean => {
    if (!walker.path.length) {
      this.idle(walker, dt)
      return false
    }
    const heading = this.follower.advance(walker, elapsed)
    if (heading !== null) walker.head = blendHeading(walker.head, heading, Math.min(1, dt * 14))
    walker.t += dt * 13
    walker.fig.pose("walk", walker.t)
    return true
  }

  readonly place = (walker: MotionWalker): void => {
    const known = this.ground.get(walker)
    const height = known ?? new PositionSample(this.props.heightAt)
    if (!known) this.ground.set(walker, height)
    walker.fig.root.position.set(walker.pos[0], height.at(walker.pos[0], walker.pos[1]), walker.pos[1])
    walker.fig.face(walker.head)
    walker.fig.refresh()
  }

  private idle(walker: MotionWalker, dt: number): void {
    const action = walker === this.props.me && this.state.action && performance.now() < this.state.action.until ? this.state.action : null
    const anim = action ? action.anim : "idle"
    walker.t += (dt * Math.PI * 2) / ANIM_DUR[anim]
    walker.fig.pose(anim, walker.t)
  }
}
