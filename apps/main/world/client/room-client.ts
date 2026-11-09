import { currentPublication } from "#/world/client/player-publication"
import { sendToRoom } from "#/world/client/send-to-room"
import type { GameSession } from "#/world/client/game-session"
import type { ServerMessageContext } from "#/world/client/server-context"
import type { VoidSocket } from "void/ws"
import type { Transition } from "#/world/core/transition"
import { commandSchema, REASON_TEXT, type Command } from "#/world/core/commands"
import { MAPS } from "#/world/maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { isMapId } from "#/world/maps/is-map-id"
import { type MapId } from "#/world/maps/types"
import type { Cell } from "#/world/protocol"
import { lap } from "#/world/lap"

const COMMAND_TIMEOUT = 8000
/** How long a join may go unanswered (no snapshot, no refusal) before it is tried again on a new socket. */
const JOIN_TIMEOUT = 10_000
/** The longest wait before a join is tried again: the first waits a second, each next one twice as long. */
const JOIN_RETRY_MAX = 30_000

export class RoomClient {
  private seq = 0
  private generation = 0
  /** the current socket got through to the room, so a join went out on it */
  private opened = false
  private joinTimer: ReturnType<typeof setTimeout> | undefined
  private retryTimer: ReturnType<typeof setTimeout> | undefined

  cancel() {
    this.generation++
    this.stopTimers()
  }
  constructor(
    private readonly target: Pick<ServerMessageContext, "update" | "getScene" | "onServer" | "preview" | "notify" | "setPlayer" | "report"> & {
      readonly session: Pick<GameSession, "wantChannel" | "rooms" | "state" | "socket" | "arriveAt" | "others" | "playerId" | "waiting" | "engaged" | "wild" | "warping" | "joinTries">
    },
  ) {}
  async connect(id: MapId) {
    const generation = ++this.generation
    this.stopTimers()
    this.opened = false
    const want = this.target.session.wantChannel
    this.target.session.wantChannel = null
    // a room got ready while walking up to the way in is taken as it is
    const ready = this.target.session.rooms.take(id, want)
    if (ready) {
      const channelSource = await ready.channel,
        channel = channelSource.channel,
        channels = channelSource.channels
      const socket = ready.socket
      if (!socket) return
      if (generation !== this.generation || this.target.session.state.get().map.id !== id) {
        socket.close()
        return
      }
      lap(ready.open ? "room: was ready" : "room: was being got ready")
      this.target.update({ room: { world: this.target.session.rooms.world, channel, channels } })
      this.target.session.socket = socket
      this.listen(socket)
      if (ready.open) {
        this.opened = true
        this.target.update({ online: "online" })
        this.join()
      }
      return
    }
    const channelSource2 = await this.target.session.rooms.askChannel(id, want),
      channel = channelSource2.channel,
      channels = channelSource2.channels
    lap("room: channel chosen")
    if (generation !== this.generation || this.target.session.state.get().map.id !== id) return // moved on meanwhile
    this.target.update({ room: { world: this.target.session.rooms.world, channel, channels } })
    const socket = this.target.session.rooms.open(id, channel)
    this.target.session.socket = socket
    this.listen(socket)
    // beside a way out, the room beyond is asked for at once, alongside our own
    const beside = this.wayBeside(this.target.session.arriveAt)
    if (beside) this.target.session.rooms.standBy(beside)
  }

  wayBeside(at: Cell | null): MapId | null {
    if (!at) return null
    const near = MAPS[this.target.session.state.get().map.id].warps.map((w) => ({ w, d: cellDistance(w.at as Cell, at) })).sort((a, b) => a.d - b.d)[0]
    return near && near.d <= 16 && isMapId(near.w.to.map) ? near.w.to.map : null
  }

  standBy(map: MapId) {
    if (this.target.session.others.you) this.target.session.rooms.standBy(map)
  }

