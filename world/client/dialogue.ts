import { parseChatInput } from "./chat-input"
import type { GameSession } from "#/world/client/game-session"
import { STORAGE } from "#/world/client/identity"
import { STORAGE_KEEPER } from "#/world/core/storage/rules"
import { errandLabel } from "#/world/core/errand-label"
import { errandOf } from "#/world/core/errand-of"
import { BATCHES } from "#/world/core/market-batches"
import type { Batch } from "#/world/core/market-types"
import { within } from "#/world/core/within"
import { ITEMS } from "#/world/core/items/catalog"
import type { ItemId } from "#/world/core/items/catalog"
import { SHOPS } from "#/world/core/shops"
import { shopOfKeeper } from "#/world/core/shop-of-keeper"
import type { ShopId } from "#/world/core/shop-types"
import { keeperPresent } from "#/world/maps/keeper-present"
import { RESIDENTS } from "../town/residents"
import { choicesFor } from "#/world/parts/choices-for"
import { keepingShop } from "#/world/parts/keeping-shop"
import { linesFor } from "#/world/parts/lines-for"
import { fullyShown } from "#/world/fully-shown"
import type { GameContext } from "./context"

export class DialogueActions {
  constructor(
    private readonly target: Pick<GameContext, "addChat" | "getScene" | "update" | "run" | "toggleWindow"> & { readonly session: Pick<GameSession, "state" | "socket" | "engaged" | "partyChat"> },
  ) {}
  private shopKeeper: string | null = null
  say(text: string) {
    const input = parseChatInput(text)
    if (!input) return
    if (input.kind === "unavailable") {
      this.target.addChat({ channel: "system", text: input.text })
      return
    }
    if (input.kind === "party") {
      this.target.session.socket?.send({ type: "party-say", text: input.text, chat: this.target.session.partyChat })
      return
    }
    const saidSource = input,
      said = saidSource.text,
      shout = saidSource.shout
    this.target.getScene()?.bubble("me", said)
    this.target.addChat({ channel: "player", name: this.target.session.state.get().player?.name, text: said, self: true, shout })
    this.target.session.socket?.send({ type: "say", text: said, shout })
  }

  advanceDialogue() {
    const dialogue = this.target.session.state.get().dialogue
    if (!dialogue) return
    if (!fullyShown(dialogue)) {
      this.target.update({ dialogue: { ...dialogue, shownAt: 0 } })
      return
    }
    if (dialogue.page < dialogue.pages.length - 1) {
      const page = dialogue.page + 1
      this.target.update({ dialogue: { ...dialogue, page, shownAt: performance.now() } })
    }
  }

  choose(index: number) {
    const dialogue = this.target.session.state.get().dialogue
    const choice = dialogue?.choices[index]
    if (!dialogue || !choice || dialogue.page < dialogue.pages.length - 1 || !fullyShown(dialogue)) return
    const errand = choice.errand ? errandOf(choice.errand) : undefined
    if (choice.action === "errand-ask" && errand) {
      this.target.addChat({ channel: "npc", name: dialogue.name, text: errand.ask })
      this.target.update({
        dialogue: {
          ...dialogue,
          pages: [errand.ask],
          page: 0,
          shownAt: performance.now(),
          choices: [
            { label: "引き受ける", action: "errand-take", errand: errand.id },
            { label: "やめておく", action: "close" },
          ],
        },
      })
      return
    }
    if ((choice.action === "errand-take" || choice.action === "errand-hand") && errand) {
      const action = choice.action === "errand-take" ? "take" : "hand"
      void this.target
        .run({ type: "use", slot: 0 }, (seq) => this.target.session.socket?.send({ type: "errand", seq, action, errand: errand.id, resident: dialogue.name }))
        .then((ok) => {
          const now = this.target.session.state.get().dialogue
          if (!now || now.name !== dialogue.name) return
          if (!ok) return this.closeDialogue()
          // taking one is told plainly (each resident's own voice is in what they asked); handing it over, they thank you
          const text = action === "take" ? `（引き受けた。${errandLabel(errand)}、朝の6時まで）` : errand.thanks
          if (action === "hand") this.target.addChat({ channel: "npc", name: dialogue.name, text })
          this.target.update({ dialogue: { ...now, pages: [text], page: 0, shownAt: performance.now(), choices: [{ label: "さようなら", action: "close" }] } })
        })
      return
    }
    if (choice.action === "storage") {
      this.target.update({ dialogue: null, storage: true })
      this.syncEngaged()
      if (!this.target.session.state.get().windows.includes("inventory")) this.target.toggleWindow("inventory")
      return
    }
    if (choice.action === "commission") {
      if (!keepingShop(dialogue.name, this.target.session.state.get().clock.min)) return
      this.target.update({ dialogue: null, commission: dialogue.name })
      this.syncEngaged()
      return
    }
    if (choice.action === "shop") {
      // a seller with two pitches opens the one they are standing at now
      const min = this.target.session.state.get().clock.min
      const shop = shopOfKeeper(dialogue.name, (id) => keeperPresent(id, dialogue.name, min))
      if (!shop || !keeperPresent(shop, dialogue.name, min)) return
      this.target.addChat({ channel: "npc", name: dialogue.name, text: SHOPS[shop].greeting })
      this.shopKeeper = dialogue.name
      this.target.update({ dialogue: null, shop, stock: null })
      this.lookAtShop()
      this.syncEngaged()
      if (!this.target.session.state.get().windows.includes("inventory")) this.target.toggleWindow("inventory")
      return
    }
    this.closeDialogue()
  }

