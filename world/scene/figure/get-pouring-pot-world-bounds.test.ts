import { expect, it } from "vitest"
import * as THREE from "three"
import { getPouringPotProfile } from "#/world/town/get-pouring-pot-profile"
import { getPouringPotHeldPose } from "#/world/town/get-pouring-pot-held-pose"
import { createPosedPouringPot } from "#/world/scene/construction/create-posed-pouring-pot"
import { getPouringPotWorldBounds } from "#/world/scene/figure/get-pouring-pot-world-bounds"
const fixture = () => {
  const profile = getPouringPotProfile({
    diameter: 0.2,
    height: 0.18,
    baseDiameter: 0.18,
    wall: 0.004,
    bottom: 0.008,
    fillLine: 0.12,
    lipStart: 0.13,
    lipLength: 0.04,
    lipHalfAngle: Math.PI / 6,
    bailHeight: 0.36,
    bailForward: 0.06,
    bailSpan: 0.34,
    bailRadius: 0.008,
    gripLength: 0.22,
    gripRadius: 0.016,
    lidRadius: 0.097,
    lidThickness: 0.004,
    knobHeight: 0.025,
    knobRadius: 0.018,
  })
  if (profile instanceof Error) throw profile
  return profile
}

it("encloses every rendered body, lip and handle vertex across headings and upright-to-sideways poses", () => {
  const profile = fixture()
  const checked = { vertices: 0 }
  for (const heading of [0, Math.PI / 3, -Math.PI / 2])
    for (const tilt of [0, Math.PI / 4, Math.PI / 2]) {
      const pose = getPouringPotHeldPose({ profile, heading, tilt, gripAt: [1, 1.5, -2] })
      if (pose instanceof Error) throw pose
      const bounds = getPouringPotWorldBounds({ profile, pose })
      if (bounds instanceof Error) throw bounds
      const pot = createPosedPouringPot({ profile, pose })
      if (pot instanceof Error) throw pot
      pot.updateMatrixWorld(true)
      pot.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const vertices = object.geometry.getAttribute("position")
        for (const index of Array.from({ length: vertices.count }).keys()) {
          const point = new THREE.Vector3().fromBufferAttribute(vertices, index).applyMatrix4(object.matrixWorld)
          // Geometry buffers store Float32 vertices; the bound calculation uses source doubles.
          if (point.x < bounds[0] - 1e-7 || point.z < bounds[1] - 1e-7 || point.x > bounds[2] + 1e-7 || point.z > bounds[3] + 1e-7) throw new Error("Rendered pot vertex escaped its world envelope")
          checked.vertices++
        }
        object.geometry.dispose()
      })
    }
  expect(checked.vertices).toBeGreaterThan(1000)
})

it("includes the complete radius of handles extending beyond the body", () => {
  const original = fixture()
  const profile = { ...original, handle: [{ ...original.handle[0], from: [-1, 0, 0] satisfies [number, number, number], to: [1, 0, 0] satisfies [number, number, number], radius: 0.1 }] }
  const pose = getPouringPotHeldPose({ profile, heading: 0, tilt: 0, gripAt: [1, 1, 2] })
  if (pose instanceof Error) throw pose
  const bounds = getPouringPotWorldBounds({ profile, pose })
  if (bounds instanceof Error) throw bounds
  expect(bounds[0]).toBeCloseTo(pose.at[0] - 1.1, 12)
  expect(bounds[2]).toBeCloseTo(pose.at[0] + 1.1, 12)
  for (const radius of [0, -1, NaN, Infinity]) expect(getPouringPotWorldBounds({ profile: { ...profile, handle: [{ ...profile.handle[0], radius }] }, pose })).toBeInstanceOf(Error)
  expect(getPouringPotWorldBounds({ profile: { ...profile, handle: [] }, pose })).toBeInstanceOf(Error)
})
