import { HEARTH_COAL } from "#/world/scene/construction/hearth-materials"
import { createLegacyHearthGeometry } from "#/world/scene/construction/create-legacy-hearth-geometry"
import { readFileSync } from "node:fs"
import * as THREE from "three"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { getCookingHearthDefinition } from "#/scripts/lib/get-cooking-hearth-definition"
import { auditCookingHearth } from "#/scripts/lib/audit-cooking-hearth"
import { hearthDimensions } from "#/scripts/lib/hearth-dimensions"
import { hearthParts } from "#/world/town/hearth-parts"
import { getCookingHearthParts } from "#/world/town/get-cooking-hearth-parts"
import { createAuthoredHearthGeometry } from "#/world/scene/construction/create-authored-hearth-geometry"
import { M } from "#/world/scene/construction/materials"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
const read = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8"))
const fixture = () => {
  const building = read("buildings", "building-h1"),
    documents = new Map<string, SettingDocument>()
  for (const id of ["room-h1-1", "room-h1-2", "room-h1-3", "room-h1-4", "room-h1-stairs", "room-h1-landing"]) documents.set(id, read("rooms", id))
  documents.set("resident-ギュンター", read("residents", "resident-ギュンター"))
  documents.set(building.id, building)
  const room = documents.get("room-h1-2"),
    upper = documents.get("room-h1-landing"),
    furniture = room?.furniture?.find((part) => part.symbol === "O")
  if (!room || !upper || !furniture) throw new Error("Missing source cooking hearth")
  const definition = getCookingHearthDefinition({ room, building, documents, furniture })
  if (definition instanceof Error) throw definition
  const hearth = hearthDimensions(furniture.hearth),
    front = furniture.hearth_front
  if (!front) throw new Error("Missing source hearth front")
  return { building, documents, room, upper, furniture, definition, props: { bounds: definition.bounds, front, hearth, top: definition.top, shaft: definition.shaft, bottom: 0 } }
}
const volume = (box: Cuboid) => (box.x1 - box.x0) * (box.z1 - box.z0) * (box.top - box.bottom)
const overlaps = (a: Cuboid, b: Cuboid) => a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0 && a.bottom < b.top && a.top > b.bottom
it("replaces the supported firebox roof with the exact plate and keeps the full smoke duct open", () => {
  const f = fixture(),
    parts = f.definition.parts,
    original = hearthParts({ bounds: f.props.bounds, front: f.props.front, spec: f.props.hearth, shaft: f.props.shaft, bottom: 0 })
  expect(auditCookingHearth(f.room, f.documents)).toEqual([])
  expect(parts.plate).toEqual({ x0: 6.5, x1: 7, z0: 0.5, z1: 1.5, bottom: 0.78, top: 0.8 })
  expect(parts.chamber.top).toBe(parts.plate.bottom)
  expect(parts.masonry.reduce((sum, box) => sum + volume(box), 0) + volume(parts.plate)).toBeCloseTo(
    original.masonry.reduce((sum, box) => sum + volume(box), 0),
    12,
  )
  for (const box of parts.masonry) {
    expect(overlaps(box, parts.plate)).toBe(false)
    expect(overlaps(box, parts.chamber)).toBe(false)
    expect(overlaps(box, parts.throat)).toBe(false)
  }
  expect(overlaps(parts.plate, parts.throat)).toBe(false)
})
it("refuses a floating roof, inadequate bearing and a plate blocking the duct", () => {
  const f = fixture()
  expect(getCookingHearthParts({ ...f.props, top: { ...f.props.top, thickness: 0.03 } })).toEqual(new Error("Cooking plate does not directly roof its firebox"))
  expect(getCookingHearthParts({ ...f.props, top: { ...f.props.top, minimumBearing: 0.11 } })).toEqual(new Error("Cooking plate lacks bearing on its side walls"))
  expect(getCookingHearthParts({ ...f.props, top: { ...f.props.top, frontDepth: 0.8 } })).toEqual(new Error("Cooking plate obstructs the smoke duct"))
  expect(getCookingHearthParts({ ...f.props, hearth: { ...f.props.hearth, height: NaN } })).toBeInstanceOf(Error)
})
it("keeps the upper shaft attached to the real firebox and the maker registered", () => {
  const f = fixture(),
    shaft = f.upper.furniture?.find((part) => part.symbol === "H")
  if (!shaft) throw new Error("Missing upper shaft")
  shaft.rect = [1, 1, 1, 1]
  expect(getCookingHearthDefinition(f)).toEqual(new Error("Upper flue is not supported by its hearth"))
  const valid = fixture()
  valid.documents.delete("resident-ギュンター")
  expect(auditCookingHearth(valid.room, valid.documents)).toContain("O: Cooking plate has no registered maker prerequisite")
  valid.room.design_gate = "通過"
  expect(auditCookingHearth(valid.room, valid.documents)).toContain("O: Cooking heat and daily operations remain unverified")
})
it("draws the measured iron plate in place of stone in the same geometry", () => {
  const f = fixture(),
    bounds = f.definition.bounds,
    mesh = createAuthoredHearthGeometry({
      furniture: {
        kind: "hearth",
        solid: true,
        x: (bounds.x0 + bounds.x1) / 2,
        z: (bounds.z0 + bounds.z1) / 2,
        w: bounds.x1 - bounds.x0,
        d: bounds.z1 - bounds.z0,
        hearth: f.props.hearth,
        hearthFront: f.props.front,
        cookingTop: f.props.top,
      },
      floor: 0,
      height: 2.32,
      shaft: f.props.shaft,
    })
  if (mesh instanceof Error) throw mesh
  mesh.updateMatrixWorld(true)
  const iron = mesh.children.find((part) => part instanceof THREE.Mesh && part.material === M.iron)
  if (!iron) throw new Error("Missing rendered cooking plate")
  expect(mesh.children.some((part) => part instanceof THREE.Mesh && part.material === HEARTH_COAL)).toBe(true)
  const box = new THREE.Box3().setFromObject(iron),
    plate = f.definition.parts.plate
  expect(box.min.x).toBeCloseTo(plate.x0, 6)
  expect(box.max.x).toBeCloseTo(plate.x1, 6)
  expect(box.min.y).toBeCloseTo(plate.bottom, 6)
  expect(box.max.y).toBeCloseTo(plate.top, 6)
  expect(box.min.z).toBeCloseTo(plate.z0, 6)
  expect(box.max.z).toBeCloseTo(plate.z1, 6)
  mesh.traverse((part) => {
    if (part instanceof THREE.Mesh) part.geometry.dispose()
  })
})

it("shares the ember material across repeated legacy room builds", () => {
  const furniture: Parameters<typeof createLegacyHearthGeometry>[0]["furniture"] = { kind: "hearth", solid: true, x: 0, z: 0, w: 1, d: 1 }
  for (const floor of [0, 0.1]) {
    const mesh = createLegacyHearthGeometry({ furniture, floor, height: 2.3 })
    expect(mesh.children.some((part) => part instanceof THREE.Mesh && part.material === HEARTH_COAL)).toBe(true)
    mesh.traverse((part) => {
      if (part instanceof THREE.Mesh) part.geometry.dispose()
    })
  }
})
