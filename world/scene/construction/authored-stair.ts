import * as THREE from "three"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { M } from "#/world/scene/construction/materials"
import { stairGeometry, type StairSection } from "#/world/town/floorplan/stair-geometry"

/** On the upper floor the same flight descends below the opening, never rises again. */
export function authoredStair(inputProps: { section: StairSection; floor: number; floorY: number; scale?: number }): THREE.Group {
  const section = inputProps.section
  const floor = inputProps.floor
  const floorY = inputProps.floorY
  const scale = inputProps.scale === undefined ? 1 : inputProps.scale

  const stepsSource = stairGeometry(section),
    steps = stepsSource.steps,
    upperLanding = stepsSource.upperLanding,
    opening = stepsSource.opening,
    upper = floor === section.upperFloor
  const bottom = floorY - (upper ? section.height : 0),
    root = new THREE.Group()
  root.name = `authored-stair:${section.id}`
  const railRadius = section.railInset * 0.45
  const box = (inputProps: { name: string; r: { x0: number; z0: number; x1: number; z1: number }; y0: number; y1: number }) => {
    const name = inputProps.name
    const r = inputProps.r
    const y0 = inputProps.y0
    const y1 = inputProps.y1

    const gb = new GB()
    gb.box({ side: M.wood, top: M.woodDark, x0: r.x0, y0: y0, z0: r.z0, x1: r.x1, y1: y1, z1: r.z1, repeat: 2 })
    const mesh = gb.build()
    mesh.name = name
    root.add(mesh)
  }
  for (const entry of steps.entries()) {
    const i = entry[0]
    const step = entry[1]
    box({ name: `tread:${i}`, r: step, y0: bottom, y1: bottom + step.height })
  }
  if (!upper) box({ name: "upper-landing", r: upperLanding, y0: bottom + section.height - section.slabThickness, y1: bottom + section.height })
  const alongX = section.axis === "x",
    crossLow = alongX ? section.z0 : section.x0,
    crossHigh = alongX ? section.z1 : section.x1
  const point = (along: number, cross: number, y: number) => (alongX ? new THREE.Vector3(along, y, cross) : new THREE.Vector3(cross, y, along))
  const rail = (name: string, a: THREE.Vector3, b: THREE.Vector3) => {
    const delta = b.clone().sub(a),
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(railRadius, railRadius, delta.length(), 6), M.woodDark)
    mesh.name = name
    mesh.position.copy(a).add(b).multiplyScalar(0.5)
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize())
    root.add(mesh)
  }
  for (const cross of [crossLow + section.railInset / 2, crossHigh - section.railInset / 2]) {
    const points = steps.map((step) => point(alongX ? (step.x0 + step.x1) / 2 : (step.z0 + step.z1) / 2, cross, bottom + step.height + 0.9 * scale))
    // Each end and every third tread supports the handrail.
    points.forEach((p, i) => {
      if (i % 3 === 0 || i === points.length - 1) rail("handrail-post", p.clone().add(new THREE.Vector3(0, -0.9 * scale, 0)), p)
    })
    rail("sloping-handrail", points[0], points[points.length - 1])
  }
  if (upper) {
    const a = alongX ? opening.x0 : opening.z0,
      b = alongX ? opening.x1 : opening.z1,
      y = floorY + 0.9 * scale
    for (const cross of [crossLow + section.railInset / 2, crossHigh - section.railInset / 2]) {
      const p = point(a, cross, y),
        q = point(b, cross, y)
      rail("opening-guard", p, q)
      for (const along of [a, b]) rail("opening-guard-post", point(along, cross, floorY), point(along, cross, y))
    }
    const far = section.lowerEnd === "end" ? b : a
    rail("opening-end-guard", point(far, crossLow + section.railInset / 2, y), point(far, crossHigh - section.railInset / 2, y))
  }
  root.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.castShadow = true
      object.receiveShadow = true
    }
  })
  return root
}
