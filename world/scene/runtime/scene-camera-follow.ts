import { Vector3 } from "three"
import type { PixelCamera } from "#/lib/graphics/pixel-camera"
import type { Walker } from "#/world/scene/runtime/walker"
import type { createPreviewControls } from "#/world/scene/runtime/preview"

type Props = Readonly<{
  camera: Pick<PixelCamera, "focus" | "height" | "look" | "update">
  me: Pick<Walker, "pos"> & { fig: { root: { position: { y: number } } } }
  movement: { yaw: number; yawTarget: number }
  preview: Pick<ReturnType<typeof createPreviewControls>, "update"> | null
  heightAt(x: number, z: number): number
}>

/** 通常は人物を追い、プレビューでは入力で動かした注視点を地形の高さへ合わせる。 */
export class SceneCameraFollow {
  private readonly position = new Vector3()

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly update = (dt: number): void => {
    const camera = this.props.camera
    const movement = this.props.movement
    const preview = this.props.preview

    if (preview) {
      movement.yaw = movement.yawTarget
      preview.update(dt, camera.height)
      camera.focus.y = this.props.heightAt(camera.focus.x, camera.focus.z) + 0.6
      camera.look(camera.focus, movement.yaw)
      return
    }
    const me = this.props.me
    camera.update({ meAt: this.position.set(me.pos[0], me.fig.root.position.y + 0.6, me.pos[1]), yaw: movement.yawTarget, turned: movement.yaw !== movement.yawTarget, dt })
    movement.yaw = movement.yawTarget
  }
}
