import * as THREE from "three"
import { litSprites } from "../gfx"

export type V2 = [number, number]

// ---------------------------------------------------------------- shared registries
export const glowMats: THREE.MeshLambertMaterial[] = []

export const fireLights: { light: THREE.PointLight; base: number; seed: number }[] = []

/** Window glows, by the house they belong to: lit by that household's hours (town/schedule.ts). */
export const houseGlows: { house: string; mat: THREE.MeshLambertMaterial }[] = []

/** Street lamps, lit one after another at dusk. */
export const lamps: { light: THREE.PointLight; glow: THREE.MeshLambertMaterial; x: number; z: number }[] = []

/** Stalls by their seller's spot: the wares are put out while the seller is there, under a cloth otherwise. */
export const stalls: Record<string, { wares: THREE.Object3D; cover: THREE.Object3D; group?: THREE.Object3D; vanish?: boolean }> = {}

export const updaters: ((t: number, dt: number) => void)[] = []

export const chimneys: THREE.Vector3[] = []

export const places: Record<string, V2> = {}

export const occluders: { obj: THREE.Object3D; box: THREE.Box3; fade: number; min: number; opaque: boolean }[] = []

/** Empty the registries before building another map (only one map exists at a time). */
export function resetRegistries() {
  glowMats.length = 0
  fireLights.length = 0
  updaters.length = 0
  chimneys.length = 0
  occluders.length = 0
  houseGlows.length = 0
  lamps.length = 0
  litSprites.length = 0
  for (const k of Object.keys(stalls)) delete stalls[k]
  for (const k of Object.keys(places)) delete places[k]
}

/**
 * Something that may stand between the camera and the player. Trees and the buildings you can go
 * into fade; a house you cannot enter stays solid (nothing inside is shown) and the player is drawn
 * through it as a silhouette instead (`opaque`).
 */
export function occluder(obj: THREE.Object3D, min = 0.22, opaque = false) {
  // one copy per material, shared by every mesh of this object that had it: the fade is per
  // object, and meshes that share a material can be merged into one draw (lib/graphics/batch.ts)
  const copies = new Map<THREE.Material, THREE.MeshLambertMaterial>()
  obj.traverse((o) => {
    const m = o as THREE.Mesh
    if (!m.isMesh) return
    const was = m.material as THREE.MeshLambertMaterial
    let copy = copies.get(was)
    if (!copy) {
      copies.set(was, (copy = was.clone()))
      // a glowing window is lit through its copy from now on
      for (const g of houseGlows) if (g.mat === was) g.mat = copy
      const k = glowMats.indexOf(was)
      if (k >= 0) glowMats[k] = copy
    }
    m.material = copy
  })
  occluders.push({ obj, box: new THREE.Box3().setFromObject(obj), fade: 1, min, opaque })
}
