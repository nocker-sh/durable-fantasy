import { updateSceneWalkers } from "#/world/scene/runtime/update-scene-walkers"
import { updateSceneFog } from "#/world/scene/runtime/update-scene-fog"
import { updateCutaways } from "#/world/scene/update-cutaways"
import { updateMonsters } from "#/world/scene/update-monsters"
import { updateMonsterLabels } from "#/world/scene/runtime/update-monster-labels"
import { daylight } from "#/world/core/daylight"
import type { Group, Scene } from "three"
import type { PixelCamera } from "#/lib/graphics/pixel-camera"
import type { BillboardBatch } from "#/lib/graphics/billboards"
import type { Layout } from "#/world/maps/layout-types"
import type { MonsterView } from "#/world/scene/monsters"
import type { Ashfall } from "#/world/scene/ashfall"
import type { MotionWalker } from "#/world/scene/runtime/walker-motion-types"
import type { WalkerMotion } from "#/world/scene/runtime/walker-motion"
import type { SceneFrame } from "#/world/scene/runtime/scene-frame-types"
import type { SceneLabelProjection } from "#/world/scene/runtime/scene-label-projection"
import type { SceneShadowUpdates } from "#/world/scene/runtime/scene-shadow-updates"
import type { SceneWorldAnimation } from "#/world/scene/runtime/scene-world-animation"
import type { SceneCameraFollow } from "#/world/scene/runtime/scene-camera-follow"
import type { SceneOcclusion } from "#/world/scene/runtime/scene-occlusion"
import type { SceneOutlines } from "#/world/scene/runtime/scene-outlines"
import type { SceneCombat } from "#/world/scene/runtime/scene-combat"
import type { PendingAction } from "#/world/scene/runtime/action-target"
import type { WarpMarkers } from "#/world/scene/runtime/warps"

type FrameWalker = MotionWalker & { label: HTMLElement; fig: { height: number; root: { position: { y: number } } } }
type Props<P> = Readonly<{
  world: { readonly indoor?: boolean; layout: Pick<Layout, "fog"> }
  scene: Scene
  town: Group
  camera: Pick<PixelCamera, "camera" | "distance" | "focus">
  walkers: { me: FrameWalker; remotes: ReadonlyMap<string, FrameWalker>; movement: { readonly yaw: number }; stepWalker: WalkerMotion["step"]; placeWalker: WalkerMotion["place"] }
  preview: boolean
  stepHeld(): void
  arrive(): void
  marker: Pick<Group, "scale">
  warps: Pick<WarpMarkers, "update">
  animation: Pick<SceneWorldAnimation, "update">
  cameraFollow: Pick<SceneCameraFollow, "update">
  shadows: Pick<SceneShadowUpdates, "update">
  occlusion: Pick<SceneOcclusion, "update">
  pointer: { update(): void; readonly hovered: P | null }
  outlines: Pick<SceneOutlines, "update">
  smoke: Pick<BillboardBatch, "prepare">
  draw(): void
  projection: Pick<SceneLabelProjection, "place">
  monsters: ReadonlyArray<MonsterView>
  action: Pick<PendingAction<unknown>, "fighting">
  combat: Pick<SceneCombat, "update">
  residentNames: { update(hovered: P | null): void }
  speech: { update(now: number): void }
  ashfall: Pick<Ashfall, "update"> | null
  lighting: { readonly minutes: number }
  record(now: number): void
}>

/** 世界と視点を描画前に進め、名前と戦闘・発言・灰の更新と計測を描画後へ保つ。 */
export class SceneFrameRenderer<P> {
  constructor(private readonly props: Props<P>) {
    Object.freeze(this)
  }

  readonly render = (frame: SceneFrame): void => {
    const walkers = this.props.walkers
    this.props.shadows.update(frame.at)
    updateSceneWalkers({
      me: walkers.me,
      remotes: walkers.remotes,
      preview: this.props.preview,
      frame,
      step: walkers.stepWalker,
      place: walkers.placeWalker,
      stepHeld: this.props.stepHeld,
      arrive: this.props.arrive,
    })
    this.props.marker.scale.setScalar(1 + Math.sin(frame.time * 6) * 0.1)
    this.props.warps.update(frame.time)
    this.props.animation.update(frame)
    this.props.cameraFollow.update(frame.dt)
    this.drawWorld(frame.dt)
    this.updateOverlays(frame)
  }

  private drawWorld(dt: number): void {
    const camera = this.props.camera
    if (this.props.world.indoor) updateCutaways(camera.camera.position)
    updateSceneFog({ scene: this.props.scene, distance: camera.distance, definition: this.props.world.layout.fog })
    const hidden = this.props.occlusion.update(dt)
    this.props.pointer.update()
    this.props.outlines.update(hidden)
    this.props.smoke.prepare(camera.camera)
    this.props.draw()
  }

  private updateOverlays(frame: SceneFrame): void {
    this.placePlayerNames()
    const wall = Date.now()
    updateMonsters({ list: this.props.monsters, root: this.props.town, now: wall, yaw: this.props.walkers.movement.yaw, dt: frame.dt })
    updateMonsterLabels({ monsters: this.props.monsters, me: this.props.walkers.me, action: this.props.action, place: this.props.projection.place })
    this.props.combat.update(wall)
    this.props.residentNames.update(this.props.pointer.hovered)
    const now = performance.now()
    this.props.speech.update(now)
    this.props.ashfall?.update({ dt: frame.dt, t: frame.time, focus: this.props.camera.focus, night: 1 - daylight(this.props.lighting.minutes) })
    this.props.record(now)
  }

  private placePlayerNames(): void {
    for (const walker of [this.props.walkers.me, ...this.props.walkers.remotes.values()]) {
      this.props.projection.place({ element: walker.label, pos: walker.pos, height: walker.fig.height, ground: walker.fig.root.position.y, offset: 2 })
    }
  }
}
