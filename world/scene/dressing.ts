import * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"

import type { V2 } from "#/world/scene/construction/registry"

export type Side = "n" | "s" | "e" | "w"

export const OUT: Record<Side, V2> = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }

export const stepMat = colorMat(0x8a8478),
  stepDark = colorMat(0x6e6a62)

export const shopBoards: { shop: string; open: THREE.Object3D; shut: THREE.Object3D; wares?: THREE.Object3D }[] = []

export const placed: string[] = []
