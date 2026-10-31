import type { Walker } from "#/world/scene/runtime/walker"
import type { Figure } from "#/world/scene/figure/figure"
import type { Anim } from "#/world/scene/figure/animation"
import type { WalkerAction } from "#/world/scene/runtime/walker-motion-types"
import type { V2 } from "#/world/scene/construction/registry"

type Props = Readonly<{
  walkers: { readonly me: Pick<Walker, "head" | "pos"> & { fig: Pick<Figure, "face"> }; action: WalkerAction | null }
  freeze(on: boolean): void
  endFight(): void
}>

/** 行動不能は移動と戦闘を止め、座る状態と一時動作を同じ人物の姿勢へ渡す。 */
export class ScenePosture {
  private readonly state = { down: false, sitting: false }

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly playAction = (anim: Anim, cell: readonly [number, number]): void => {
    const me = this.props.walkers.me
    const at: V2 = [(cell[0] + 0.5) / 2, (cell[1] + 0.5) / 2]
    me.head = Math.atan2(at[0] - me.pos[0], at[1] - me.pos[1])
    me.fig.face(me.head)
    this.props.walkers.action = { anim, until: performance.now() + 1400 }
  }

  readonly setDown = (on: boolean): void => {
    if (on === this.state.down) return
    this.state.down = on
    this.props.freeze(on)
    if (on) {
      this.props.endFight()
      this.props.walkers.action = { anim: "sit", until: Infinity }
      return
    }
    this.props.walkers.action = null
  }

  readonly setSitting = (on: boolean): void => {
    if (on === this.state.sitting || this.state.down) return
    this.state.sitting = on
    this.props.walkers.action = on ? { anim: "sit", until: Infinity } : null
  }
}
