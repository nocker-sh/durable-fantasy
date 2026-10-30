import * as THREE from "three"
import { M } from "./materials"
import type { Furniture } from "#/world/town/interiors"

type BasketryKind = "yarn-basket" | "unfinished-basket" | "willow-bundle"

/** Willow materials, weaving in progress, and household yarn retain distinct silhouettes. */
export function basketry(f: Furniture, floorY: number, kind: BasketryKind): THREE.Group {
  const root = new THREE.Group()
  root.name = kind
  const rod = (inputProps: { name: string; a: THREE.Vector3; b: THREE.Vector3; radius: number; material: THREE.Material }) => {
    const name = inputProps.name
    const a = inputProps.a
    const b = inputProps.b
    const radius = inputProps.radius
    const material = inputProps.material

    const direction = b.clone().sub(a)
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 5), material)
    mesh.name = name
    mesh.position.copy(a).add(b).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
    root.add(mesh)
  }
  const point = (x: number, y: number, z: number) => new THREE.Vector3(f.x + x, floorY + y, f.z + z)
  const ring = (inputProps: { name: string; y: number; rx: number; rz: number; radius: number }) => {
    const name = inputProps.name
    const y = inputProps.y
    const rx = inputProps.rx
    const rz = inputProps.rz
    const radius = inputProps.radius

    const mesh = new THREE.Mesh(new THREE.TorusGeometry(1, radius / Math.max(rx, rz), 4, 20), M.rope)
    mesh.name = name
    mesh.rotation.x = Math.PI / 2
    mesh.scale.set(rx, rz, Math.max(rx, rz))
    mesh.position.copy(point(0, y, 0))
    root.add(mesh)
  }
  const unit = Math.min(f.w, f.d)
  if (kind === "willow-bundle") {
    const alongX = f.w >= f.d,
      length = (alongX ? f.w : f.d) * 0.88
    for (let i = 0; i < 12; i++) {
      const offset = ((i % 4) - 1.5) * unit * 0.1,
        height = unit * (0.03 + Math.floor(i / 4) * 0.055)
      rod({
        name: "willow-rod",
        a: point(alongX ? -length / 2 : offset, height, alongX ? offset : -length / 2),
        b: point(alongX ? length / 2 : offset, height, alongX ? offset : length / 2),
        radius: unit * 0.025,
        material: M.woodV,
      })
    }
    for (const side of [-1, 1]) {
      const tie = new THREE.Mesh(new THREE.TorusGeometry(unit * 0.19, unit * 0.018, 4, 12), M.rope)
      tie.name = "bundle-tie"
      if (alongX) tie.rotation.y = Math.PI / 2
      tie.position.copy(point(alongX ? side * length * 0.27 : 0, unit * 0.09, alongX ? 0 : side * length * 0.27))
      root.add(tie)
    }
    // The bindings cradle the rods and rest on the floor.
    root.position.y = unit * 0.118
    return root
  }
  const height = unit * (kind === "unfinished-basket" ? 0.2 : 0.45)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(unit * 0.34, unit * 0.34, unit * 0.04, 16), M.hay)
  base.name = "woven-bottom"
  base.scale.z = f.d / f.w
  base.position.copy(point(0, unit * 0.02, 0))
  root.add(base)
  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8,
      rx = Math.cos(angle) * f.w,
      rz = Math.sin(angle) * f.d
    rod({ name: "upright", a: point(rx * 0.32, unit * 0.02, rz * 0.32), b: point(rx * 0.41, kind === "unfinished-basket" ? unit * 0.65 : height, rz * 0.41), radius: unit * 0.012, material: M.woodV })
  }
  for (let i = 0; i < 6; i++) {
    const t = i / 5
    ring({ name: "woven-course", y: unit * 0.04 + t * (height - unit * 0.04), rx: f.w * (0.33 + t * 0.06), rz: f.d * (0.33 + t * 0.06), radius: unit * 0.012 })
  }
  if (kind === "yarn-basket") {
    ring({ name: "finished-rim", y: height, rx: f.w * 0.4, rz: f.d * 0.4, radius: unit * 0.025 })
    for (const entry of [
      [-0.15, -0.1],
      [0.14, -0.08],
      [0, 0.15],
    ]) {
      const x = entry[0]
      const z = entry[1]

      const ball = new THREE.Mesh(new THREE.SphereGeometry(unit * 0.16, 10, 8), M.wool)
      ball.name = "yarn-ball"
      ball.position.copy(point(x * f.w, height, z * f.d))
      root.add(ball)
      for (const turn of [-1, 0, 1]) {
        const wrap = new THREE.Mesh(new THREE.TorusGeometry(unit * 0.162, unit * 0.009, 3, 14), M.linen)
        wrap.name = "yarn-wrap"
        wrap.rotation.set(turn * 0.24, 0.4 + turn * 0.35, 0.3)
        wrap.position.copy(ball.position)
        root.add(wrap)
      }
    }
  }
  return root
}