  listen(socket: VoidSocket<"/map/:mapId">) {
    // Counters belong to one channel's Wild DO, not to the player across rooms.
    this.target.session.wild = {}
    socket.on("open", () => {
      if (this.target.session.socket !== socket) return
      lap("room: socket open")
      this.opened = true
      this.target.update({ online: "online", connectionReplaced: false })
      this.join()
    })
    socket.on("close", (event) => {
      if (this.target.session.socket !== socket) return
      // the room took the socket in but never let us in: the join failed there or was cut short
      const unanswered = this.opened && !this.target.session.others.you
      this.opened = false
      clearTimeout(this.joinTimer)
      if (event.code === 4001) {
        socket.close()
        this.target.update({ connectionReplaced: true })
        this.target.notify("このキャラクターは別の画面で開かれた。", "bad")
      } else if (event.code === 1007) {
        // every message is checked against this build's schema before it leaves (send-to-room.ts), so
        // a room refusing one runs a newer build and would refuse it again after any reconnection
        socket.close()
        this.target.update({ outdated: true })
      } else if (unanswered) {
        // not at once and for ever: a new socket, after a wait that grows with each failed join
        socket.close()
        this.target.session.socket = null
        this.retry()
      }
      this.target.update({
        online: "offline",
        trade: null,
        tradeAsk: null,
        partyAsk: null,
        threadAsk: null,
        playerMenu: null,
        dialogue: null,
        shop: null,
        stock: null,
        craft: null,
        commission: null,
        storage: false,
        board: null,
      })
      this.target.session.engaged = null
      // a warp asked for on this socket will never be answered: let the next one go
      this.target.session.warping = false
      this.target.getScene()?.stop()
      this.target.getScene()?.freeze(true)
      for (const finish of this.target.session.waiting.values()) finish({ ok: false, reason: "OFFLINE" })
      this.target.session.waiting.clear()
      this.target.session.others.clear()
      this.target.getScene()?.clearRemotes()
    })
    socket.on("message", (message) => {
      if (this.target.session.socket === socket) this.target.onServer(message)
    })
  }

  join() {
    const scene = this.target.getScene()
    const at = scene?.ready ? scene.playerCell() : this.target.session.arriveAt
    const socket = this.target.session.socket
    if (!socket || !at || this.target.session.others.you) return
    const clock = this.target.session.state.get().clock
    if (!sendToRoom(socket, { type: "join", player: this.target.session.playerId, at, ...(import.meta.env.DEV && clock.held ? { time: clock.min } : {}) })) return
    // the room answers with a snapshot or a refusal; when neither comes, the join is tried again
    if (!this.opened) return
    clearTimeout(this.joinTimer)
    this.joinTimer = setTimeout(() => this.unanswered(socket), JOIN_TIMEOUT)
  }

  /** The join on `socket` was never answered: leave the socket and join again on a new one. */
  private unanswered(socket: VoidSocket<"/map/:mapId">) {
    if (this.target.session.socket !== socket || this.target.session.others.you) return
    this.opened = false
    this.target.session.socket = null
    socket.close()
    this.target.update({ online: "offline" })
    this.retry()
  }

  /** Join again on a new socket: a second after the first failure, twice as long after each next one. */
  private retry() {
    const tries = ++this.target.session.joinTries
    const generation = this.generation
    clearTimeout(this.retryTimer)
    this.retryTimer = setTimeout(
      () => {
        if (generation !== this.generation) return
        // the channel we were in, so a party or a friend stays together
        this.target.session.wantChannel = this.target.session.state.get().room?.channel ?? null
        void this.connect(this.target.session.state.get().map.id)
      },
      Math.min(JOIN_RETRY_MAX, 1000 * 2 ** (tries - 1)),
    )
  }

  private stopTimers() {
    clearTimeout(this.joinTimer)
    clearTimeout(this.retryTimer)
  }

  async run(command: Command, send?: (seq: number) => boolean): Promise<boolean> {
    if (this.target.session.state.get().busy) return false
    if (!send) {
      const parsed = commandSchema.safeParse(command)
      if (!parsed.success) return false
      command = parsed.data
    }
    const local = send ? null : this.target.preview(command)
    if (local) {
      this.target.notify(REASON_TEXT[local], "bad")
      return false
    }
    const socket = this.target.session.socket
    if (!socket || this.target.session.state.get().online !== "online" || !this.target.session.others.you) {
      this.target.notify(REASON_TEXT.OFFLINE, "bad")
      return false
    }
    const seq = ++this.seq
    this.target.update({ busy: true })
    const result = await new Promise<Transition>((resolve) => {
      const finish = (result: Transition) => {
        if (!this.target.session.waiting.delete(seq)) return
        clearTimeout(timer)
        resolve(result)
      }
      const timer = setTimeout(() => finish({ ok: false, reason: "OFFLINE" }), COMMAND_TIMEOUT)
      this.target.session.waiting.set(seq, finish)
      try {
        // a request the room's schema would refuse never leaves (send-to-room.ts): refused here at once
        if (!(send ? send(seq) : sendToRoom(socket, { type: "command", seq, command }))) finish({ ok: false, reason: "NOT_READY" })
      } catch {
        finish({ ok: false, reason: "OFFLINE" })
      }
    })
    this.target.update({ busy: this.target.session.waiting.size > 0 })
    // A reply received just before leaving must not overwrite the new room's state.
    if (this.target.session.socket !== socket) return false
    if (!result.ok) {
      this.target.notify(REASON_TEXT[result.reason], "bad")
      return false
    }
    // The command succeeded even if a newer publication has already reached the session.
    if (!currentPublication(this.target.session.state.get().player, result.state)) return true
    this.target.setPlayer(result.state)
    for (const event of result.events) this.target.report(event)
    return true
  }
}
