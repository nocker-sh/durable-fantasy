import type { z } from "zod"
import type { roomWorkUseSchema } from "#/scripts/lib/room-work-use-schema"
import type { SettingDocument } from "#/scripts/lib/setting-document"

type Furniture = NonNullable<SettingDocument["furniture"]>[number]
export type RoomWorkUse = z.infer<typeof roomWorkUseSchema>
export type RoomWorkUseContext = Readonly<{ resident: SettingDocument; table: Furniture; storage: Furniture }>
