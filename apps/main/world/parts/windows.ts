// Which windows are open and in what order (front-most last), remembered between visits, and the
// modal screen over everything (ui.md §3).
import type { Store } from "#/lib/engine/store"
import { DEFAULT_WINDOWS } from "#/world/state"
import type { GameState, ModalId, ServiceWindowId, WindowId } from "#/world/state"
import { isServiceWindow } from "#/world/parts/is-service-window"

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
    try {
      for (const key of Object.keys(localStorage)) if (key.startsWith("ui-window/")) localStorage.removeItem(key)
    } catch {
      // the saved places could not be cleared; the windows still go back below
    }
    // a shop or the like that is still shown keeps its place in front
    this.set((w) => [...DEFAULT_WINDOWS, ...w.filter(isServiceWindow)])
    this.state.set((s) => ({ ...s, layout: s.layout + 1 }))
  }

  /** Bring a window to the front. A shop and the like joins the order here when it opens. */
  focus(id: WindowId | ServiceWindowId) {
    const windowsSource = this.state.get(),
      windows = windowsSource.windows
    if (windows[windows.length - 1] === id || (!windows.includes(id) && !isServiceWindow(id))) return
    this.state.set((s) => ({ ...s, windows: [...windows.filter((w) => w !== id), id] }))
  }

  /** A shop or the like has closed: it leaves the order. */
  unstack(id: ServiceWindowId) {
    const windowsSource = this.state.get(),
      windows = windowsSource.windows
    if (windows.includes(id)) this.state.set((s) => ({ ...s, windows: windows.filter((w) => w !== id) }))
  }

  openModal(modal: ModalId | null) {
    this.state.set((s) => ({ ...s, modal }))
  }

  private set(change: (windows: GameState["windows"]) => GameState["windows"]) {
    const windows = change(this.state.get().windows)
    // only the windows the player opens and closes are remembered (ui.md §5)
    // blocked or full storage must not stop the window from opening or closing
    try {
      localStorage.setItem(this.key, JSON.stringify(windows.filter((w) => !isServiceWindow(w))))
    } catch {
      // nothing to keep this time
    }
    this.state.set((s) => ({ ...s, windows }))
  }
}
