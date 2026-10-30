import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import * as THREE from "three"
import { readSetting } from "#/scripts/lib/read-setting"
import { shelfDimensions } from "#/scripts/lib/shelf-dimensions"
import { ashLidRestPlan } from "#/scripts/lib/ash-lid-rest-plan"
import { storageRetrieval } from "#/world/town/storage-retrieval"
import { storageLidState } from "#/world/town/storage-lid-state"
import { drawStorageBoxParts } from "#/world/scene/construction/draw-storage-box-parts"
import { GeometryBuilder as GB } from "#/lib/graphics/geometry-builder"
import { SceneResources } from "#/lib/graphics/scene-resources"
it("draws the same receiver hollow on the floor with its own lid resting separately on the shelf", () => {
  const read = (kind: string, id: string) => readSetting(readFileSync(new URL(`../../../.docs/settings/${kind}/${id}.md`, import.meta.url), "utf8")),
    building = read("buildings", "building-h-m5"),
    documents = new Map((building.rooms as string[]).map((id) => [id, read("rooms", id)])),
    room = documents.get("room-h-m5-1")!,
    op = room.furniture!.find((f) => f.hearth_maintenance)!.hearth_maintenance!,
    receiver = op.ash_receiver!,
    rack = room.furniture!.find((f) => f.symbol === receiver.storage.furniture)!,
    k = room.grid!.cell_m,
    [x, z, w, d] = rack.rect.map((n) => n * k),
    shelf = shelfDimensions(rack.shelf, w, d),
    item = shelf.items![0],
    motion = storageRetrieval({ x: x + w / 2, z: z + d / 2, width: w, depth: d, shelf: shelf, index: 0 }),
    { plan } = ashLidRestPlan({ room: room, building: building, documents: documents, rack: rack, shelf: shelf, item: item, motion: motion, rest: receiver.lid_rest }),
    state = storageLidState(plan, 3),
    gb = new GB()
  drawStorageBoxParts(gb, state, "iron")
  const root = gb.build()
  root.updateMatrixWorld(true)
  try {
    const down = (x: number, z: number) => new THREE.Raycaster(new THREE.Vector3(x, 1, z), new THREE.Vector3(0, -1, 0)).intersectObject(root, true)[0]?.point.y
    expect(down((motion.to.x0 + motion.to.x1) / 2, (motion.to.z0 + motion.to.z1) / 2)).toBeCloseTo(item.wall!, 5)
    expect(down(...receiver.lid_rest.position_m)).toBeCloseTo(shelf.height + item.lid! + item.lidHandle!.height, 5)
    expect(state.filter((p) => p.part === "lid")).toHaveLength(1)
    expect(state.filter((p) => p.part === "bottom")).toHaveLength(1)
  } finally {
    new SceneResources(root).dispose()
  }
})
