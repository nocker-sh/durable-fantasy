import { Vector3 } from "three"
import { ScreenLabels } from "#/lib/graphics/screen-labels"
import { walkH } from "#/world/scene/walk-h"
import type { Camera } from "three"
import type { V2 } from "#/world/scene/construction/registry"

type Props = Readonly<{
  camera: Camera
  viewport: { readonly width: number; readonly height: number }
}>
type Placement = Readonly<{
  element: HTMLElement
  pos: V2
  height: number
  ground?: number
  offset?: number
  visible?: boolean
}>

/** 頭上の文字と一時表示を同じ投影・画素丸め・画面外判定で配置する。 */
export class SceneLabelProjection {
  private readonly point = new Vector3()
  private readonly labels = new ScreenLabels()

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly place = (input: Placement): void => {
    if (input.visible === false) return this.labels.place({ element: input.element, visible: false })
    const ground = input.ground === undefined ? walkH(input.pos[0], input.pos[1]) : input.ground
    const p = this.point.set(input.pos[0], ground + input.height, input.pos[1]).project(this.props.camera)
    const visible = p.z < 1 && Math.abs(p.x) < 1.1 && Math.abs(p.y) < 1.1
    this.labels.place({
      element: input.element,
      visible,
      x: Math.round(((p.x + 1) / 2) * this.props.viewport.width),
      y: Math.round(((1 - p.y) / 2) * this.props.viewport.height) - (input.offset === undefined ? 0 : input.offset),
    })
  }
}
