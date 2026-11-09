import type { VoidSocket } from "void/ws"
import { clientMessage, type ClientMessage } from "#/world/protocol"

/**
 * Every message to the room leaves through here. The room checks each one against `clientMessage`
 * and closes the socket (1007) on one that fails, so such a message is kept back (false) and the
 * caller says why; a closed socket then only ever means a room on a newer build (room-client.ts).
 */
export function sendToRoom(socket: Pick<VoidSocket<"/map/:mapId">, "send"> | null, message: ClientMessage): boolean {
  if (!socket) return false
  const checked = clientMessage.safeParse(message)
  if (!checked.success) return false
  socket.send(checked.data)
  return true
}
