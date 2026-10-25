// The keyboard (ui.md §4): Esc closes the front-most thing, letters open windows, WASD and the
// arrows walk while held. Single letters do nothing while typing in a field.
import { HOTBAR_SIZE } from "../core/player.ts"
import { KEPT_ON_ESC, fullyShown, type GameState, type ModalId, type WindowId } from "../state.ts"

/** Keys that walk, and which way on screen: right is +x, up is +y. */
const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, 1],
  KeyS: [0, -1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
  ArrowUp: [0, 1],
  ArrowDown: [0, -1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
}

/** What the keys can do to the game. */
export interface KeyTarget {
  readonly state: { get(): GameState }
  toggleDebug(): void
  setTyping(typing: boolean): void
  openModal(modal: ModalId | null): void
  answerTrade(yes: boolean): void
  answerParty(yes: boolean): void
  answerThread(yes: boolean): void
  cancelTrade(): void
  closePlayerMenu(): void
  closeDialogue(): void
  closeShop(): void
  closeCraft(): void
  closeCommission(): void
  closeStorage(): void
  closeBoard(): void
  closeWindow(id: WindowId): void
  toggleWindow(id: WindowId): void
  stopWalking(): void
  rotate(steps: number): void
  advanceDialogue(): void
  choose(index: number): void
  useHotbar(index: number): void
  toggleSit(): void
  /** walk on along this screen direction while it is held, or stop */
  hold(dir: [number, number] | null): void
}

export class Keys {
  /** the movement keys held down */
  private held = new Set<string>()
  private stop: (() => void) | null = null

  constructor(private readonly game: KeyTarget) {}

  listen() {
    const down = (event: KeyboardEvent) => this.down(event)
    const up = (event: KeyboardEvent) => {
      if (this.held.delete(event.code)) this.steer()
    }
    const blur = () => {
      this.held.clear()
      this.steer()
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("blur", blur)
    this.stop = () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("blur", blur)
    }
  }

  unlisten() {
    this.stop?.()
    this.stop = null
  }

  private down(event: KeyboardEvent) {
    const g = this.game
    if (event.isComposing || event.metaKey || event.ctrlKey) return
    if (import.meta.env.DEV && (event.key === "F1" || event.key === "`")) {
      g.toggleDebug()
      event.preventDefault()
      return
    }
    const target = event.target as HTMLElement | null
    const inField = !!target?.closest("input, textarea, select, [contenteditable='true']")
    const s = g.state.get()
    if (event.key === "Escape") {
      event.preventDefault()
      if (inField) target!.blur()
      if (s.typing) g.setTyping(false)
      else if (s.modal) g.openModal(null)
      else if (s.tradeAsk) g.answerTrade(false)
      else if (s.partyAsk) g.answerParty(false)
      else if (s.threadAsk) g.answerThread(false)
      else if (s.trade) g.cancelTrade()
      else if (s.playerMenu) g.closePlayerMenu()
      else if (s.dialogue) g.closeDialogue()
      else if (s.shop) g.closeShop()
      else if (s.craft) g.closeCraft()
      else if (s.commission) g.closeCommission()
      else if (s.storage) g.closeStorage()
      else if (s.board) g.closeBoard()
      else if (s.windows.some((w) => !KEPT_ON_ESC.includes(w))) g.closeWindow(s.windows.filter((w) => !KEPT_ON_ESC.includes(w)).at(-1)!)
      else if (s.me.walking) g.stopWalking()
      else g.openModal("system")
      return
    }
    if (inField || s.modal || s.loading) return
    if (event.key === "Enter") {
      g.setTyping(true)
      event.preventDefault()
      return
    }
    const key = event.key.toLowerCase()
    if (event.altKey) {
      const alt: Partial<Record<string, WindowId>> = { KeyE: "inventory", KeyQ: "equipment", KeyA: "stats", KeyC: "chat" }
      const id = alt[event.code]
      if (id) {
        g.toggleWindow(id)
        event.preventDefault()
      }
      return
    }
    if (event.shiftKey && (key === "q" || key === "e")) {
      g.rotate(key === "q" ? 1 : -1)
      return
    }
    if (s.dialogue) {
      const lastPage = s.dialogue.page >= s.dialogue.pages.length - 1 && fullyShown(s.dialogue)
      if (event.key === " ") {
        g.advanceDialogue()
        event.preventDefault()
        return
      }
      const n = Number(event.key)
      if (lastPage && n >= 1 && n <= s.dialogue.choices.length) {
        g.choose(n - 1)
        event.preventDefault()
        return
      }
    }
    // WASD and the arrows walk, a cell at a time, while held; not while talking or trading
    if (event.code in MOVE_KEYS && !event.shiftKey && !event.altKey) {
      event.preventDefault()
      if (s.dialogue || s.shop || s.trade || s.craft || s.commission || s.storage || s.board) return
      this.held.add(event.code)
      this.steer()
      return
    }
    if (/^[0-9]$/.test(event.key)) {
      const n = Number(event.key)
      g.useHotbar(n === 0 ? HOTBAR_SIZE - 1 : n - 1)
      return
    }
    if (event.key === "Tab") {
      g.toggleWindow("minimap")
      event.preventDefault()
    } else if (key === "i") g.toggleWindow("inventory")
    else if (key === "e") g.toggleWindow("equipment")
    else if (key === "c") g.toggleWindow("stats")
    else if (key === "m") g.toggleWindow("worldmap")
    else if (key === "j") g.toggleWindow("errands")
    else if (key === "k") g.toggleWindow("skills")
    else if (key === "f") g.toggleWindow("friends")
    else if (key === "z") g.toggleSit()
  }

  /** Tell the scene which way the held keys point. */
  private steer() {
    let x = 0,
      y = 0
    for (const code of this.held) {
      x += MOVE_KEYS[code][0]
      y += MOVE_KEYS[code][1]
    }
    this.game.hold(x || y ? [Math.sign(x), Math.sign(y)] : null)
  }
}
