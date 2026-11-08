import { expect, it } from "vitest"
import * as THREE from "three"
import { createMonsterBody } from "#/world/scene/create-monster-body"
import { hareBody } from "#/world/scene/fields/hare-body"
import { slimeBody } from "#/world/scene/fields/slime-body"
import { MONSTER_KINDS } from "#/world/core/monsters"

function signature(body: THREE.Group) {
  const meshes: unknown[] = []
  body.traverse((part) => {
    if (!(part instanceof THREE.Mesh)) return
    const materials = Array.isArray(part.material) ? part.material : [part.material]
    meshes.push({
      vertices: Array.from(part.geometry.getAttribute("position").array),
      position: part.position.toArray(),
      shadows: part.castShadow,
      materials: materials.map((material) => {
        if (!(material instanceof THREE.MeshBasicMaterial) && !(material instanceof THREE.MeshLambertMaterial)) throw new Error("Unexpected creature material")
        return { color: material.color.getHex(), texture: material.map?.uuid ?? null }
      }),
    })
  })
  return { scale: body.scale.toArray(), meshes }
}

it.each(Object.entries(MONSTER_KINDS))("preserves the live geometry, color, texture, shadows and scale of %s", (_id, kind) => {
  const expected = kind.look === "slime" ? slimeBody(kind.color ?? 0x8ac06a) : hareBody(kind.color)
  expected.scale.setScalar(kind.size ?? 1)
  expect(signature(createMonsterBody(kind))).toEqual(signature(expected))
})

it("uses the authored ash-hare fur while retaining its pale parts and eyes", () => {
  const kind = MONSTER_KINDS["ash-hare"],
    body = createMonsterBody(kind),
    colors = new Set<number>()
  body.traverse((part) => {
    if (!(part instanceof THREE.Mesh)) return
    for (const material of Array.isArray(part.material) ? part.material : [part.material])
      if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshLambertMaterial) colors.add(material.color.getHex())
  })
  expect(colors).toEqual(new Set([kind.color, 0xd8ccb8, 0x1a1420]))
  expect(body.scale.toArray()).toEqual([kind.size, kind.size, kind.size])
})
