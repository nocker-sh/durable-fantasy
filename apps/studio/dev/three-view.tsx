import * as THREE from "three"

/** Builds the thing at (x, z) into the group. */
export type Build = (root: THREE.Group, x: number, z: number) => void

export const AT = 24
