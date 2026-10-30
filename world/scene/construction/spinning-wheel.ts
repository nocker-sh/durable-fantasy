import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import type { Furniture } from "#/world/town/interiors"

/** A treadle wheel with a driven bobbin, kept inside its existing floor footprint. */
export function spinningWheel(furniture: Furniture, floorY: number): THREE.Group {
  const xSource = furniture,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d
  const root = new THREE.Group(),
    frame = new GB()
  root.name = "spinning-wheel"
  const radius = Math.min(w * 0.36, d * 0.3, 0.48)
  const wheelX = x - w * 0.05,
    wheelY = floorY + 0.55,
    wheelZ = z - d * 0.08
  frame.box({ side: M.wood, top: M.wood, x0: x - w * 0.4, y0: floorY, z0: z - d * 0.38, x1: x + w * 0.4, y1: floorY + 0.08, z1: z + d * 0.38 })
  for (const side of [-1, 1])
    frame.box({ side: M.woodDark, top: M.wood, x0: wheelX - 0.04, y0: floorY + 0.08, z0: wheelZ + side * 0.12 - 0.035, x1: wheelX + 0.04, y1: wheelY + 0.05, z1: wheelZ + side * 0.12 + 0.035 })
  frame.box({ side: M.woodV, top: M.wood, x0: x - w * 0.22, y0: floorY + 0.08, z0: z + d * 0.15, x1: x + w * 0.22, y1: floorY + 0.12, z1: z + d * 0.33 })
  const spindleX = x + w * 0.28,
    spindleY = floorY + 0.88
  frame.box({ side: M.woodDark, top: M.wood, x0: spindleX - 0.035, y0: floorY + 0.08, z0: wheelZ - 0.04, x1: spindleX + 0.035, y1: spindleY, z1: wheelZ + 0.04 })
  root.add(frame.build())

  const wheel = new THREE.Group()
  wheel.name = "drive-wheel"
  wheel.position.set(wheelX, wheelY, wheelZ)
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(radius, 0.035, 4, 16), M.woodV))
  const spokeGeometry = new THREE.BoxGeometry(radius * 2 - 0.02, 0.028, 0.028)
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(spokeGeometry, M.wood)
    spoke.rotation.z = (i * Math.PI) / 4
    wheel.add(spoke)
  }
  root.add(wheel)
  const axle = (inputProps: { name: string; px: number; py: number; pz: number; r: number; length: number; material: THREE.Material }) => {
    const name = inputProps.name
    const px = inputProps.px
    const py = inputProps.py
    const pz = inputProps.pz
    const r = inputProps.r
    const length = inputProps.length
    const material = inputProps.material

    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, length, 8), material)
    mesh.name = name
    mesh.rotation.x = Math.PI / 2
    mesh.position.set(px, py, pz)
    root.add(mesh)
  }
  axle({ name: "wheel-axle", px: wheelX, py: wheelY, pz: wheelZ, r: 0.055, length: 0.3, material: M.iron })
  axle({ name: "drive-whorl", px: spindleX, py: spindleY, pz: wheelZ + 0.03, r: 0.045, length: 0.04, material: M.woodDark })
  axle({ name: "yarn-bobbin", px: spindleX, py: spindleY, pz: wheelZ + 0.1, r: 0.065, length: 0.13, material: M.wool })
  for (const side of [-1, 1]) axle({ name: "bobbin-end", px: spindleX, py: spindleY, pz: wheelZ + 0.1 + side * 0.085, r: 0.085, length: 0.025, material: M.woodV })
  const smallRadius = 0.045,
    angle = Math.atan2(spindleY - wheelY, spindleX - wheelX)
  const tangent = Math.acos((radius - smallRadius) / Math.hypot(spindleX - wheelX, spindleY - wheelY))
  for (const side of [-1, 1]) {
    const normal = angle + side * tangent
    const start = new THREE.Vector3(wheelX + Math.cos(normal) * radius, wheelY + Math.sin(normal) * radius, wheelZ + 0.03)
    const end = new THREE.Vector3(spindleX + Math.cos(normal) * smallRadius, spindleY + Math.sin(normal) * smallRadius, wheelZ + 0.03)
    const direction = end.clone().sub(start)
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, direction.length(), 4), M.rope)
    belt.name = "drive-cord"
    belt.position.copy(start.add(end).multiplyScalar(0.5))
    belt.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
    root.add(belt)
  }
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
  return root
}
