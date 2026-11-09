// Other players muted in this browser (ui.md §3.18). Each is the connection everyone in the room
// already sees (MapPlayer.id), never a player id. Browser storage keeps the list across a reload.
import type { Store } from "#/lib/engine/store"
import type { GameState } from "#/world/state"

type Props = Readonly<{ state: Store<GameState>; key: string }>

/** How many muted connections are remembered; the oldest are forgotten first. */
const KEEP = 100

/** The room's own limit on a connection id that names a player. */
const ID_MAX = 64

/** このブラウザでミュートした相手を、部屋の接続 ID で覚える。 */
export class Mutes {
  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  /** 読み込む前にミュートしていた接続を戻す。保存を読めないときや壊れているときは誰もミュートしない。 */
  load(): void {
    const saved = this.read()
    const muted = Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= ID_MAX) : []

    this.props.state.set((state) => ({ ...state, muted: muted.slice(-KEEP) }))
  }

  has(id: string): boolean {
    return this.props.state.get().muted.includes(id)
  }

  mute(id: string): void {
    this.save([...this.props.state.get().muted.filter((muted) => muted !== id), id])
  }

  /** 閉じた接続を忘れるときにも使う。同じ ID の接続は二度と来ない。 */
  unmute(id: string): void {
    if (this.has(id)) this.save(this.props.state.get().muted.filter((muted) => muted !== id))
  }

  private read(): unknown {
    try {
      return JSON.parse(localStorage.getItem(this.props.key) ?? "null")
    } catch {
      return null
    }
  }

  private save(muted: readonly string[]): void {
    const kept = muted.slice(-KEEP)

    this.props.state.set((state) => ({ ...state, muted: kept }))
    try {
      localStorage.setItem(this.props.key, JSON.stringify(kept))
    } catch {
      // unsaved, the mute still holds until the page is left
    }
  }
}
