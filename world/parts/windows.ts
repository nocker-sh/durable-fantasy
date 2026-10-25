// Which windows are open and in what order (front-most last), remembered between visits, and the
// modal screen over everything (ui.md §3).
import type { Store } from "../../lib/engine/store.ts"
import { DEFAULT_WINDOWS, type GameState, type ModalId, type WindowId } from "../state.ts"

const KNOWN: readonly WindowId[] = ["minimap", "chat", "syslog", "inventory", "equipment", "stats", "worldmap", "errands", "skills", "friends"]

export class Windows {
  constructor(
    private readonly state: Store<GameState>,
    private readonly key: string,
  ) {}

  /** The windows left open last time, or the defaults. */
  load(): readonly WindowId[] {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key) ?? "null")
      if (Array.isArray(saved)) return saved.filter((w): w is WindowId => KNOWN.includes(w))
    } catch {
      // fall back to the defaults
    }
    return DEFAULT_WINDOWS
  }

  toggle(id: WindowId) {
    this.set((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]))
  }

  close(id: WindowId) {
    this.set((w) => w.filter((x) => x !== id))
  }

  /** Put every window back where it started: positions, sizes and which are open. */
  reset() {
    for (const key of Object.keys(localStorage)) if (key.startsWith("ui-window/")) localStorage.removeItem(key)
    this.set(() => DEFAULT_WINDOWS)
    this.state.set((s) => ({ ...s, layout: s.layout + 1 }))
  }

  /** Bring a window to the front. */
  focus(id: WindowId) {
    const { windows } = this.state.get()
    if (windows[windows.length - 1] !== id && windows.includes(id)) this.state.set((s) => ({ ...s, windows: [...windows.filter((w) => w !== id), id] }))
  }

  openModal(modal: ModalId | null) {
    this.state.set((s) => ({ ...s, modal }))
  }

  private set(change: (windows: readonly WindowId[]) => readonly WindowId[]) {
    const windows = change(this.state.get().windows)
    localStorage.setItem(this.key, JSON.stringify(windows))
    this.state.set((s) => ({ ...s, windows }))
  }
}
