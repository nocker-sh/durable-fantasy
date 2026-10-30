import * as THREE from "three"

export type V2 = [number, number]

export const glowMats: THREE.MeshLambertMaterial[] = []

export const fireLights: { light: THREE.PointLight; base: number; seed: number; room?: { house: string; floor: number }; glow?: THREE.MeshLambertMaterial }[] = []

export const houseGlows: { house: string; floor?: number; mat: THREE.MeshLambertMaterial }[] = []

export const houseShutters: { house: string; mat: THREE.MeshLambertMaterial; open: THREE.Texture; shut: THREE.Texture }[] = []

export const lamps: { light: THREE.PointLight; glow: THREE.MeshLambertMaterial; x: number; z: number }[] = []

export const stalls: Record<string, { wares: THREE.Object3D; cover: THREE.Object3D; group?: THREE.Object3D; vanish?: boolean }> = {}

export const updaters: ((t: number, dt: number) => void)[] = []

export const movingObjects = new Set<THREE.Object3D>()

export const chimneys: THREE.Vector3[] = []

export const places: Record<string, V2> = {}

export const occluders: { obj: THREE.Object3D; box: THREE.Box3; fade: number; min: number; opaque: boolean }[] = []
