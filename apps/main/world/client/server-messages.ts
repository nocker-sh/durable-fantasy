import { currentCreature } from "#/world/client/current-creature"
import { mergeWild } from "#/world/client/merge-wild"
import { currentPublication } from "#/world/client/player-publication"
import { sendToRoom } from "#/world/client/send-to-room"
import { serverNow } from "#/world/client/server-now"
import type { GameSession } from "#/world/client/game-session"
import { REASON_TEXT, type Reason } from "#/world/core/commands"
import { isShopId } from "#/world/core/is-shop-id"
import { MAPS } from "#/world/maps"
import { cellDistance } from "#/world/maps/cell-distance"
import { isMapId } from "#/world/maps/is-map-id"
import type { Cell, ServerMessage } from "#/world/protocol"
import { partyClosedText } from "#/world/parts/party-closed-text"
import { threadClosedText } from "#/world/parts/thread-closed-text"
import { tradeClosedText } from "#/world/parts/trade-closed-text"
import { lap } from "#/world/lap"
import type { Offer } from "#/world/state"
import type { ServerMessageContext } from "#/world/client/server-context"

export class ServerMessages {
  private reportedPlayerRevision = 0

  constructor(
    private readonly target: Pick<
      ServerMessageContext,
      "getScene" | "wayBeside" | "standBy" | "avatarOf" | "setPlayer" | "maybeReady" | "addChat" | "report" | "update" | "notify" | "toggleWindow" | "enterMap" | "connect" | "visitTown"
    > & {
      readonly session: Pick<
        GameSession,
        | "partyChat"
        | "net"
        | "arriveAt"
        | "others"
        | "mutes"
        | "socket"
        | "waiting"
        | "wild"
        | "fighting"
        | "art"
        | "state"
        | "engaged"
        | "fullTries"
        | "joinTries"
        | "warping"
        | "warpAgainAt"
        | "refusedWarp"
        | "rooms"
        | "wantChannel"
      >
    },
  ) {}
  handle(message: ServerMessage) {
    const scene = this.target.getScene()
    this.target.session.net.messages++
    if (import.meta.env.DEV) this.target.session.net.bytes += JSON.stringify(message).length
    switch (message.type) {
      case "snapshot": {
        // the room's clock: waits, recovery and the time of day are counted by it (game-system.md §7.5)
        if (message.now !== undefined && Number.isFinite(message.now)) this.target.update({ clockOffset: message.now - Date.now() })
        scene?.freeze(false)
        // let in: a later refusal or failed join starts counting again
        this.target.session.fullTries = 0
        this.target.session.joinTries = 0
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
        if (currentPublication(this.target.session.state.get().player, message.me)) this.target.setPlayer(message.me)
        if (this.target.session.state.get().player?.party) sendToRoom(this.target.session.socket, { type: "party-look", chat: this.target.session.partyChat })
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
        // a closed connection never comes back, so its mute is forgotten
        this.target.session.mutes.unmute(message.id)
        if (p) this.target.addChat({ channel: "system", text: `${p.name}が去っていった。` })
        return
      }
      case "moved": {
        this.target.session.others.move(message.id, message.path)
        scene?.moveRemote(message.id, message.path)
        return
      }
      case "whispered": {
        const from = message.sent ? undefined : message.from
        if (from && this.target.session.mutes.has(from)) return
        this.target.addChat({ channel: "whisper", name: message.name, text: message.text, self: !!message.sent, ...(from ? { from } : {}) })
        return
      }
      case "said": {
        const p = this.target.session.others.get(message.id)
        if (!p || this.target.session.mutes.has(message.id)) return
        scene?.bubble(message.id, message.text)
        this.target.addChat({ channel: "player", name: p.name, text: message.text, shout: message.shout, from: message.id })
        return
      }
      case "result": {
        // a result nobody asked for (the spoils of a fight): take it comes
        if (message.seq === -1) {
          const queued = this.target.session.art
          if (message.result.ok && queued && (message.result.state.ready[queued.skill] ?? 0) > serverNow(this.target.session.state.get())) this.target.session.art = null
          if (message.result.ok && currentPublication(this.target.session.state.get().player, message.result.state)) {
            this.target.setPlayer(message.result.state)
            const revision = message.result.state.revision ?? 0
            if (revision > 0 && message.result.events.length) {
              if (revision <= this.reportedPlayerRevision) return
              // Empty snapshots do not consume an event; commit before notifying so reentry cannot replay it.
              this.reportedPlayerRevision = revision
            }
            for (const e of message.result.events) this.target.report(e)
          }
          return
        }
        const waiter = this.target.session.waiting.get(message.seq)
        if (waiter) {
          waiter(message.result)
          this.target.session.waiting.delete(message.seq)
          return
        }
        // a reply after the command gave up waiting: what the server did still stands, so show it
        // (otherwise the old gold and bag stay on screen and the player buys again)
        if (message.result.ok && currentPublication(this.target.session.state.get().player, message.result.state)) {
          this.target.setPlayer(message.result.state)
          for (const e of message.result.events) this.target.report(e)
        }
        return
      }
      case "wild": {
        // kept for a scene still being built
        const previous = this.target.session.wild
        const next = mergeWild(previous, message.monsters, message.revision)
        if (next === previous) return
        this.target.session.wild = next
        const target = this.target.session.fighting?.monster
        if (target && next[target]?.hp === 0) {
          this.target.session.fighting = null
          scene?.stopFight(target)
        }
        scene?.setWild(next)
        return
      }
      case "thread-asked":
        if (this.declineMuted(message.from, "thread-answer")) return
        this.target.update({ threadAsk: { from: message.from, name: message.name } })
        return
      case "thread-closed":
        this.target.notify(threadClosedText(message.reason), "bad")
        return
      case "party-chat": {
        const session = this.target.session
        if (session.state.get().player?.party !== message.party) return
        const after = session.partyChat.party === message.party ? session.partyChat.seq : 0
        for (const line of message.lines) {
          if (line.seq > after) this.target.addChat({ channel: "party", name: line.name, text: line.text, self: line.self })
        }
        session.partyChat = { party: message.party, seq: Math.max(after, message.seq) }
        return
      }
      case "party-invited":
        if (this.declineMuted(message.from, "party-answer")) return
        this.target.update({ partyAsk: { from: message.from, name: message.name } })
        return
      case "party": {
        const before = this.target.session.state.get().party
        this.target.update({ party: message.view })
        if (!before && message.view) this.target.notify("パーティに入った。", "good")
        if (before && !message.view) this.target.notify("パーティを抜けた。")
        if (before && message.view) {
          const leader = message.view.members.find((member) => member.leader)
          if (leader && before.members.find((member) => member.leader)?.name !== leader.name)
            this.target.addChat({ channel: "system", text: leader.me ? "パーティのリーダーになった。" : `${leader.name}がパーティのリーダーになった。` })
          if (before.mode !== message.view.mode) this.target.addChat({ channel: "system", text: message.view.mode === "even" ? "経験値を均等に分けることになった。" : "経験値は各自のものになった。" })
        }
        return
      }
      case "party-closed": {
        this.target.notify(partyClosedText(message.reason), "bad")
        return
      }
      case "trade-asked":
        if (this.declineMuted(message.from, "trade-answer")) return
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
        const previous = this.target.session.wild[message.monster]
        if (!currentCreature(previous, message.revision)) return
        if (message.revision !== undefined && previous?.revision === message.revision) return
        this.target.session.wild = {
          ...this.target.session.wild,
          [message.monster]: { hp: message.hp, back: message.back, ...(message.combat ? { combat: message.combat } : {}), ...(message.revision !== undefined ? { revision: message.revision } : {}) },
        }
        if (message.hp === 0 && this.target.session.fighting?.monster === message.monster) this.target.session.fighting = null
        scene?.struck({
          id: message.monster,
          kind: message.swing.kind,
          damage: message.swing.kind === "miss" ? 0 : message.swing.damage,
          hp: message.hp,
          back: message.back,
          ...(message.combat ? { combat: message.combat } : {}),
        })
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
          this.target.update({ stock: { shop: message.shop, offers: message.offers as Offer[], buys: message.buys ?? {}, held: message.held ?? {} } })
        return
      }
      case "warped": {
        if (!isMapId(message.map)) return
        // the crossing was refused (not from a town): stay in the world we are still in
        if (message.world !== undefined && message.world !== this.target.session.rooms.world) {
          this.target.session.rooms.world = message.world
          this.target.session.wantChannel = null
        }
        this.target.enterMap(message.map, message.at)
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
          this.target.session.rooms.world = this.target.session.state.get().homeTown
          this.target.session.wantChannel = null
          this.target.enterMap("phanthiet", null)
          return
        }
        if (message.what === "whisper") {
          this.target.addChat({ channel: "system", text: "その人はこのあたりにいない。" })
          return
        }
        if (message.what === "say") {
          this.target.addChat({ channel: "system", text: "続けては叫べない。" })
          return
        }
        if (message.what === "party-chat") {
          this.target.addChat({ channel: "system", text: message.reason === "RATE_LIMIT" ? "続けては話せない。" : "パーティに入っていない。" })
          return
        }
        if (message.what === "art") {
          if (this.target.session.art?.monster === message.monster) this.target.session.art = null
          this.target.notify(message.reason && message.reason in REASON_TEXT ? REASON_TEXT[message.reason as Reason] : "使えなかった。", "bad")
          return
        }
        if (message.what === "attack") {
          if (message.monster) {
            if (this.target.session.art?.monster === message.monster) this.target.session.art = null
            scene?.stopFight(message.monster)
            if (this.target.session.fighting?.monster === message.monster) this.target.session.fighting = null
          }
          this.target.notify(message.reason && message.reason in REASON_TEXT && message.reason !== "NOT_READY" ? REASON_TEXT[message.reason as Reason] : "攻撃できなかった。", "bad")
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

  /** ミュートした相手からの申し込みは、知らせを出さずに断る（ui.md §3.18）。 */
  private declineMuted(from: string, answer: "trade-answer" | "party-answer" | "thread-answer"): boolean {
    if (!this.target.session.mutes.has(from)) return false
    this.target.session.socket?.send({ type: answer, from, yes: false })
    return true
  }
}
