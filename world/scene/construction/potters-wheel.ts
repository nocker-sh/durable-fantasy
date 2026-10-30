import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "./materials"
import type { Furniture } from "#/world/town/interiors"

/** Foot-driven lower wheel and a level throwing head, supported on the same vertical shaft. */
export function pottersWheel(furniture: Furniture, floorY: number): THREE.Group {
  const xSource = furniture,
    x = xSource.x,
    z = xSource.z,
    w = xSource.w,
    d = xSource.d,
    size = Math.min(w, d)
  const root = new THREE.Group(),
    frame = new GB()
  root.name = "potters-wheel"
  for (const side of [-1, 1])
    frame.box({ side: M.woodDark, top: M.wood, x0: x + side * w * 0.38 - 0.04, y0: floorY, z0: z - d * 0.35, x1: x + side * w * 0.38 + 0.04, y1: floorY + 0.1, z1: z + d * 0.35 })
  frame.box({ side: M.woodV, top: M.wood, x0: x - w * 0.38, y0: floorY + 0.08, z0: z - 0.05, x1: x + w * 0.38, y1: floorY + 0.16, z1: z + 0.05 })
  const structure = frame.build()
  structure.name = "bearing-base"
  root.add(structure)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.035, size * 0.035, 0.68, 8), M.iron)
  shaft.name = "vertical-shaft"
  shaft.position.set(x, floorY + 0.44, z)
  shaft.castShadow = true
  shaft.receiveShadow = true
  root.add(shaft)
  const disc = (inputProps: { name: string; radius: number; y: number; thickness: number; material: THREE.Material }) => {
    const name = inputProps.name
    const radius = inputProps.radius
    const y = inputProps.y
    const thickness = inputProps.thickness
    const material = inputProps.material

    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 12), material)
    mesh.name = name
    mesh.position.set(x, floorY + y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
  }
  disc({ name: "kick-wheel", radius: size * 0.42, y: 0.25, thickness: 0.1, material: M.woodDark })
  disc({ name: "throwing-head", radius: size * 0.34, y: 0.78, thickness: 0.07, material: M.woodV })
  const profile = [
    [0, 0],
    [0.08, 0],
    [0.11, 0.04],
    [0.13, 0.12],
    [0.11, 0.15],
    [0.09, 0.15],
    [0.1, 0.05],
    [0.06, 0.025],
    [0, 0.025],
  ]
  const source = new THREE.LatheGeometry(
    profile.map((entry) => {
      const r = entry[0]
      const y = entry[1]
      return new THREE.Vector2(r * size, y * size)
    }),
    10,
  )
  const geometry = source.toNonIndexed()
  source.dispose()
  geometry.computeVertexNormals()
  const vessel = new THREE.Mesh(geometry, M.ceramic)
  vessel.name = "forming-vessel"
  vessel.position.set(x, floorY + 0.815, z)
  vessel.castShadow = true
  vessel.receiveShadow = true
  root.add(vessel)
  return root
}
