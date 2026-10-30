import * as THREE from "three"
import { M } from "./materials"
import type { Furniture } from "#/world/town/interiors"

type ContainerKind = "wax-pot" | "lye-tub" | "ash-sack" | "tinker-toolbox"

/** Closed, cool storage states: a static prop never implies an active heat source. */
export function workshopContainer(f: Furniture, floorY: number, kind: ContainerKind): THREE.Group {
  const root = new THREE.Group()
  root.name = kind
  root.position.set(f.x, floorY, f.z)
  const unit = Math.min(f.w, f.d)
  const add = (inputProps: { name: string; geometry: THREE.BufferGeometry; material: THREE.Material; x?: number; y?: number; z?: number }) => {
    const name = inputProps.name
    const geometry = inputProps.geometry
    const material = inputProps.material
    const x = inputProps.x === undefined ? 0 : inputProps.x
    const y = inputProps.y === undefined ? 0 : inputProps.y
    const z = inputProps.z === undefined ? 0 : inputProps.z

    const mesh = new THREE.Mesh(geometry, material)
    mesh.name = name
    mesh.position.set(x, y, z)
    root.add(mesh)
    return mesh
  }
  const box = (inputProps: { name: string; w: number; h: number; d: number; material: THREE.Material; x?: number; y?: number; z?: number }) => {
    const name = inputProps.name
    const w = inputProps.w
    const h = inputProps.h
    const d = inputProps.d
    const material = inputProps.material
    const x = inputProps.x === undefined ? 0 : inputProps.x
    const y = inputProps.y === undefined ? 0 : inputProps.y
    const z = inputProps.z === undefined ? 0 : inputProps.z
    return add({ name: name, geometry: new THREE.BoxGeometry(w, h, d), material: material, x: x, y: y + h / 2, z: z })
  }
  const disc = (inputProps: { name: string; r: number; h: number; y: number; material: THREE.Material }) => {
    const name = inputProps.name
    const r = inputProps.r
    const h = inputProps.h
    const y = inputProps.y
    const material = inputProps.material
    return add({ name: name, geometry: new THREE.CylinderGeometry(r, r, h, 12), material: material, x: 0, y: y + h / 2 })
  }
  const hoop = (inputProps: { name: string; r: number; y: number; material: THREE.Material }) => {
    const name = inputProps.name
    const r = inputProps.r
    const y = inputProps.y
    const material = inputProps.material

    const mesh = add({ name: name, geometry: new THREE.TorusGeometry(r, unit * 0.018, 4, 12), material: material, x: 0, y: y })
    mesh.rotation.x = Math.PI / 2
    return mesh
  }
  if (kind === "tinker-toolbox") {
    const height = unit * 0.65
    box({ name: "box-body", w: f.w * 0.86, h: height, d: f.d * 0.84, material: M.woodV })
    box({ name: "lid", w: f.w * 0.9, h: unit * 0.07, d: f.d * 0.88, material: M.wood, x: 0, y: height })
    for (const side of [-1, 1]) {
      box({ name: "iron-strap", w: unit * 0.04, h: height + unit * 0.075, d: f.d * 0.9, material: M.iron, x: side * f.w * 0.28 })
      box({ name: "handle-post", w: unit * 0.055, h: unit * 0.18, d: unit * 0.055, material: M.iron, x: side * f.w * 0.13, y: height + unit * 0.07 })
    }
    box({ name: "carry-grip", w: f.w * 0.3, h: unit * 0.06, d: unit * 0.075, material: M.woodDark, x: 0, y: height + unit * 0.22 })
    box({ name: "latch", w: unit * 0.09, h: unit * 0.17, d: unit * 0.035, material: M.iron, x: 0, y: height - unit * 0.1, z: -f.d * 0.45 })
  } else if (kind === "ash-sack") {
    const profile = [
      [0, 0],
      [0.24, 0],
      [0.43, 0.08],
      [0.46, 0.32],
      [0.37, 0.65],
      [0.09, 0.85],
      [0.12, 0.97],
      [0, 0.98],
    ]
    const geometry = new THREE.LatheGeometry(
      profile.map((entry) => {
        const r = entry[0]
        const y = entry[1]
        return new THREE.Vector2(r * unit, y * unit)
      }),
      10,
    )
    const body = add({ name: "tied-sack", geometry: geometry, material: M.sack })
    body.scale.x = f.w / unit
    hoop({ name: "neck-tie", r: unit * 0.1, y: unit * 0.85, material: M.rope }).scale.x = f.w / unit
  } else if (kind === "lye-tub") {
    disc({ name: "bottom", r: unit * 0.37, h: unit * 0.05, y: 0, material: M.woodDark })
    for (let i = 0; i < 16; i++) {
      const angle = (i * Math.PI) / 8
      const stave = box({ name: "stave", w: unit * 0.15, h: unit * 0.65, d: unit * 0.055, material: M.woodV, x: Math.sin(angle) * unit * 0.36, y: 0, z: Math.cos(angle) * unit * 0.36 })
      stave.rotation.y = angle
    }
    for (const height of [0.1, 0.53]) hoop({ name: "tub-hoop", r: unit * 0.395, y: unit * height, material: M.iron })
    disc({ name: "removable-lid", r: unit * 0.415, h: unit * 0.045, y: unit * 0.65, material: M.wood })
    box({ name: "lid-grip", w: unit * 0.22, h: unit * 0.035, d: unit * 0.06, material: M.woodDark, x: 0, y: unit * 0.695 })
  } else {
    disc({ name: "pot-body", r: unit * 0.32, h: unit * 0.47, y: 0, material: M.iron })
    hoop({ name: "pot-rim", r: unit * 0.325, y: unit * 0.47, material: M.iron })
    disc({ name: "pot-lid", r: unit * 0.345, h: unit * 0.035, y: unit * 0.475, material: M.iron })
    box({ name: "lid-grip", w: unit * 0.18, h: unit * 0.06, d: unit * 0.055, material: M.woodDark, x: 0, y: unit * 0.51 })
    for (const side of [-1, 1]) {
      const handle = add({ name: "pot-handle", geometry: new THREE.TorusGeometry(unit * 0.075, unit * 0.02, 4, 10), material: M.iron, x: side * unit * 0.36, y: unit * 0.35 })
      handle.rotation.y = Math.PI / 2
    }
  }
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
  return root
}
