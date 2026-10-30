import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import { getTexturedMaterial as mat } from "#/lib/graphics/get-textured-material"
import { plainTex } from "#/world/scene/textures/plain-tex"
import { Kit } from "#/world/scene/construction/kit"
import type { Wood } from "#/world/scene/construction/furnishings"

export const cloth = ["cRed", "cBlue", "cMustard", "cGreen", "cPlum", "cWine", "cSky", "cHoney", "cBrown", "cGray"].map((r) => mat(plainTex({ ramp: r, light: 0.55, noise: 0.2, seed: 9, size: 16 })))

export const linen = mat(plainTex({ ramp: "cLinen", light: 0.75, noise: 0.12, seed: 5, size: 16 }))

export const leather = mat(plainTex({ ramp: "leather", light: 0.5, noise: 0.2, seed: 7, size: 16 }))

export const paper = colorMat(0xe8dcc0)

export const ink = colorMat(0x2a2a3a)

export const clay = mat(plainTex({ ramp: "redsand", light: 0.5, noise: 0.2, seed: 7, size: 16 }))

export const glaze = [colorMat(0x5a7a7a), colorMat(0x8a5a3a), colorMat(0xb8a888), colorMat(0x4a5a7a)]

export const brass = colorMat(0xb89a4a)

export const wax = colorMat(0xe8dcb8)

export const flame = colorMat(0xffc860)

export const herb = [colorMat(0x5a7a4a), colorMat(0x7a8a5a), colorMat(0x8a7a9a)]

export const onion = colorMat(0xc89a5a)

export const garlic = colorMat(0xe0d8c8)

export const willow = mat(plainTex({ ramp: "thatch", light: 0.55, noise: 0.3, seed: 11, size: 16 }))

export const slate = colorMat(0x3a3e48)

export const crystal = colorMat(0xa8d0e0)

export const bread = colorMat(0x7a5236)

export const cheese = colorMat(0xe0c070)

export const apple = colorMat(0xa83a3a)

export const fish = colorMat(0x8a9aa8)

export const meat = colorMat(0x8a4a3a)

export const hide = colorMat(0x8a6a4a)

export const glass = colorMat(0x8aa8b0)

export const steam = colorMat(0x5a5a62)

// ---------------------------------------------------------------- things on the walls

/**
 * What hangs on a wall, by name. The kit stands on the wall: u along it, v out from it (0 at the
 * wall), y up from the hook (the floor is far below; things hang down from 0).
 */
export type OnWall = (k: Kit, wd: Wood, seed: number) => void

// ---------------------------------------------------------------- what is left lying about

export type Lying = (k: Kit, seed: number, name: string) => void
