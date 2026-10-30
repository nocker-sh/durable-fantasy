import { getDiningSeatGeometry } from "#/scripts/lib/get-dining-seat-geometry"
import { readFileSync } from "node:fs"
import { expect, it } from "vitest"
import { readSetting } from "#/scripts/lib/read-setting"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { FRAMES } from "#/world/scene/figure/animation"
import { getSeatedContacts } from "#/world/scene/get-seated-contacts"
import { getSeatedLegError } from "#/world/scene/get-seated-leg-error"

const room = readSetting(readFileSync(new URL("../../.docs/settings/rooms/room-h1-1.md", import.meta.url), "utf8"))
it.each(["ヴィルヘルム", "ゾフィー"])("supports %s at the actual dining table throughout the sitting clip", (name) => {
  const symbol = name === "ヴィルヘルム" ? "A" : "B"
  const chair = room.furniture?.find((furniture) => furniture.symbol === symbol)
  const table = room.furniture?.find((furniture) => furniture.symbol === "T")
  if (!chair || !table || !room.grid) throw new Error("Missing authored dining furniture")
  const geometry = getDiningSeatGeometry({ chair, table, cell: room.grid.cell_m })
  if (geometry instanceof Error) throw geometry
  for (const frame of Array.from({ length: FRAMES.sit }).keys()) {
    const contacts = getSeatedContacts({ look: RESIDENT_LOOKS[RESIDENTS.findIndex((person) => person.name === name)], frame, place: geometry.place })
    if (contacts instanceof Error) throw contacts
    expect(getSeatedLegError({ contacts, table: geometry.sections, floor: 0 }), `${name} frame ${frame}`).toBeNull()
  }
})
