export type RoomIdentity = { floor: number; name: string }
/** Preserve every source room which has no distinct counterpart at its declared floor. */
export function unrepresentedRooms(source: readonly RoomIdentity[], realized: readonly RoomIdentity[]): RoomIdentity[] {
  const counts = new Map<string, number>(),
    key = (room: RoomIdentity) => JSON.stringify([room.floor, room.name])
  for (const room of realized) counts.set(key(room), (counts.get(key(room)) ?? 0) + 1)
  const missing: RoomIdentity[] = []
  for (const room of source) {
    const id = key(room),
      available = counts.get(id) ?? 0
    if (available) counts.set(id, available - 1)
    else missing.push({ floor: room.floor, name: room.name })
  }
  return missing
}
