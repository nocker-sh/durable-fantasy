import { Matrix4, Vector3 } from "three"
import { view } from "#/world/scene/actors"
import { critters } from "#/world/scene/critters"
import { updaters } from "#/world/scene/construction/registry"
import { tickSprites } from "#/world/scene/tick-sprites"
import type { Camera } from "three"
import type { Actor } from "#/world/scene/actor"
import type { SceneFrame } from "#/world/scene/runtime/scene-frame-types"

type Props = Readonly<{
  camera: Camera
  movement: { readonly yaw: number }
  people: ReadonlyArray<Pick<Actor, "update">>
  animate(dt: number, time: number): void
}>

/** 追従前の視点を人物の描画へ渡し、住民・動物・建物・灯りの順に動かす。 */
export class SceneWorldAnimation {
  private readonly direction = new Vector3()
  private readonly right = new Vector3()
  private readonly projection = new Matrix4()

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly update = (frame: SceneFrame): void => {
    tickSprites()
    view.yaw = this.props.movement.yaw
    view.cam.copy(this.props.camera.position)
    view.frustum.setFromProjectionMatrix(this.projection.multiplyMatrices(this.props.camera.projectionMatrix, this.props.camera.matrixWorldInverse))
    this.props.people.forEach((person) => person.update(frame.dt, frame.time, () => {}))
    this.props.camera.getWorldDirection(this.direction)
    this.right.set(-this.direction.z, 0, this.direction.x).normalize()
    critters.forEach((critter) => critter.update(frame.dt, this.right))
    updaters.forEach((update) => update(frame.time, frame.dt))
    this.props.animate(frame.dt, frame.time)
  }
}
