import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { auditRoomGrid } from "#/scripts/lib/audit-room-grid"
const read = (id: string) => readSetting(readFileSync(new URL(`../../.docs/settings/rooms/${id}.md`, import.meta.url), "utf8"))
it("requires the actual firebox opening to face the room's placed use position", () => {
  for (const id of ["room-h-m5-1", "room-h10-1"]) {
    const room = read(id),
      f = room.furniture!.find((f) => f.runtime_kind === "hearth")!
    expect(auditRoomGrid(room)).toEqual([])
    f.hearth_front = "e"
    expect(auditRoomGrid(room)).toContain(`${f.symbol}: hearth front has no use position`)
    delete f.hearth_front
    expect(auditRoomGrid(room)).toContain(`${f.symbol}: missing or invalid hearth front`)
  }
})
