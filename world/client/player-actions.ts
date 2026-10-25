import type { GameSession } from "./session.ts"
import { artBlocked, skillOf, skillOfKey, type SkillId } from "../core/skills.ts"
import { stationAt } from "../town/stations.ts"
import { nodeOf } from "../core/gather.ts"
import { sellable, type Quality } from "../core/items.ts"
import { REASON_TEXT } from "../core/commands.ts"
import type { Stat } from "../core/growth.ts"
import { ITEMS, type ItemId, type Slot } from "../core/items.ts"
import type { NECK_RAMPS, HotbarEntry, NeckKind } from "../core/player.ts"
import type { GameContext } from "./context.ts"

export class PlayerActions {
  constructor(
    private readonly target: Pick<GameContext, "run" | "lookAtShop" | "getScene" | "update" | "notify"> & { readonly session: Pick<GameSession, "socket" | "state" | "engaged" | "fighting"> },
  ) {}
  revive() {
    this.target.session.socket?.send({ type: "revive" })
  }

  buy(item: ItemId, count = 1, q?: Quality, price?: number) {
    const shop = this.target.session.state.get().shop
    if (!shop) return
    void this.target.run({ type: "buy", shop, item, count, ...(q !== undefined ? { q } : {}), ...(price !== undefined ? { price } : {}) }).then(() => this.target.lookAtShop())
  }

  gather(node: string) {
    if (this.target.session.state.get().busy || this.target.session.engaged) return
    const spot = nodeOf(node)
    if (!spot) return
    this.target.getScene()?.playAction(spot.kind === "tree" ? "chop" : spot.kind === "fish" ? "draw" : "scrub", spot.cell)
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "gather", seq, node }))
  }

  craft(recipe: string) {
    const station = this.target.session.state.get().craft
    if (!station || this.target.session.state.get().busy) return
    const s = stationAt(station)
    if (s) this.target.getScene()?.playAction(s.kind === "forge" ? "hammer" : s.kind === "hearth" ? "knead" : "knead", s.cell)
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "craft", seq, station, recipe }))
  }

  closeCraft() {
    this.target.update({ craft: null })
  }

  order(commission: string) {
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "order", seq, commission }))
  }

  collect(index: number) {
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "collect", seq, index }))
  }

  openBoard(symbol?: string) {
    const first = this.target.session.state.get().player?.bag.find((s) => s && sellable(s.item))
    const sym = symbol ?? this.target.session.state.get().board?.symbol ?? (first ? (first.q !== undefined ? `${first.item}@${first.q}` : first.item) : "log")
    this.target.update({ board: { symbol: sym, view: this.target.session.state.get().board?.symbol === sym ? this.target.session.state.get().board!.view : null } })
    this.target.session.socket?.send({ type: "ex-look", symbol: sym })
  }

  closeBoard() {
    this.target.update({ board: null })
  }

  async placeOrder(o: { side: "buy" | "sell"; price: number; qty: number; market?: boolean; slot?: number }) {
    const board = this.target.session.state.get().board
    if (!board) return
    await this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "ex-place", seq, symbol: board.symbol, ...o }))
    this.openBoard(board.symbol)
  }

  async cancelOrder(id: string) {
    await this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "ex-cancel", seq, id }))
    this.openBoard()
  }

  async claimInbox() {
    await this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "ex-claim", seq }))
    this.openBoard()
  }

  store(slot: number, count: number) {
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "storage", seq, action: "store", index: slot, count }))
  }

  retrieve(index: number, count: number) {
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "storage", seq, action: "retrieve", index, count }))
  }

  useSkill(skill: SkillId) {
    if (skill === "sit") return this.toggleSit()
    const s = skillOf(skill)
    if (s.kind === "action" || s.kind === "prayer") return void this.target.run({ type: "cast", skill })
    // an art's blow goes at what we are fighting: struck within the last few seconds
    const p = this.target.session.state.get().player
    const blocked = p && artBlocked(skill, p)
    if (blocked) return this.target.notify(REASON_TEXT[blocked], "bad")
    if (!this.target.session.fighting || performance.now() - this.target.session.fighting.at > 4000) return this.target.notify("戦っている相手がいない。生き物をクリックしてから使おう。", "bad")
    this.target.session.socket?.send({ type: "attack", monster: this.target.session.fighting.monster, art: skill })
  }

  toggleSit() {
    const p = this.target.session.state.get().player
    if (!p || this.target.session.state.get().me.walking) return
    void this.target.run({ type: p.sitting ? "stand" : "sit" })
  }

  sell(slot: number, count = 1) {
    const shop = this.target.session.state.get().shop
    if (shop) void this.target.run({ type: "sell", shop, slot, count }).then(() => this.target.lookAtShop())
  }

  useSlot(slot: number) {
    const stack = this.target.session.state.get().player?.bag[slot]
    if (!stack) return
    if (ITEMS[stack.item].equip) void this.target.run({ type: "equip", slot })
    else void this.target.run({ type: "use", slot })
  }

  equip(slot: number, to?: Slot) {
    void this.target.run({ type: "equip", slot, to })
  }

  unequip(slot: Slot) {
    void this.target.run({ type: "unequip", slot })
  }

  moveSlot(from: number, to: number) {
    if (from !== to) void this.target.run({ type: "move", from, to })
  }

  raise(stat: Stat) {
    void this.target.run({ type: "raise", stat })
  }

  bindHotbar(index: number, item: HotbarEntry | null) {
    void this.target.run({ type: "hotbar", index, item })
  }

  useHotbar(index: number) {
    const item = this.target.session.state.get().player?.hotbar[index]
    if (!item) return
    // a skill: use it (sitting sits down or gets up)
    const skill = skillOfKey(item)
    if (skill) this.useSkill(skill)
    else void this.target.run({ type: "use-item", item: item as ItemId })
  }

  setProfile(name: string, look: number, neck: NeckKind, neckRamp: (typeof NECK_RAMPS)[number]) {
    return this.target.run({ type: "profile", name, look, neck, neckRamp })
  }
}
