import { expect, it } from "vitest"
import { Mesh, Vector3 } from "three"
import { sheepMesh } from "#/world/scene/construction/sheep-mesh"
import { getSheepBodyRadius } from "#/world/town/get-sheep-body-radius"
import { townAnimalSpawns } from "#/world/town/animals"
import { LIVESTOCK_GRAZE_PITCH } from "#/world/town/livestock-graze-pitch"

it("contains every actual head, eye, wool and hoof vertex across headings and grazing tilts", () => {
  const spawn = townAnimalSpawns("phanthiet").find((animal) => animal.kind === "sheep")
  if (!spawn) throw new Error("Missing sheep")
  const root = sheepMesh(),
    radius = getSheepBodyRadius(spawn.scale)
  if (radius instanceof Error) throw radius
  root.scale.setScalar(spawn.scale)
  expect(root.children).toHaveLength(8)
  for (const pitchIndex of Array.from({ length: 26 }).keys())
    for (const heading of Array.from({ length: 32 }).keys()) {
      root.rotation.set((LIVESTOCK_GRAZE_PITCH * pitchIndex) / 25, (heading * Math.PI * 2) / 32, 0)
      root.updateMatrixWorld(true)
      root.traverse((object) => {
        if (!(object instanceof Mesh)) return
        expect(object.castShadow).toBe(true)
        const positions = object.geometry.getAttribute("position")
        for (const index of Array.from({ length: positions.count }).keys()) {
          const point = new Vector3().fromBufferAttribute(positions, index).applyMatrix4(object.matrixWorld)
          if (Math.hypot(point.x, point.z) > radius) throw new Error("A native sheep vertex leaves its waiting envelope")
        }
      })
    }
})
