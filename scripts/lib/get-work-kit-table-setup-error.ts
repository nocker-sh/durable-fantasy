import type { z } from "zod"
import type { workKitTableSetupSchema } from "#/scripts/lib/work-kit-table-setup-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { StorageBoxDimensions } from "#/world/town/storage-box-types"
import { workSurface } from "#/scripts/lib/work-surface"
import { storageBoxInterior } from "#/world/town/storage-box-interior"
import { getBoxLayoutError } from "#/lib/engine/get-box-layout-error"

type Props = Readonly<{ setup: z.infer<typeof workKitTableSetupSchema>; table: NonNullable<SettingDocument["furniture"]>[number]; cell: number; dimensions: StorageBoxDimensions }>

/** Static box and loose-lid footprints rest on the measured top; handling and the path between them require separate plans. */
export function getWorkKitTableSetupError(props: Props): Error | null {
  if (props.table.runtime_kind !== "table") return new Error("Work setup has no measured support table")
  try {
    const width = props.table.rect[2] * props.cell
    const depth = props.table.rect[3] * props.cell
    workSurface(props.table.work_surface, width, depth)
    storageBoxInterior(props.dimensions)
    const box = props.dimensions
    if (typeof box.lid !== "number") return new Error("Work setup has no physical lid")
    return getBoxLayoutError({
      size: [width, box.height, depth],
      boxes: [
        { id: "box", origin: [props.setup.box_origin_m[0], 0, props.setup.box_origin_m[1]], size: [box.width, box.height, box.depth] },
        { id: "lid", origin: [props.setup.lid_origin_m[0], 0, props.setup.lid_origin_m[1]], size: [box.width, box.lid + (box.lidHandle?.height ?? 0), box.depth] },
      ],
      gap: props.setup.clearance_m,
    })
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid work tabletop setup")
  }
}
