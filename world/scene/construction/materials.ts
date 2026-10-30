import * as THREE from "three"
import { getTexturedMaterial as mat } from "../../../lib/graphics/get-textured-material"
import { toTexture as toTex } from "../../../lib/graphics/to-texture"
import { createColorMaterial as colorMat } from "../../../lib/graphics/create-color-material"
import { PixelBuffer as PixBuf } from "../../../lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { hash2 } from "../../../lib/engine/hash2"
import { stoneTex } from "#/world/scene/textures/stone-tex"
import { rockTex } from "#/world/scene/textures/rock-tex"
import { woodTex } from "#/world/scene/textures/wood-tex"
import { roofTex } from "#/world/scene/textures/roof-tex"
import { thatchTex } from "#/world/scene/textures/thatch-tex"
import { leafTex } from "#/world/scene/textures/leaves"
import { plainTex } from "#/world/scene/textures/plain-tex"

// ---------------------------------------------------------------- materials
const M = {
  stone: mat(stoneTex({ ramp: "stone", light: 0.55, seed: 1 })),
  stoneDark: mat(stoneTex({ ramp: "stone", light: 0.38, seed: 2 })),
  rock: mat(rockTex({ ramp: "stone", light: 0.55, seed: 3 })),
  rockDark: mat(rockTex({ ramp: "stone", light: 0.38, seed: 4 })),
  ashlar: mat(stoneTex({ ramp: "sand", light: 0.62, seed: 3, bw: 26, bh: 12 })),
  wood: mat(woodTex({ light: 0.55, plank: 9, seed: 2 })),
  woodV: mat(woodTex({ light: 0.5, plank: 9, seed: 5, size: 64, vertical: true })),
  woodDark: mat(woodTex({ light: 0.32, plank: 9, seed: 6 })),
  roof: mat(roofTex({ ramp: "roof", light: 0.6, seed: 3 }), { side: THREE.DoubleSide }),
  roof2: mat(roofTex({ ramp: "roof2", light: 0.6, seed: 4 }), { side: THREE.DoubleSide }),
  slate: mat(roofTex({ ramp: "slate", light: 0.58, seed: 5 }), { side: THREE.DoubleSide }),
  thatch: mat(thatchTex(4), { side: THREE.DoubleSide }),
  leaf: mat(leafTex("leaf", 5)),
  leaf2: mat(leafTex("leaf2", 6)),
  autumn: mat(leafTex("autumn", 7)),
  iron: mat(plainTex({ ramp: "iron", light: 0.45, noise: 0.2, seed: 3 })),
  plaster: mat(plainTex({ ramp: "plaster", light: 0.7, noise: 0.12, seed: 4 })),
  hay: mat(thatchTex(9), {}),
  linen: mat(plainTex({ ramp: "cLinen", light: 0.7, noise: 0.15, seed: 5 }), { side: THREE.DoubleSide }),
  sack: mat(plainTex({ ramp: "sand", light: 0.62, noise: 0.25, seed: 8 })),
  ceramic: mat(plainTex({ ramp: "redsand", light: 0.55, noise: 0.1, seed: 13 })),
  water: new THREE.MeshLambertMaterial({ color: 0x2c4a66 }),
  dark: colorMat(0x1a141c),
  rope: colorMat(0x8a7a5a),
  wool: mat(plainTex({ ramp: "wool", light: 0.7, noise: 0.35, seed: 11 })),
  pig: mat(plainTex({ ramp: "pig", light: 0.6, noise: 0.12, seed: 12 })),
}

const coalBuf = new PixBuf(16, 16)

coalBuf.fill((x, y) => pick({ ramp: "fire", b: 0.3 + hash2(x, y, 3) * 0.7, x: x, y: y }))

const coalMat = new THREE.MeshBasicMaterial({ map: toTex(coalBuf) })

export { M, coalMat }
