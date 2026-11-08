import { sameCommissionOrders } from "#/world/core/same-commission-orders"
import type { Order } from "#/world/core/commission-types"
import { sameStack } from "#/world/core/same-stack"
import type { Stack } from "#/world/core/bag-types"
import { apply } from "#/world/core/apply"
import { derive } from "#/world/core/derive"
import type { GameSession } from "#/world/client/game-session"
import { skillOf } from "#/world/core/skill-of"
import { skillOfKey } from "#/world/core/skill-of-key"
import type { SkillId } from "#/world/core/skill-types"
import { stationAt } from "#/world/town/stations"
import { nodeOf } from "#/world/core/node-of"
import { gatheringTool } from "#/world/core/gathering-tool"
import { sellable } from "#/world/core/items/sellable"
import type { Quality, Skill } from "#/world/core/items/kinds"
import { REASON_TEXT } from "#/world/core/commands"
import type { Stat } from "#/world/core/growth-types"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import type { ShopId } from "#/world/core/shop-types"
import type { Slot } from "#/world/core/items/kinds"
import type { NECK_RAMPS } from "#/world/core/player-rules"
import type { HotbarEntry } from "#/world/core/player-types"
import type { NeckKind } from "#/world/core/player-types"
import type { GameContext } from "#/world/client/context"

export class PlayerActions {
  constructor(
    private readonly target: Pick<GameContext, "run" | "lookAtShop" | "getScene" | "update" | "notify"> & { readonly session: Pick<GameSession, "socket" | "state" | "engaged" | "fighting" | "art"> },
  ) {}
  revive() {
    this.target.session.socket?.send({ type: "revive" })
  }

  buy(inputProps: { item: ItemId; count?: number; q?: Quality; price?: number; shop?: ShopId }) {
    const item = inputProps.item
    const count = inputProps.count === undefined ? 1 : inputProps.count
    const q = inputProps.q
    const price = inputProps.price

    const shop = this.target.session.state.get().shop
    if (!shop || (inputProps.shop !== undefined && inputProps.shop !== shop)) return
    const socket = this.target.session.socket
    void this.target.run({ type: "buy", shop, item, count, ...(q !== undefined ? { q } : {}), ...(price !== undefined ? { price } : {}) }).then(() => {
      if (this.target.session.socket !== socket || this.target.session.state.get().shop !== shop) return
      this.target.lookAtShop()
    })
  }