  closeDialogue() {
    this.target.update({ dialogue: null })
    this.syncEngaged()
  }

  closeShop() {
    this.target.update({ shop: null, stock: null })
    this.syncEngaged()
  }

  syncEngaged() {
    const dialogueSource = this.target.session.state.get(),
      dialogue = dialogueSource.dialogue,
      shop = dialogueSource.shop
    // the keeper you are buying from: the one you spoke to (a shop may have one inside and one out front)
    const npc =
      dialogue?.name ?? (shop ? (this.shopKeeper ?? SHOPS[shop].keepers[0]) : null) ?? this.target.session.state.get().commission ?? (this.target.session.state.get().storage ? STORAGE_KEEPER : null)
    if (npc === this.target.session.engaged) return
    this.target.session.engaged = npc
    this.target.getScene()?.freeze(!!npc)
    this.target.session.socket?.send({ type: "engage", npc })
  }

  announceBatches(from: number, to: number) {
    if (from === to) return
    const here = new Set(this.target.session.state.get().npcs.map((n) => n.name))
    for (const entry of Object.entries(BATCHES)) {
      const shop = entry[0]
      const items = entry[1]

      const keeper = (SHOPS[shop as ShopId]?.keepers ?? []).find((k) => here.has(k))
      if (!keeper) continue
      for (const entry2 of Object.entries(items) as [ItemId, Batch][]) {
        const item = entry2[0]
        const batch = entry2[1]

        if (!batch.at.some((m) => within(m, from + 1, to + 1))) continue
        const baked = shop === "bakery"
        this.target.addChat({ channel: "npc", name: keeper, text: `${ITEMS[item].name}が${baked ? "焼けた" : "できた"}よ！${baked ? "焼きたてだよ。" : "温かいうちにどうぞ。"}` })
      }
    }
  }

  closeStorage() {
    this.target.update({ storage: false })
    this.syncEngaged()
  }

  closeCommission() {
    this.target.update({ commission: null })
    this.syncEngaged()
  }

  lookAtShop() {
    const shop = this.target.session.state.get().shop
    if (shop) this.target.session.socket?.send({ type: "look", shop })
  }

  onReachResident(id: number) {
    const resident = RESIDENTS[id]
    if (!resident) return
    const choices = choicesFor(this.target.session.state.get(), resident.name)
    const pages = linesFor({ state: this.target.session.state.get(), name: resident.name, spokenKey: `${STORAGE}/spoken` })
    this.target.addChat({ channel: "npc", name: resident.name, text: pages[0] })
    this.target.update({ dialogue: { resident: id, name: resident.name, job: resident.job, pages, page: 0, choices, shownAt: performance.now() }, shop: null })
    this.syncEngaged()
  }
}
