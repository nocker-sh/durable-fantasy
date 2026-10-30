import * as THREE from "three"

export const trunkGeo = new THREE.CylinderGeometry(0.08, 0.13, 1, 6).translate(0, 0.5, 0)

export const rockGeo = new THREE.DodecahedronGeometry(0.5, 0)

export const stemGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.1, 5).translate(0, 0.05, 0)
