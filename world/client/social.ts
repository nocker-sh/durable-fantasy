import type { GameSession } from "#/world/client/game-session"
import type { GameContext } from "./context"

export class SocialActions {
  constructor(
    private readonly target: Pick<GameContext, "update" | "notify" | "enterMap" | "addChat"> & {
      readonly session: Pick<GameSession, "socket" | "others" | "state" | "rooms" | "engaged" | "wantChannel">
    },
  ) {}
  askTrade(id: string) {
    this.target.update({ playerMenu: null })
    this.target.session.socket?.send({ type: "trade-ask", target: id })
    const p = this.target.session.others.get(id)
    if (p) this.target.notify(`${p.name}に取引を申し込んだ。`)
  }

  closePlayerMenu() {
    this.target.update({ playerMenu: null })
  }

  askThread(id: string) {
    this.target.update({ playerMenu: null })
    this.target.session.socket?.send({ type: "thread-ask", target: id })
    const p = this.target.session.others.get(id)
    if (p) this.target.notify(`${p.name}にマフラーの糸の交換を申し出た。`)
  }

  answerThread(yes: boolean) {
    const ask = this.target.session.state.get().threadAsk
    if (!ask) return
    this.target.update({ threadAsk: null })
    this.target.session.socket?.send({ type: "thread-answer", from: ask.from, yes })
  }

  visitTown(town: number) {
    if (town === this.target.session.rooms.world || this.target.session.engaged || this.target.session.state.get().trade) return
    const home = town === this.target.session.state.get().homeTown
    this.target.session.rooms.world = town
    this.target.session.wantChannel = null
    this.target.enterMap("phanthiet", null)
    this.target.addChat({ channel: "system", text: home ? "マフラーに引かれて、自分の町に帰った。" : `糸をたどって、町${town}に渡った。` })
  }

  inviteParty(id: string) {
    this.target.update({ playerMenu: null })
    this.target.session.socket?.send({ type: "party-invite", target: id })
    const p = this.target.session.others.get(id)
    if (p) this.target.notify(`${p.name}をパーティに誘った。`)
  }

  answerParty(yes: boolean) {
    const ask = this.target.session.state.get().partyAsk
    if (!ask) return
    this.target.update({ partyAsk: null })
    this.target.session.socket?.send({ type: "party-answer", from: ask.from, yes })
  }

  leaveParty() {
    this.target.session.socket?.send({ type: "party-leave" })
  }

  setPartyMode(mode: "own" | "even") {
    this.target.session.socket?.send({ type: "party-mode", mode })
  }

  answerTrade(yes: boolean) {
    const ask = this.target.session.state.get().tradeAsk
    if (!ask) return
    this.target.update({ tradeAsk: null })
    this.target.session.socket?.send({ type: "trade-answer", from: ask.from, yes })
  }

  offerTrade(lots: { slot: number; count: number }[], gold: number) {
    this.target.session.socket?.send({ type: "trade-offer", lots, gold })
  }

  lockTrade() {
    this.target.session.socket?.send({ type: "trade-lock" })
  }

  goTrade() {
    this.target.session.socket?.send({ type: "trade-go" })
  }

  cancelTrade() {
    this.target.session.socket?.send({ type: "trade-cancel" })
  }
}
