import { getAuthoredRoomSource } from "#/scripts/lib/get-authored-room-source"
import { compileAuthoredRoom } from "#/scripts/lib/compile-authored-room"
import { getAuthoredRoomEntries } from "#/scripts/lib/get-authored-room-entries"
import type { AuthoredRoom } from "#/world/town/floorplan/authored-types"
import type { AuthoredEntrance } from "#/scripts/lib/authored-plan-types"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { Layout } from "#/scripts/lib/building-layout"

type Props = Readonly<{ building: SettingDocument; documents: ReadonlyMap<string, SettingDocument>; layout: Layout }>

/** Compile in declared floor and room order, retaining the single-entrance invariant before assembling the plan. */
export function compileAuthoredRooms(props: Props) {
  const rooms: AuthoredRoom[] = [],
    entries: AuthoredEntrance[] = []
  for (const level of props.layout.floors) {
    for (const id of level.rooms) {
      const source = getAuthoredRoomSource({ ...props, id, floor: level.floor, cellM: props.layout.cell_m })
      entries.push(...getAuthoredRoomEntries({ source, floor: level.floor, outsideMap: props.building.map, layout: props.layout }))
      rooms.push(compileAuthoredRoom({ source, floor: level.floor, cellM: props.layout.cell_m }))
    }
  }
  if (entries.length !== 1) throw new Error("One authored entrance required")
  return { rooms, entrance: entries[0] }
}
