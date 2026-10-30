import { roomHasWorker } from "./room-worker"
import type { SettingDocument } from "#/scripts/lib/setting-document"
/** A connected building can still force someone through another person's private room. */
export function auditPrivateRoomAccess(building: SettingDocument, documents: ReadonlyMap<string, SettingDocument>): string[] {
  const rooms = ((building.rooms ?? []) as string[]).map((id) => documents.get(id)).filter((r): r is SettingDocument => r?.kind === "rooms" && r.building === building.id)
  const household = (building.residents ?? []) as string[],
    errors: string[] = []
  for (const room of rooms) {
    const members = room.private_for as string[] | undefined
    if (!members) continue
    const owners = new Set([
      ...((room.sleeping_places ?? []) as { resident: string }[]).map((place) => place.resident),
      ...((room.personal_storage ?? []) as { resident: string }[]).map((storage) => storage.resident),
      ...((room.household_meal as { seats: { resident: string }[] } | undefined)?.seats ?? []).map((seat) => seat.resident),
    ])
    for (const id of owners) if (!members.includes(id)) errors.push(`${room.id}: private access excludes assigned resident: ${id}`)
    if (new Set(members).size !== members.length) errors.push(`${room.id}: duplicate privacy member`)
    for (const id of members)
      if ((!household.includes(id) && !roomHasWorker(room, id, documents)) || !(room.occupants as string[] | undefined)?.includes(documents.get(id)?.title ?? ""))
        errors.push(`${room.id}: private access belongs to someone outside the room's household`)
  }
  if (!building.layout && building.design_gate !== "通過") return errors
  const reachableRooms = (allowed: SettingDocument[]): Set<string> => {
    const permitted = new Set(allowed.map((r) => r.id))
    const queue = allowed.filter((r) => r.floor === 0 && ((r.connections ?? []) as { target: string }[]).some((c) => c.target === building.map)).map((r) => r.id),
      reached = new Set(queue)
    for (let i = 0; i < queue.length; i++)
      for (const c of (documents.get(queue[i])?.connections ?? []) as { target: string }[])
        if (permitted.has(c.target) && !reached.has(c.target)) {
          reached.add(c.target)
          queue.push(c.target)
        }
    return reached
  }
  for (const id of household) {
    const allowed = rooms.filter((r) => !Number(r.guest_capacity ?? 0) && (!r.private_for || (r.private_for as string[]).includes(id)))
    const reached = reachableRooms(allowed),
      bedroom = documents.get(id)?.bedroom
    if (typeof bedroom === "string" && rooms.some((r) => r.id === bedroom) && !reached.has(bedroom)) errors.push(`${id}: bedroom route crosses another person's private room or has no entrance`)
    for (const room of rooms) {
      const diners = (room.household_meal as { seats: { resident: string }[] } | undefined)?.seats ?? []
      if (diners.some((seat) => seat.resident === id) && !reached.has(room.id)) errors.push(`${id}: dining route to ${room.id} crosses a private or guest room or has no entrance`)
      const storage = (room.personal_storage ?? []) as { resident: string }[]
      if (storage.some((slot) => slot.resident === id) && !reached.has(room.id)) errors.push(`${id}: personal storage route to ${room.id} crosses a private or guest room or has no entrance`)
    }
  }
  for (const id of (building.workers ?? []) as string[]) {
    const allowed = rooms.filter((r) => !Number(r.guest_capacity ?? 0) && (!r.private_for || (r.private_for as string[]).includes(id)))
    const reached = reachableRooms(allowed)
    for (const roomId of (documents.get(id)?.work_rooms ?? []) as string[]) {
      if (rooms.some((room) => room.id === roomId) && !reached.has(roomId)) errors.push(`${id}: work route to ${roomId} crosses a private or guest room or has no entrance`)
    }
  }
  for (const guestRoom of rooms.filter((r) => Number(r.guest_capacity ?? 0) > 0)) {
    const allowed = rooms.filter((r) => r.id === guestRoom.id || (!r.private_for && !Number(r.guest_capacity ?? 0)))
    if (!reachableRooms(allowed).has(guestRoom.id)) errors.push(`${guestRoom.id}: guest route crosses a private bedroom or another guest room or has no entrance`)
  }
  return errors
}
