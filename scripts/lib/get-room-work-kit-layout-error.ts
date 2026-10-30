import { getStoredWorkKitDimensions } from "#/scripts/lib/get-stored-work-kit-dimensions"
import { getWorkKitBoxError } from "#/scripts/lib/get-work-kit-box-error"
import { getWorkKitTableSetupError } from "#/scripts/lib/get-work-kit-table-setup-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { RoomWorkUse, RoomWorkUseContext } from "#/scripts/lib/room-work-use-types"

type Props = Readonly<{ room: SettingDocument; use: RoomWorkUse; context: RoomWorkUseContext; documents: ReadonlyMap<string, SettingDocument> }>

/** Resolve one stored box for packing and tabletop checks; neither creates a second dimensional definition. */
export function getRoomWorkKitLayoutError(props: Props): Error | null {
  const use = props.use
  if (use.status === "designed" && !use.kit.box) return new Error("Work kit has no dimensioned box")
  if (use.table_setup && !use.kit.box) return new Error("Work tabletop setup has no referenced box")
  if (use.status === "designed" && !use.table_setup) return new Error("Work use has no tabletop setup")
  if (use.kit.box) {
    const dimensions = getStoredWorkKitDimensions({ shelf: props.context.storage.shelf, id: use.kit.box.storage_item, owner: props.context.resident.title })
    if (dimensions instanceof Error) return dimensions
    const error = getWorkKitBoxError({ box: use.kit.box, dimensions, owner: use.kit.owner, documents: props.documents })
    if (error) return error
    if (use.table_setup) {
      if (!props.room.grid) return new Error("Work tabletop setup has no measured room")
      const setupError = getWorkKitTableSetupError({ setup: use.table_setup, table: props.context.table, cell: props.room.grid.cell_m, dimensions })
      if (setupError) return setupError
    }
  }
  return null
}
