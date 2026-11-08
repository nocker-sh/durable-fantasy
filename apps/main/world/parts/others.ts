// Everyone else on the map, as the room last reported them, and which of the room's players is us.
import type { Cell, MapPlayer } from "#/world/protocol"

export class Others {
  private players = new Map<string, MapPlayer>()
  /** our own id in the room, once it has welcomed us */
  you: string | null = null

  get size() {
    return this.players.size
  }

  get(id: string) {
    return this.players.get(id)
  }

  values() {
    return this.players.values()
  }

  /** Forget everyone (we left the map). */
  clear() {
    this.players.clear()
    this.you = null
  }

  /** The room's welcome: who we are and who is here. */
  welcome(you: string, players: readonly MapPlayer[]) {
    this.players.clear()
    this.you = you
    for (const p of players) this.players.set(p.id, p)
  }

  /** Someone came (or changed how they look); true if they were already here. */
  join(player: MapPlayer): boolean {
    const known = this.players.has(player.id)
    this.players.set(player.id, player)
    return known
  }

  /** Someone went; who it was, if we knew them. */
  leave(id: string): MapPlayer | undefined {
    const p = this.players.get(id)
    this.players.delete(id)
    return p
  }

  /** Someone set off along a path: they will be at its end. */
  move(id: string, path: readonly Cell[]) {
    const p = this.players.get(id)
    if (p && path.length) this.players.set(id, { ...p, at: path[path.length - 1] })
  }
}
