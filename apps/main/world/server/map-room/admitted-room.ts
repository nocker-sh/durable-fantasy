import { presence } from "#/world/server/map-room/presence"
import type { RoomController } from "void/ws"

/**
 * The room as the handlers use it: its broadcasts reach only connections that have been let in.
 * A socket opened ahead of arriving, or left open after a refused join, has passed neither the town
 * check nor the seat count, so it hears nothing of the room (game-system.md §1).
 */
export function admittedRoom<Event>(room: RoomController<Event>): RoomController<Event> {
  return {
    getConnections: () => room.getConnections(),
    getConnection: (id) => room.getConnection(id),
    broadcast: async (event, excludeIds = []) => {
      const recipients = [...room.getConnections()].filter((connection) => {
        const them = presence(connection)
        return !!them.player && !them.closed && !excludeIds.includes(connection.id)
      })
      // every send starts at once, so recipients keep the order in which events were broadcast
      await Promise.all(recipients.map((connection) => connection.send(event)))
    },
  }
}
