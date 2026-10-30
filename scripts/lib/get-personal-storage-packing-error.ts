import { getPersonalStorageBoxError } from "#/scripts/lib/get-personal-storage-box-error"
import { getFrontAccessStorageError } from "#/scripts/lib/get-front-access-storage-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
import type { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import type { z } from "zod"
type Props = { room: SettingDocument; slot: z.infer<typeof personalStorageSchema>[number]; documents: ReadonlyMap<string, SettingDocument> }

/** Capacity belongs to the assigned person's physical box, with actual local makers and an explicit unresolved access plan. */
export function getPersonalStoragePackingError(props: Props): Error | null {
  const plan = props.slot.packing
  if (!plan) return null
  const room = props.room,
    owner = props.documents.get(props.slot.resident),
    furniture = room.furniture?.find((piece) => piece.symbol === props.slot.furniture_symbol)
  if (
    room.kind !== "rooms" ||
    !room.grid ||
    furniture?.role !== "storage" ||
    owner?.kind !== "residents" ||
    furniture.owner !== owner.title ||
    !furniture.compartments?.includes(props.slot.compartment)
  )
    return new Error("Packing has no matching personal box and owner")
  if (new Set(plan.objects.map((piece) => piece.kind)).size !== 3 || plan.objects.some((piece) => piece.id !== `${props.slot.id}:${piece.kind}`))
    return new Error("Packing needs unique belongings of the storage owner")
  if (props.slot.contents.length !== 3 || !["衣服", "首巻き", "私物"].every((category) => props.slot.contents.includes(category))) return new Error("Packing omits a personal belongings category")
  if (plan.opening?.reach_review && plan.opening.reach_review.operator !== props.slot.resident) return new Error("Native box reach belongs to another storage owner")
  if (plan.lid_handle && plan.lid_handle.id !== `${props.slot.id}:lid-handle`) return new Error("Lid handle belongs to another storage box")
  const dependencies = room.design_dependencies
  for (const supplier of [
    [plan.maker, "木工師"],
    [plan.timber_supplier, "木こり"],
  ]) {
    const resident = props.documents.get(supplier[0])
    if (resident?.kind !== "residents" || resident.work !== supplier[1] || resident.town !== room.town || !Array.isArray(dependencies) || !dependencies.includes(supplier[0]))
      return new Error("Packing has no matching local box supplier")
  }
  if (room.design_gate === "通過") return new Error("Personal box opening and retrieval remain unverified")

  return (
    getPersonalStorageBoxError({ plan, width: furniture.rect[2] * room.grid.cell_m, depth: furniture.rect[3] * room.grid.cell_m }) ??
    getFrontAccessStorageError({ ...props, building: props.documents.get(String(room.building)) })
  )
}
