import type { V2 } from "#/world/scene/construction/registry"
import type { SceneLabelProjection } from "#/world/scene/runtime/scene-label-projection"
import type { HitKind } from "#/world/scene/runtime/combat-feedback-types"

type Props = Readonly<{
  plate(className: string, text: string): HTMLElement
  place: SceneLabelProjection["place"]
}>
type HitLabel = Readonly<{ kind: HitKind | "taken"; text: string; pos: V2; height: number }>

/** 命中表示の期限を所有し、マップを離れると残る要素とタイマーを一緒に外す。 */
export class SceneHitLabels {
  private readonly labels = new Map<HTMLElement, ReturnType<typeof setTimeout>>()
  private readonly state = { closed: false }

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly show = (input: HitLabel): void => {
    if (this.state.closed) return
    const element = this.props.plate(`gx-hit gx-hit--${input.kind}`, input.text)
    try {
      this.props.place({ element, pos: input.pos, height: input.height })
    } catch (error) {
      element.remove()
      throw error
    }
    const timer = setTimeout(() => {
      element.remove()
      this.labels.delete(element)
    }, 900)
    this.labels.set(element, timer)
  }

  dispose(): void {
    if (this.state.closed) return
    this.state.closed = true
    for (const entry of this.labels) {
      clearTimeout(entry[1])
      entry[0].remove()
    }
    this.labels.clear()
  }
}
