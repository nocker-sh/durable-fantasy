import type { GameSession } from "#/world/client/game-session"
import type { GameContext } from "#/world/client/context"
import { sendToRoom } from "#/world/client/send-to-room"
import { TRADE_GOLD_MAX, TRADE_LOTS } from "#/world/core/trade-rules"
import { mayCrossWorldsFrom } from "#/world/maps/may-cross-worlds-from"
import { moveBlockedText } from "#/world/parts/move-blocked-text"

export class SocialActions {
  constructor(
    private readonly target: Pick<GameContext, "update" | "notify" | "enterMap" | "addChat" | "getScene"> & {
      readonly session: Pick<GameSession, "socket" | "others" | "mutes" | "state" | "rooms" | "engaged" | "wantChannel">
    },
  ) {}
  askTrade(id: string) {
    this.target.update({ playerMenu: null })
    sendToRoom(this.target.session.socket, { type: "trade-ask", target: id })
    const p = this.target.session.others.get(id)
    if (p) this.target.notify(`${p.name}に取引を申し込んだ。`)
  }

  closePlayerMenu() {
    this.target.update({ playerMenu: null })
  }

  /** 名札から選んだ相手をミュートし、出ている発言を消して、待っている申し込みを断る（ui.md §3.18）。 */
  mute(id: string) {
    const state = this.target.session.state.get()
    const name = this.target.session.others.get(id)?.name ?? state.playerMenu?.name

    this.target.update({ playerMenu: null })
    this.target.session.mutes.mute(id)
    if (state.tradeAsk?.from === id) this.answerTrade(false)
    if (state.partyAsk?.from === id) this.answerParty(false)
    if (state.threadAsk?.from === id) this.answerThread(false)
    this.target.update((current) => ({ chat: current.chat.filter((line) => line.from !== id) }))
    this.target.getScene()?.hush(id)
    if (name) this.target.notify(`${name}をミュートした。`)
  }

  unmute(id: string) {
    const name = this.target.session.others.get(id)?.name ?? this.target.session.state.get().playerMenu?.name

    this.target.update({ playerMenu: null })
    this.target.session.mutes.unmute(id)
    if (name) this.target.notify(`${name}のミュートを解いた。`)
  }

  askThread(id: string) {
    this.target.update({ playerMenu: null })
    sendToRoom(this.target.session.socket, { type: "thread-ask", target: id })
    const p = this.target.session.others.get(id)
    if (p) this.target.notify(`${p.name}にマフラーの糸の交換を申し出た。`)
  }

  answerThread(yes: boolean) {
    const ask = this.target.session.state.get().threadAsk
    if (!ask) return
    this.target.update({ threadAsk: null })
    sendToRoom(this.target.session.socket, { type: "thread-answer", from: ask.from, yes })
  }

  visitTown(town: number) {
    const state = this.target.session.state.get()
    if (town === this.target.session.rooms.world) return
    const blocked = moveBlockedText(state)
    if (blocked) return this.target.notify(blocked, "bad")
    if (!mayCrossWorldsFrom(state.map.id)) {
      this.target.notify("町の外では糸をたどれない。", "bad")
      return
    }
    const home = town === state.homeTown
    const friend = [...(state.player?.threads ?? [])].reverse().find((thread) => thread.town === town)
    this.target.session.rooms.world = town
    this.target.session.wantChannel = null
    this.target.enterMap("phanthiet", null)
    this.target.addChat({ channel: "system", text: home ? "マフラーに引かれて、自分の町に帰った。" : `糸をたどって、${friend ? `${friend.name}の町` : `町${town}`}に渡った。` })
  }

  inviteParty(id: string) {
    this.target.update({ playerMenu: null })
    sendToRoom(this.target.session.socket, { type: "party-invite", target: id })
    const p = this.target.session.others.get(id)
    if (p) this.target.notify(`${p.name}をパーティに誘った。`)
  }

  answerParty(yes: boolean) {
    const ask = this.target.session.state.get().partyAsk
    if (!ask) return
    this.target.update({ partyAsk: null })
    sendToRoom(this.target.session.socket, { type: "party-answer", from: ask.from, yes })
  }

  leaveParty() {
    sendToRoom(this.target.session.socket, { type: "party-leave" })
  }

  kickPartyMember(member: number, name: string, key: string) {
    sendToRoom(this.target.session.socket, { type: "party-kick", member, name, key })
  }

  passPartyLead(member: number, name: string, key: string) {
    sendToRoom(this.target.session.socket, { type: "party-lead", member, name, key })
  }

  setPartyMode(mode: "own" | "even") {
    sendToRoom(this.target.session.socket, { type: "party-mode", mode })
  }

  answerTrade(yes: boolean) {
    const ask = this.target.session.state.get().tradeAsk
    if (!ask) return
    this.target.update({ tradeAsk: null })
    sendToRoom(this.target.session.socket, { type: "trade-answer", from: ask.from, yes })
  }

  offerTrade(lots: { slot: number; count: number }[], gold: number) {
    // a side holds TRADE_LOTS lots and up to TRADE_GOLD_MAX (core/trade-rules.ts); the room would drop the socket on more
    if (lots.length > TRADE_LOTS || gold > TRADE_GOLD_MAX) return this.target.notify("これ以上は出せない。", "bad")
    sendToRoom(this.target.session.socket, { type: "trade-offer", lots, gold })
  }

  lockTrade() {
    sendToRoom(this.target.session.socket, { type: "trade-lock" })
  }

  goTrade() {
    sendToRoom(this.target.session.socket, { type: "trade-go" })
  }

  cancelTrade() {
    sendToRoom(this.target.session.socket, { type: "trade-cancel" })
  }
}
