import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { RoomWorkUse, RoomWorkUseContext } from "#/scripts/lib/room-work-use-types"

type Props = Readonly<{ room: SettingDocument; use: RoomWorkUse; documents: ReadonlyMap<string, SettingDocument> }>

/** Resolve the worker, shared furniture and owned storage before inspecting their work plan. */
export function getRoomWorkUseContext(props: Props): RoomWorkUseContext | Error {
  const use = props.use
  const resident = props.documents.get(use.resident)
  if (props.room.kind !== "rooms" || resident?.kind !== "residents" || !Array.isArray(props.room.occupants) || !props.room.occupants.includes(resident.title))
    return new Error("Work use has no resident occupant")
  const building = props.documents.get(String(props.room.building))
  if (building?.kind !== "buildings" || !Array.isArray(building.rooms) || !building.rooms.includes(props.room.id)) return new Error("Work use has no containing building")
  const table = props.room.furniture?.find((piece) => piece.symbol === use.furniture)
  if (!table?.seat_symbols?.includes(use.seat_symbol) || !props.room.furniture?.some((piece) => piece.symbol === use.seat_symbol)) return new Error("Work use has no matching furniture and seat")
  const storageRoom = props.documents.get(use.storage_room)
  const storage = storageRoom?.furniture?.find((piece) => piece.symbol === use.storage_symbol)
  if (
    storageRoom?.kind !== "rooms" ||
    storageRoom.building !== props.room.building ||
    !building.rooms.includes(storageRoom.id) ||
    storage?.role !== "storage" ||
    !storage.compartments?.includes(use.kit.storage_compartment)
  )
    return new Error("Work use has no matching household storage compartment")
  if (storage.owner !== resident.title && storage.owner !== resident.household && !storage.owners?.includes(resident.title)) return new Error("Work kit storage belongs to another resident")
  return { resident, table, storage }
}
