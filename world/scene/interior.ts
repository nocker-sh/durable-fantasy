import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import type { V2 } from "#/world/scene/construction/registry"
import { INTERIORS } from "#/world/town/interiors"

export const WALL_H = 2.3

export const COUNTER_H = 0.6

export const rugMat = colorMat(0x7a2e2e)

export const rugEdge = colorMat(0xc89a4a)

export /**
 * Walls facing the camera are cut down to their skirting, as in a doll's house, so the room is
 * always seen into; which ones changes as the camera turns.
 */
type Cutaway = { floor?: number; obj: THREE.Object3D; at: V2; normal: V2; details?: THREE.Object3D[] }

export const cutaways: Cutaway[] = []

export const WALL_SCALE = 1.45

export const INDOOR_WORLDS = INTERIORS.map((it) => ({ id: it.id, it }))