  async gather(node: string): Promise<boolean> {
    if (this.target.session.state.get().busy || this.target.session.engaged) return false
    const spot = nodeOf(node)
    if (!spot) return false
    const player = this.target.session.state.get().player
    if (player && spot.needsTool && !gatheringTool(player, spot.skill)) {
      const tool = { woodcutting: "斧", fishing: "釣り竿", foraging: "鎌" }[spot.skill]
      this.target.notify(`使える${tool}を持っていない。`, "bad")
      return false
    }
    this.target.getScene()?.playAction(spot.kind === "tree" ? "chop" : spot.kind === "fish" ? "draw" : "scrub", spot.cell)
    return this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "gather", seq, node }))
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

  collect(index: number, expectedOrders?: readonly Order[]) {
    const orders = this.target.session.state.get().player?.orders
    if (expectedOrders && (!orders || !sameCommissionOrders(orders, expectedOrders))) {
      this.target.notify(REASON_TEXT.ORDER_CHANGED, "bad")
      return
    }
    if (!orders?.[index]) return
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "collect", seq, index, orders }))
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
    const socket = this.target.session.socket
    await this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "ex-place", seq, symbol: board.symbol, ...o }))
    this.refreshBoard(socket)
  }

  async cancelOrder(id: string) {
    const socket = this.target.session.socket
    await this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "ex-cancel", seq, id }))
    this.refreshBoard(socket)
  }

  async claimInbox() {
    const socket = this.target.session.socket
    await this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "ex-claim", seq }))
    this.refreshBoard(socket)
  }

  private refreshBoard(socket: GameSession["socket"]) {
    if (this.target.session.socket !== socket) return
    const board = this.target.session.state.get().board
    if (board) socket?.send({ type: "ex-look", symbol: board.symbol })
  }

  store(slot: number, count: number, expectedStack?: Stack) {
    const stack = this.target.session.state.get().player?.bag[slot]
    if (expectedStack && !sameStack(stack, expectedStack)) {
      this.target.notify(REASON_TEXT.ITEM_CHANGED, "bad")
      return
    }
    if (!stack) return
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "storage", seq, action: "store", index: slot, count, stack }))
  }

  retrieve(index: number, count: number, expectedStack?: Stack) {
    const stack = this.target.session.state.get().player?.storage[index]
    if (expectedStack && !sameStack(stack, expectedStack)) {
      this.target.notify(REASON_TEXT.ITEM_CHANGED, "bad")
      return
    }
    if (!stack) return
    void this.target.run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "storage", seq, action: "retrieve", index, count, stack }))
  }

  useSkill(skill: SkillId) {
    if (skill === "sit") return this.toggleSit()
    const s = skillOf(skill)
    if (s.kind === "action" || s.kind === "prayer") return void this.target.run({ type: "cast", skill })
    // an art's blow goes at what we are fighting: struck within the last few seconds
    const p = this.target.session.state.get().player
    if (!p) return
    // Preview the same recovery and cost rules; only the server commits the result.
    const preview = apply(p, { type: "art", skill }, { now: Date.now() })
    if (!preview.ok) return this.target.notify(REASON_TEXT[preview.reason], "bad")
    const fighting = this.target.session.fighting
    const now = performance.now()
    if (!fighting || now - fighting.at > 4000) return this.target.notify("戦っている相手がいない。", "bad")
    // an art is a swing too: too soon after the last one, it takes the place of the next
    if (now - fighting.at < derive(p).attackDelay * 0.85) {
      this.target.session.art = { skill, at: now }
      return
    }
    this.target.session.art = null
    fighting.at = now
    this.target.session.socket?.send({ type: "attack", monster: fighting.monster, art: skill })
  }

  toggleSit() {
    const p = this.target.session.state.get().player
    if (!p || this.target.session.state.get().me.walking) return
    void this.target.run({ type: p.sitting ? "stand" : "sit" })
  }

  sell(inputProps: { slot: number; count?: number; expectedStack?: Stack; shop?: ShopId }) {
    const slot = inputProps.slot
    const count = inputProps.count === undefined ? 1 : inputProps.count
    const expectedStack = inputProps.expectedStack ?? this.target.session.state.get().player?.bag[slot] ?? undefined
    const shop = this.target.session.state.get().shop
    if (!shop || !expectedStack || (inputProps.shop !== undefined && inputProps.shop !== shop)) return
    const socket = this.target.session.socket
    void this.target.run({ type: "sell", shop, slot, count, expectedStack }).then(() => {
      if (this.target.session.socket !== socket || this.target.session.state.get().shop !== shop) return
      this.target.lookAtShop()
    })
  }

  useSlot(slot: number, stack = this.target.session.state.get().player?.bag[slot] ?? undefined) {
    if (!stack) return
    if (ITEMS[stack.item].equip) void this.target.run({ type: "equip", slot, expectedStack: stack })
    else void this.target.run({ type: "use", slot, expectedStack: stack })
  }

  equip(slot: number, to?: Slot, expectedStack = this.target.session.state.get().player?.bag[slot] ?? undefined) {
    if (!expectedStack) return
    void this.target.run({ type: "equip", slot, to, expectedStack })
  }

  unequip(slot: Slot, expectedStack?: Stack) {
    const player = this.target.session.state.get().player,
      item = player?.equipment[slot]
    const selected = expectedStack ?? (item ? { item, count: 1, ...player?.worn[slot] } : undefined)
    if (selected) void this.target.run({ type: "unequip", slot, expectedStack: selected })
  }

  moveSlot(from: number, to: number, expectedStack = this.target.session.state.get().player?.bag[from] ?? undefined) {
    const expectedTarget = this.target.session.state.get().player?.bag[to] ?? null
    if (from !== to && expectedStack) void this.target.run({ type: "move", from, to, expectedStack, expectedTarget })
  }

  discard(slot: number, count: number, expectedStack = this.target.session.state.get().player?.bag[slot] ?? undefined) {
    if (expectedStack) void this.target.run({ type: "discard", slot, count, expectedStack })
  }

  forgetLife(skill: Skill, exp: number) {
    return this.target.run({ type: "forget-life", skill, exp })
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

  setProfile(inputProps: { name: string; look: number; neck: NeckKind; neckRamp: (typeof NECK_RAMPS)[number] }) {
    const name = inputProps.name
    const look = inputProps.look
    const neck = inputProps.neck
    const neckRamp = inputProps.neckRamp

    return this.target.run({ type: "profile", name, look, neck, neckRamp })
  }
}
