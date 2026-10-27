import type { GameSession } from "./session.ts"
import { REASON_TEXT, type Reason } from "../core/commands.ts"
import { isShopId } from "../core/shops.ts"
import { MAPS, cellDistance, isMapId } from "../maps/index.ts"
import type { Cell, ServerMessage } from "../protocol.ts"
import { partyClosedText, threadClosedText, tradeClosedText } from "../parts/report.ts"
import { lap } from "../diagnostics.ts"
import type { Offer } from "../state.ts"
import type { ServerMessageContext } from "./server-context.ts"

export class ServerMessages {
  constructor(
    private readonly target: Pick<
      ServerMessageContext,
      "getScene" | "wayBeside" | "standBy" | "avatarOf" | "setPlayer" | "maybeReady" | "addChat" | "report" | "update" | "notify" | "toggleWindow" | "enterMap" | "connect" | "visitTown"
    > & {
      readonly session: Pick<GameSession, "net" | "arriveAt" | "others" | "socket" | "waiting" | "wild" | "fighting" | "state" | "engaged" | "fullTries" | "warping" | "warpAgainAt" | "refusedWarp">
    },
  ) {}
  handle(message: ServerMessage) {
    const scene = this.target.getScene()
    this.target.session.net.messages++
    if (import.meta.env.DEV) this.target.session.net.bytes += JSON.stringify(message).length
    switch (message.type) {
      case "snapshot": {
        scene?.freeze(false)
        if (message.at) {
          this.target.session.arriveAt = message.at
          scene?.placePlayer(message.at)
        }
        lap("room: welcomed")
        // arrived beside a way out (or at a door): its room is got ready straight away
        {
          const beside = this.target.wayBeside(this.target.session.arriveAt)
          if (beside) window.setTimeout(() => this.target.standBy(beside), 0)
        }
        this.target.session.others.welcome(message.you, message.players)
        scene?.clearRemotes()
        for (const p of message.players) scene?.addRemote(p.id, this.target.avatarOf(p), p.at)
        this.target.setPlayer(message.me)
        if (message.me.party) this.target.session.socket?.send({ type: "party-look" })
        this.target.maybeReady()
        return
      }
      case "joined": {
        if (message.player.id === this.target.session.others.you) return
        if (this.target.session.others.join(message.player)) scene?.updateRemote(message.player.id, this.target.avatarOf(message.player))
        else {
          scene?.addRemote(message.player.id, this.target.avatarOf(message.player), message.player.at)
          this.target.addChat({ channel: "system", text: `${message.player.name}がやってきた。` })
        }
        return
      }
      case "left": {
        const p = this.target.session.others.leave(message.id)
        scene?.removeRemote(message.id)
        if (p) this.target.addChat({ channel: "system", text: `${p.name}が去っていった。` })
        return
      }
      case "moved": {
        this.target.session.others.move(message.id, message.path)
        scene?.moveRemote(message.id, message.path)
        return
      }
      case "said": {
        const p = this.target.session.others.get(message.id)
        if (!p) return
        scene?.bubble(message.id, message.text)
        this.target.addChat({ channel: "player", name: p.name, text: message.text, shout: message.shout })
        return
      }
      case "result": {
        // a result nobody asked for (the spoils of a fight): take it comes
        if (message.seq === -1) {
          if (message.result.ok) {
            this.target.setPlayer(message.result.state)
            for (const e of message.result.events) this.target.report(e)
          }
          return
        }
        this.target.session.waiting.get(message.seq)?.(message.result)
        this.target.session.waiting.delete(message.seq)
        return
      }
      case "wild": {
        // kept for a scene still being built
        this.target.session.wild = message.monsters
        scene?.setWild(message.monsters)
        return
      }
      case "thread-asked":
        this.target.update({ threadAsk: { from: message.from, name: message.name } })
        return
      case "thread-closed":
        this.target.notify(threadClosedText(message.reason), "bad")
        return
      case "party-invited":
        this.target.update({ partyAsk: { from: message.from, name: message.name } })
        return
      case "party": {
        const before = this.target.session.state.get().party
        this.target.update({ party: message.view })
        if (!before && message.view) this.target.notify("パーティに入った。", "good")
        if (before && !message.view) this.target.notify("パーティを抜けた。")
        return
      }
      case "party-closed": {
        this.target.notify(partyClosedText(message.reason), "bad")
        return
      }
      case "trade-asked":
        this.target.update({ tradeAsk: { from: message.from, name: message.name } })
        return
      case "trade-view":
        if (!this.target.session.state.get().trade) {
          this.target.getScene()?.freeze(true)
          if (!this.target.session.state.get().windows.includes("inventory")) this.target.toggleWindow("inventory")
        }
        this.target.update({ trade: { with: message.with, name: message.name, mine: message.mine, lots: message.lots, theirs: message.theirs } })
        return
      case "trade-closed": {
        const was = this.target.session.state.get().trade
        this.target.update({ trade: null, tradeAsk: null })
        if (was) this.target.getScene()?.freeze(!!this.target.session.engaged)
        this.target.notify(tradeClosedText(message.reason), message.reason === "DONE" ? "good" : "bad")
        return
      }
      case "hitback": {
        scene?.hurt(message.target === this.target.session.others.you ? "me" : message.target, message.swing.kind, message.swing.kind === "miss" ? 0 : message.swing.damage)
        return
      }
      case "struck": {
        this.target.session.wild = { ...this.target.session.wild, [message.monster]: { hp: message.hp, back: message.back } }
        if (message.hp === 0 && this.target.session.fighting?.monster === message.monster) this.target.session.fighting = null
        scene?.struck(message.monster, message.swing.kind, message.swing.kind === "miss" ? 0 : message.swing.damage, message.hp, message.back)
        return
      }
      case "exchange": {
        if (this.target.session.state.get().board?.symbol === message.symbol) this.target.update({ board: { symbol: message.symbol, view: message.view } })
        return
      }
      case "nodes": {
        this.target.update((s) => ({ nodes: { ...s.nodes, ...message.left } }))
        this.target.getScene()?.setNodes(this.target.session.state.get().nodes)
        return
      }
      case "stock": {
        if (isShopId(message.shop) && message.shop === this.target.session.state.get().shop)
          this.target.update({ stock: { shop: message.shop, offers: message.offers as Offer[], buys: message.buys ?? {} } })
        return
      }
      case "warped": {
        if (isMapId(message.map)) this.target.enterMap(message.map, message.at)
        return
      }
      case "refused": {
        if (message.what === "move" && message.at) {
          this.target.session.arriveAt = message.at
          scene?.placePlayer(message.at)
          return
        }
        if (message.what === "join" && message.reason === "FULL" && this.target.session.fullTries++ < 3) {
          // that channel filled up as we came: ask again
          this.target.session.socket?.close()
          this.target.session.socket = null
          void this.target.connect(this.target.session.state.get().map.id)
          return
        }
        if (message.what === "join" && message.reason === "NOT_YOUR_TOWN") {
          // no thread leads here: our muffler takes us home
          this.target.notify("この町へつながる糸を持っていない。", "bad")
          this.target.visitTown(this.target.session.state.get().homeTown)
          return
        }
        if (message.what === "art") {
          this.target.notify(REASON_TEXT[message.reason && message.reason in REASON_TEXT ? (message.reason as Reason) : "COOLDOWN"], "bad")
          return
        }
        if (message.what === "attack") {
          if (message.monster) {
            scene?.stopFight(message.monster)
            if (this.target.session.fighting?.monster === message.monster) this.target.session.fighting = null
          }
          this.target.notify(REASON_TEXT[message.reason && message.reason in REASON_TEXT ? (message.reason as Reason) : "EXHAUSTED"], "bad")
          return
        }
        if (message.what === "warp") {
          this.target.session.warping = false
          // no reason given: the server had us a step short; try again in a moment rather than waiting to be stepped off
          if (!message.reason) {
            this.target.session.warpAgainAt = performance.now() + 1200
            return
          }
          this.target.session.refusedWarp = MAPS[this.target.session.state.get().map.id].warps.findIndex((w) => {
            const c = this.target.getScene()?.playerCell()
            return !!c && cellDistance(w.at as Cell, c) <= 1
          })
          this.target.notify(message.reason in REASON_TEXT ? REASON_TEXT[message.reason as Reason] : "そこからは移れない。", "bad")
        }
        return
      }
    }
  }
}
