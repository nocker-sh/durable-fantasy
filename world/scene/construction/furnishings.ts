import type * as THREE from "three"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { plainTex } from "#/world/scene/textures/plain-tex"
import { Kit } from "#/world/scene/construction/kit"

export const WOOD_IDS = ["pine", "oak", "birch", "walnut", "blackOak", "paintBlue", "paintRed", "paintGreen"] as const

export type WoodId = (typeof WOOD_IDS)[number]

export const WOOD_NAME: Record<WoodId, string> = {
  pine: "松",
  oak: "樫",
  birch: "白樺",
  walnut: "胡桃",
  blackOak: "黒樫",
  paintBlue: "青塗り",
  paintRed: "赤塗り",
  paintGreen: "緑塗り",
}

export type Wood = {
  id: WoodId
  /** the planks of its sides */
  body: THREE.Material
  /** legs, frames and edges */
  dark: THREE.Material
  /** what is sat at or set down on */
  top: THREE.Material
  /** a painted piece's flowers and borders; plain wood has none */
  trim: THREE.Material | null
}

export const woods = new Map<WoodId, Wood>()

export const cloth = ["cRed", "cBlue", "cMustard", "cGreen", "cPlum", "cWine", "cSky", "cHoney"].map((r) => mat(plainTex({ ramp: r, light: 0.55, noise: 0.2, seed: 9, size: 16 })))

export const linen = mat(plainTex({ ramp: "cLinen", light: 0.75, noise: 0.12, seed: 5, size: 16 }))

export const paper = colorMat(0xe8dcc0)

export const glass = colorMat(0x8aa8b0)

export const clay = mat(plainTex({ ramp: "redsand", light: 0.5, noise: 0.2, seed: 7, size: 16 }))

export const glaze = [colorMat(0x5a7a7a), colorMat(0x8a5a3a), colorMat(0xb8a888), colorMat(0x4a5a7a)]

export const books = [0x6a2a2a, 0x2a3a5a, 0x3a4a2a, 0x6a5a3a, 0x4a2a4a, 0x7a6a5a].map(colorMat)

export const brass = colorMat(0xb89a4a)

export const wax = colorMat(0xe8dcb8)

export const ash = colorMat(0x8a8684)

export const willow = mat(plainTex({ ramp: "thatch", light: 0.55, noise: 0.3, seed: 11, size: 16 }))

// ---------------------------------------------------------------- where a piece stands

/** A piece's footprint (tiles or m, whichever the caller draws in) and the way its front faces: 0 +z, 1 +x, 2 -z, 3 -x. */
export type Spot = {
  x: number
  z: number
  /** size along x and z */
  w: number
  d: number
  /** the floor under it */
  y: number
  face: 0 | 1 | 2 | 3
}

export type Builder = (k: Kit, wd: Wood, seed: number) => void

/** What a shop keeps on its open shelves (interior.ts picks it by the shop). */
export type Stock = "bread" | "jars" | "sundries" | "bottles" | "stores"

export const crust = [colorMat(0xb87a3a), colorMat(0x9a5e2a), colorMat(0xd0a060)]
