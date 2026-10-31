import { Vector3 } from "three"
import { OcclusionQuery } from "#/lib/graphics/occlusion-query"
import { setObjectOpacity } from "#/lib/graphics/set-object-opacity"
import type { Box3, Object3D } from "three"
import type { V2 } from "#/world/scene/construction/registry"

type Occluder = { obj: Object3D; box: Box3; fade: number; min: number; opaque: boolean }
type Props = Readonly<{
  occluders: readonly Occluder[]
  camera: { position: Vector3 }
  me: { pos: V2; fig: { root: { position: { y: number } } } }
  preview: boolean
}>

/** 遮蔽物の透過と、透過しない建物の背後にいる人物の判定を分ける。 */
export class SceneOcclusion {
  private readonly head = new Vector3()
  private readonly query: OcclusionQuery

  constructor(private readonly props: Props) {
    this.query = new OcclusionQuery(
      props.occluders.map((entry) => entry.box),
      0.3,
    )
    Object.freeze(this)
  }

  readonly update = (dt: number): boolean => {
    const me = this.props.me
    this.head.set(me.pos[0], me.fig.root.position.y + 0.9, me.pos[1])
    const hits = this.query.update(this.props.camera.position, this.head)
    if (this.props.preview) return false
    this.props.occluders.forEach((entry, index) => {
      if (!entry.opaque) this.fade(entry, !!hits[index], dt)
    })
    return this.props.occluders.some((entry, index) => entry.opaque && !!hits[index])
  }

  private fade(entry: Occluder, hit: boolean, dt: number): void {
    const target = hit ? entry.min : 1
    if (entry.fade === target) return
    entry.fade += (target - entry.fade) * Math.min(1, dt * 8)
    if (Math.abs(entry.fade - target) < 0.01) entry.fade = target
    setObjectOpacity(entry.obj, entry.fade)
    entry.obj.visible = entry.fade > 0.03
  }
}
