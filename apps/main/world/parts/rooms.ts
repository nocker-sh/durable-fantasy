// Which room to be in: the parallel town (channels.ts), the channel of each map the directory
// picks, and the next map's room opened ahead while walking up to the way into it.
import { connect, type VoidSocket } from "void/ws"
import { isChannel } from "#/world/is-channel"
import { roomName } from "#/world/room-name"
import type { MapId } from "#/world/maps/types"

/** How long the directory may take to choose a channel before channel 1 is tried instead. */
const CHANNEL_WAIT = 5000

export type RoomSocket = VoidSocket<"/map/:mapId">
export type Channel = {
  channel: number
  channels: Record<number, number>
}
/** A room got ready before arriving: its channel, its socket once opened, and whether it is open yet. */
export type Standby = {
  map: MapId
  channel: Promise<Channel>
  socket: RoomSocket | null
  open: boolean
  at: number
}

export class Rooms {
  private currentWorld = 1
  private worldGeneration = 0
  private standby: (Standby & { cancelled: boolean }) | null = null

  /** Changing parallel towns ends the lifetime of that town's preconnections. */
  get world(): number {
    return this.currentWorld
  }

  set world(world: number) {
    if (world === this.currentWorld) return
    this.currentWorld = world
    this.worldGeneration++
    this.cancelStandby()
  }

  /** Which channel of a map to go into (the directory chooses; channel 1 if it cannot be reached in time). */
  async askChannel(id: MapId, want: number | null = null): Promise<Channel> {
    try {
      const r = await fetch(`/api/channel?world=${this.world}&map=${id}${want ? `&want=${want}` : ""}`, { signal: AbortSignal.timeout(CHANNEL_WAIT) })
      if (r.ok) {
        const chosen = (await r.json()) as Channel
        // a channel no room is named for would be turned away (404) at every reconnection
        if (isChannel(chosen.channel)) return chosen
      }
    } catch {
      // the directory is unreachable or too slow
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
    this.cancelStandby()
    const generation = this.worldGeneration
    // Resolving channel also guarantees socket creation, including when take() transfers ownership
    // before the channel request completes.
    const channel = this.askChannel(map).then((chosen) => {
      if (entry.cancelled || generation !== this.worldGeneration) return chosen
      const socket = this.open(map, chosen.channel)
      entry.socket = socket
      socket.on("open", () => {
        entry.open = true
      })
      socket.on("close", () => {
        entry.open = false
      })
      return chosen
    })
    const entry = { map, channel, socket: null as RoomSocket | null, open: false, at: performance.now(), cancelled: false }
    this.standby = entry
  }

  /** Cancel speculative work when leaving the game. */
  close() {
    this.cancelStandby()
  }

  private cancelStandby() {
    if (!this.standby) return
    this.standby.cancelled = true
    this.standby.socket?.close()
    this.standby = null
  }

  /** The room got ready for `map`, taken as it is; any other one is closed. A channel asked for skips it. */
  take(map: MapId, want: number | null): Standby | null {
    const ready = !want && this.standby?.map === map ? this.standby : null
    if (!ready) this.cancelStandby()
    this.standby = null
    return ready
  }
}
