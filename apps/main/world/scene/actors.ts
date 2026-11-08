import * as THREE from "three"
import type { V2 } from "#/world/scene/construction/registry"

import type { Item } from "#/world/scene/figure/look"
import type { Anim } from "#/world/scene/figure/animation"

export const view = { yaw: 0, tint: new THREE.Color(1, 1, 1), cam: new THREE.Vector3(), frustum: new THREE.Frustum() }

export /** One anim/item/view as a strip of frames that fills in as they arrive. */
type Strip = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  tex: THREE.Texture
  ready: Uint8Array
  requested: Uint8Array
  count: number
  disposed?: boolean
  baked?: "loading" | "failed"
}

/** Strips baked ahead of time for a figure whose look never changes: anim and view → file URL. */
export type BakedStrips = { item: Item; url: (anim: Anim, view: number) => string | null }

// ---------------------------------------------------------------- behaviours
export type Step = { go: string | V2; run?: boolean } | { do: Anim; t: number; face?: string | V2; item?: Item; say?: string[] } | { wander: [number, number, number, number]; n: number; anim?: Anim }
