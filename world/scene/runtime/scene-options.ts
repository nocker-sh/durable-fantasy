import type { V2 } from "#/world/scene/construction/registry"

/** A map preview does not join a player; normal scenes keep their existing camera and lifecycle. */
export type SceneOptions = {
  preview?: boolean
  at?: V2
  zoom?: number
  turn?: number
}
