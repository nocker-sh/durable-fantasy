import type { Walker } from "#/world/scene/runtime/walker"
import type { Anim } from "#/world/scene/figure/animation"

export type WalkerAction = Readonly<{ anim: Anim; until: number }>
export type MotionWalker = Pick<Walker, "pos" | "path" | "head" | "t"> & {
  fig: {
    pose(anim: Anim, progress: number): void
    face(heading: number): void
    refresh(): void
    root: { position: { set(x: number, y: number, z: number): unknown } }
  }
}
