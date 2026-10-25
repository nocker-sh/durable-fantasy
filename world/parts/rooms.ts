// Which room to be in: the parallel town (channels.ts), the channel of each map the directory
// picks, and the next map's room opened ahead while walking up to the way into it.
import { connect, type VoidSocket } from "void/ws"
import { roomName } from "../channels.ts"
import type { MapId } from "../maps/index.ts"

export type RoomSocket = VoidSocket<"/map/:mapId">
export interface Channel {
  channel: number
  channels: Record<number, number>
}
/** A room got ready before arriving: its channel, its socket once opened, and whether it is open yet. */
export interface Standby {
  map: MapId
  channel: Promise<Channel>
  socket: RoomSocket
  open: boolean
  at: number
}

export class Rooms {
  /** the parallel town we are in */
  world = 1
  private standby: Standby | null = null

  /** Which channel of a map to go into (the directory chooses; channel 1 if it cannot be reached). */
  async askChannel(id: MapId, want: number | null = null): Promise<Channel> {
    try {
      const r = await fetch(`/api/channel?world=${this.world}&map=${id}${want ? `&want=${want}` : ""}`)
      if (r.ok) return (await r.json()) as Channel
    } catch {
      // the directory is unreachable
    }
    return { channel: 1, channels: {} }
  }

  /** Open a socket to one channel of a map, in our town. */
  open(map: MapId, channel: number): RoomSocket {
    return connect("/map/:mapId", { params: { mapId: roomName({ world: this.world, map, channel }) } })
  }

  /** Is the room of `map` already being got ready. */
  standingBy(map: MapId) {
    return this.standby?.map === map
  }

  /** Get the room of `map` ready: ask its channel and open its socket (nothing is said to it until we arrive). */
  standBy(map: MapId) {
    if (this.standby?.map === map) return
    this.standby?.socket?.close()
    const channel = this.askChannel(map)
    const entry: Standby = { map, channel, socket: null as unknown as RoomSocket, open: false, at: performance.now() }
    this.standby = entry
    void channel.then(({ channel: c }) => {
      if (this.standby !== entry) return
      entry.socket = this.open(map, c)
      entry.socket.on("open", () => {
        entry.open = true
      })
    })
  }

  /** The room got ready for `map`, taken as it is; any other one is closed. A channel asked for skips it. */
  take(map: MapId, want: number | null): Standby | null {
    const ready = !want && this.standby?.map === map ? this.standby : null
    if (!ready) this.standby?.socket?.close()
    this.standby = null
    return ready
  }
}
