import { loadPlayerId, playerAvatar, remoteAvatar, STORAGE } from "./client/identity.ts"
import { GameSession, createSessionContext } from "./client/session.ts"
import { RoomClient } from "./client/room-client.ts"
import { ServerMessages } from "./client/server-messages.ts"
import type { ServerMessageContext } from "./client/server-context.ts"
import { DialogueActions } from "./client/dialogue.ts"
import { PlayerActions } from "./client/player-actions.ts"
import { SocialActions } from "./client/social.ts"
// The game, independent of any UI framework: state, the three.js scene, keyboard input, the map
// room connection and the player's data. A UI reads `state` (subscribe + get) and calls the
// methods; it keeps no game state or rules of its own. Specs: .docs/game-system.md, .docs/ui.md.
import { EXCHANGE_BOARD } from "./town/boards.ts"
import { STORAGE_KEEPER } from "./core/storage.ts"
import { stationAt } from "./town/stations.ts"
import { WORLDS, hometownOf } from "./channels.ts"
import { jstMinutes, parseTime } from "./core/clock.ts"
import { apply, carried } from "./core/apply.ts"
import type { Command, GameEvent, Reason } from "./core/commands.ts"
import type { ItemId } from "./core/items.ts"
import { wornNeck, type NeckKind, type PlayerState } from "./core/player.ts"
import { SHOPS, shopOfKeeper } from "./core/shops.ts"
import { derive } from "./core/stats.ts"
import { iconUrl, portraitUrl } from "./art/icons.ts"
import { MAPS, TALK_CELLS, cellDistance, isMapId, isOpen, neighbours, shopOpen, type MapDefinition, type MapId, walkable } from "./maps/index.ts"
import type { Cell } from "./protocol.ts"
import { spritesPending } from "./scene/sprite-pool.ts"
import { MapScene, spriteManifest, type WalkerInfo } from "./scene/index.ts"
import { Windows } from "./parts/windows.ts"
import { Keys } from "./parts/keys.ts"
import { tell } from "./parts/report.ts"
import { LOOKS } from "./town/travellers.ts"
import { lap, lapEnd, lapStart } from "./diagnostics.ts"
import { groundOf, prefetchGround } from "./scene/ground.ts"

/** How near a way out (cells) the room beyond it is got ready. */
const STANDBY_CELLS = 8

export { LOOKS }
export * from "./state.ts"
import type { ChatLine, GameState, ModalId, Notice, Npc, WindowId } from "./state.ts"
export type { WalkerInfo }

const CHAT_KEEP = 150

let serial = 0

const npcRole = (name: string, min: number): Npc["role"] => (shopOfKeeper(name, (s) => shopOpen(s, min)) ? "shop" : "other")

export class Game {
  private readonly session = new GameSession()
  readonly state = this.session.state

  private readonly windows = new Windows(this.state, `${STORAGE}/windows`)
  private readonly keys = new Keys(this)
  private container: HTMLElement | null = null
  private scene: MapScene | null = null

  private stopTick: (() => void) | null = null
  private mountVersion = 0

  // ------------------------------------------------------------------ lifecycle

  private readonly context = this.createContext()
  private readonly roomClient = new RoomClient(this.context)
  private readonly serverMessages = new ServerMessages(this.context)
  private readonly dialogueActions = new DialogueActions(this.context)
  private readonly playerActions = new PlayerActions(this.context)
  private readonly socialActions = new SocialActions(this.context)

  private createContext(): ServerMessageContext {
    return createSessionContext(this.session, {
      getScene: () => this.scene,
      preview: (command) => this.preview(command),
      onServer: (message) => this.onServer(message),
      wayBeside: (at) => this.wayBeside(at),
      standBy: (id) => this.standBy(id),
      avatarOf: (player) => this.avatarOf(player),
      setPlayer: (player) => this.setPlayer(player),
      maybeReady: () => this.maybeReady(),
      report: (event) => this.report(event),
      connect: (id) => this.connect(id),
      visitTown: (town) => this.visitTown(town),
      update: (patch) => this.update(patch),
      run: (command, send) => this.run(command, send),
      notify: (text, tone) => this.notify(text, tone),
      addChat: (line) => this.addChat(line),
      toggleWindow: (id) => this.toggleWindow(id),
      lookAtShop: () => this.lookAtShop(),
      enterMap: (id, at) => this.enterMap(id, at),
    })
  }

  /** Start the game in a container element. Browser only. */
  async mount(container: HTMLElement) {
    const version = ++this.mountVersion
    this.container = container
    try {
      this.session.playerId = await this.loadId()
    } catch {
      if (version === this.mountVersion)
        this.update({ failed: true, failureMessage: "キャラクターを読み込めなかった。接続と、このキャラクターで遊んだブラウザかどうかを確かめてください。保存データは変更していません。" })
      return
    }
    if (version !== this.mountVersion) return
    this.session.rooms.world = hometownOf(this.session.playerId)
    this.update({ homeTown: this.session.rooms.world })
    this.update({ windows: this.windows.load() })
    this.keys.listen()
    LOOKS.forEach((preset, index) => portraitUrl(preset.look, (url) => this.update((s) => ({ portraits: { ...s.portraits, [index]: url } }))))
    // ?map=phanthiet-market&x=24&z=24&open=inventory,stats starts somewhere in particular (handy for checks)
    const q = new URLSearchParams(location.search)
    const startMap = q.get("map")
    const x = Number(q.get("x")),
      z = Number(q.get("z"))
    const open = (q.get("open") ?? "").split(",").filter((w): w is WindowId => ["minimap", "chat", "syslog", "inventory", "equipment", "stats", "worldmap", "errands", "skills", "friends"].includes(w))
    if (open.length) this.update((s) => ({ windows: [...new Set([...s.windows, ...open])] }))
    if (import.meta.env.DEV && q.get("debug") === "1") this.update({ debug: true })
    const visit = Number(q.get("world"))
    if (import.meta.env.DEV && visit >= 1 && visit <= WORLDS) this.session.rooms.world = visit
    // the clock is Japan's; ?time=22:30 holds it at a time of day (for checks)
    const held = parseTime(q.get("time"))
    this.update({ clock: { min: held ?? jstMinutes(Date.now()), held: held !== null } })
    // how the party is doing: our own room reports us, and tells us of the others
    const partyTick = window.setInterval(() => {
      if (this.session.others.you) this.session.socket?.send({ type: "heartbeat" })
      if (this.state.get().player?.party) this.session.socket?.send({ type: "party-look" })
    }, 5_000)
    const tick = window.setInterval(() => {
      this.lookAtShop() // the shelves change as others buy and batches come out
      if (this.state.get().clock.held) return
      const before = this.state.get().clock.min
      this.update({ clock: { min: jstMinutes(Date.now()), held: false } })
      this.announceBatches(before, this.state.get().clock.min)
      this.scene?.setClock(this.state.get().clock.min)
    }, 15_000)
    this.stopTick = () => {
      window.clearInterval(tick)
      window.clearInterval(partyTick)
    }
    this.enterMap(startMap && isMapId(startMap) && (import.meta.env.DEV || isOpen(startMap)) ? startMap : "phanthiet", q.has("x") && q.has("z") ? [Math.floor(x * 2), Math.floor(z * 2)] : null)
  }

  unmount() {
    this.mountVersion++
    this.session.rooms.close()
    this.keys.unlisten()
    this.stopTick?.()
    this.leaveMap()
    this.scene?.destroy()
    this.scene = null
    this.container = null
  }

  leave() {
    this.unmount()
    this.update({ departed: true, modal: null, loading: null, online: "offline" })
  }

  // ------------------------------------------------------------------ reading

  get mapSize() {
    return this.scene?.size ?? 48
  }

  /** The painted ground, for the minimap. */
  groundImage() {
    return this.scene?.groundImage() ?? null
  }

  iconUrl(item: ItemId, by?: string) {
    return iconUrl(item, by)
  }

  /** What a command would do, without sending it (for greying out buttons). */
  preview(command: Command): Reason | null {
    const player = this.state.get().player
    if (!player) return "OFFLINE"
    const result = apply(player, command)
    return result.ok ? null : result.reason
  }

  /** The current map's walk grid (1 = blocked), for scripts/export-map.ts. */
  /** The named spots on this map, in cells (scripts/export-map.ts). */
  places() {
    return this.scene?.places() ?? {}
  }

  walkGrid() {
    return this.scene?.walkGrid() ?? null
  }

  /** Numbers for the dev debug panel. */
  debugInfo() {
    return {
      fps: this.scene?.fps() ?? 0,
      lights: this.scene?.lights() ?? null,
      cell: this.scene?.playerCell() ?? null,
      position: this.scene?.player() ?? null,
      sprites: spritesPending(),
      online: this.state.get().online,
      players: this.session.others.size + 1,
      playerId: this.session.playerId,
      /** messages and bytes received from the room since it was joined */
      net: { ...this.session.net, seconds: (performance.now() - this.session.net.since) / 1000 },
      map: this.state.get().map.id,
    }
  }

  // ------------------------------------------------------------------ moving and talking

  /** Walk to a point (the minimap). A point near a way out goes onto it, so a click on its mark takes you through. */
  walkTo(x: number, z: number) {
    const near = MAPS[this.state.get().map.id].warps.map((w) => ({ x: (w.at[0] + 0.5) / 2, z: (w.at[1] + 0.5) / 2 })).find((w) => Math.hypot(w.x - x, w.z - z) <= 3)
    this.scene?.walkTo(near?.x ?? x, near?.z ?? z)
  }

  talkTo(resident: number) {
    this.scene?.approach(resident)
  }

  /** Say something to players nearby; `/s text` shouts to the whole map. */
  say = this.dialogueActions.say.bind(this.dialogueActions)

  setTyping(typing: boolean) {
    this.update({ typing })
  }

  /** Show the whole page if it is still typing out, otherwise turn to the next page. */
  advanceDialogue = this.dialogueActions.advanceDialogue.bind(this.dialogueActions)

  choose = this.dialogueActions.choose.bind(this.dialogueActions)

  /** Fallen: come to in town (the room sends us there). */
  revive = this.playerActions.revive.bind(this.playerActions)

  closeDialogue = this.dialogueActions.closeDialogue.bind(this.dialogueActions)

  closeShop = this.dialogueActions.closeShop.bind(this.dialogueActions)

  /**
   * Talking to an NPC or shopping holds the player in place (ui.md §3.5); tell the scene and
   * the room whenever that starts or ends.
   */

  private syncEngaged = this.dialogueActions.syncEngaged.bind(this.dialogueActions)

  // ------------------------------------------------------------------ the player's data

  buy = this.playerActions.buy.bind(this.playerActions)

  /** A keeper standing nearby calls out when a batch comes out of the oven or the pot (economy.md §4.4). */
  private announceBatches = this.dialogueActions.announceBatches.bind(this.dialogueActions)

  /** Move to another channel of this map (system menu), staying where we stand. */
  changeChannel(channel: number) {
    const room = this.state.get().room
    if (!room || room.channel === channel || this.session.engaged) return
    this.session.wantChannel = channel
    this.leaveMap()
    void this.connect(this.state.get().map.id)
    this.addChat({ channel: "system", text: `チャンネル ${channel} に移った。` })
  }

  /** How full the map's channels are now (for the channel menu). */
  async refreshChannels() {
    const room = this.state.get().room
    if (!room) return
    const r = await fetch(`/api/channel?world=${room.world}&map=${this.state.get().map.id}`).catch(() => null)
    if (!r?.ok) return
    const { channels } = (await r.json()) as { channels: Record<number, number> }
    this.update((s) => ({ room: s.room && { ...s.room, channels } }))
  }

  /** Have a go at a gathering spot (we are standing by it); the server rolls and answers. */
  gather = this.playerActions.gather.bind(this.playerActions)

  /** Make something at the open station. */
  craft = this.playerActions.craft.bind(this.playerActions)

  closeCraft = this.playerActions.closeCraft.bind(this.playerActions)

  /** Leave work with the craftsman whose window is open, or collect an order. */
  order = this.playerActions.order.bind(this.playerActions)
  collect = this.playerActions.collect.bind(this.playerActions)
  /** Open the exchange board on a symbol (the last looked at, or the first thing in the bag). */
  openBoard = this.playerActions.openBoard.bind(this.playerActions)
  closeBoard = this.playerActions.closeBoard.bind(this.playerActions)
  /** Put up an order; sells come from a bag slot. */
  placeOrder = this.playerActions.placeOrder.bind(this.playerActions)
  cancelOrder = this.playerActions.cancelOrder.bind(this.playerActions)
  claimInbox = this.playerActions.claimInbox.bind(this.playerActions)

  /** Leave a lot from a bag slot with the warehouse, or take one back. */
  store = this.playerActions.store.bind(this.playerActions)
  retrieve = this.playerActions.retrieve.bind(this.playerActions)
  /** Trading face to face (core/trade.ts). */
  askTrade = this.socialActions.askTrade.bind(this.socialActions)
  /** Skills (core/skills.ts): sit down or get up, see to a wound, pray, or strike with an art. */
  useSkill = this.playerActions.useSkill.bind(this.playerActions)
  toggleSit = this.playerActions.toggleSit.bind(this.playerActions)

  closePlayerMenu = this.socialActions.closePlayerMenu.bind(this.socialActions)
  /** Friends (core/threads.ts): swap muffler threads; follow one into a friend's town; go home. */
  askThread = this.socialActions.askThread.bind(this.socialActions)
  answerThread = this.socialActions.answerThread.bind(this.socialActions)
  /** Go to a town: a friend's by their thread, or home. We arrive in its square. */
  visitTown = this.socialActions.visitTown.bind(this.socialActions)
  /** Parties (core/party.ts). */
  inviteParty = this.socialActions.inviteParty.bind(this.socialActions)
  answerParty = this.socialActions.answerParty.bind(this.socialActions)
  leaveParty = this.socialActions.leaveParty.bind(this.socialActions)
  setPartyMode = this.socialActions.setPartyMode.bind(this.socialActions)
  answerTrade = this.socialActions.answerTrade.bind(this.socialActions)
  offerTrade = this.socialActions.offerTrade.bind(this.socialActions)
  lockTrade = this.socialActions.lockTrade.bind(this.socialActions)
  goTrade = this.socialActions.goTrade.bind(this.socialActions)
  cancelTrade = this.socialActions.cancelTrade.bind(this.socialActions)

  closeStorage = this.dialogueActions.closeStorage.bind(this.dialogueActions)

  closeCommission = this.dialogueActions.closeCommission.bind(this.dialogueActions)

  /** Ask the server what the open shop has now. */
  lookAtShop = this.dialogueActions.lookAtShop.bind(this.dialogueActions)

  sell = this.playerActions.sell.bind(this.playerActions)

  /** Double-click in the bag: eat what can be eaten, wear what can be worn. */
  useSlot = this.playerActions.useSlot.bind(this.playerActions)

  equip = this.playerActions.equip.bind(this.playerActions)

  unequip = this.playerActions.unequip.bind(this.playerActions)

  moveSlot = this.playerActions.moveSlot.bind(this.playerActions)

  raise = this.playerActions.raise.bind(this.playerActions)

  bindHotbar = this.playerActions.bindHotbar.bind(this.playerActions)

  useHotbar = this.playerActions.useHotbar.bind(this.playerActions)

  /** Change name, looks and neck wrap (the character screen). */
  setProfile = this.playerActions.setProfile.bind(this.playerActions)

  // ------------------------------------------------------------------ windows and view

  toggleWindow(id: WindowId) {
    this.windows.toggle(id)
  }

  closeWindow(id: WindowId) {
    this.windows.close(id)
  }

  /** Put every window back where it started: positions, sizes and which are open. */
  resetLayout() {
    this.windows.reset()
  }

  /** Bring a window to the front. */
  focusWindow(id: WindowId) {
    this.windows.focus(id)
  }

  openModal(modal: ModalId | null) {
    if (this.state.get().player?.profileComplete === false) modal = "character"
    this.windows.openModal(modal)
  }

  /** Turn the camera 45° (+1 is Shift+Q). */
  rotate(steps: number) {
    this.scene?.rotate(steps)
  }

  zoom(delta: number) {
    this.scene?.zoom(delta)
    this.syncZoom()
  }

  dismissNotice(id: number) {
    this.update((s) => ({ notices: s.notices.filter((n) => n.id !== id) }))
  }

  // ------------------------------------------------------------------ dev only

  setTimeOfDay(index: number) {
    this.setClock([12 * 60, 16 * 60 + 45, 22 * 60][((index % 3) + 3) % 3])
  }

  /** Hold the clock at a time of day, or let it follow Japan's again (null). */
  setClock(min: number | null) {
    this.update({ clock: { min: min ?? jstMinutes(Date.now()), held: min !== null } })
    this.scene?.setClock(this.state.get().clock.min)
  }

  toggleDebug() {
    if (import.meta.env.DEV) this.update((s) => ({ debug: !s.debug }))
  }

  /** Join the map again, e.g. after the player's data was reset from the debug panel. */
  rejoin() {
    this.enterMap(this.state.get().map.id, this.scene?.playerCell() ?? null)
  }

  // ------------------------------------------------------------------ maps

  /**
   * Show the loading screen, leave the current map's room, load the next map and join its room.
   * Only the village exists so far, so its scene stays; a second map will swap scenes here.
   */
  private enterMap(id: MapId, at: Cell | null) {
    lapStart(`enter ${id}${this.session.warpAskedAt ? ` (the room let us go ${Math.round(performance.now() - this.session.warpAskedAt)} ms after asking)` : ""}`)
    this.session.warpAskedAt = 0
    // the ground is painted in workers from now, while the rest is got ready
    void groundOf(id)
    const map: MapDefinition = MAPS[id]
    this.leaveMap()
    // where we will stand, decided now so the room can be joined while the scene is still being built:
    // a step or so either side of the spawn, so people do not stack up, but never onto a warp
    const jitter = [map.spawn[0] + Math.floor(Math.random() * 3) - 1, map.spawn[1] + Math.floor(Math.random() * 3) - 1] as Cell
    const clearOfWarps = map.warps.every((w) => cellDistance(w.at as Cell, jitter) > 1) && walkable(map, jitter)
    this.session.arriveAt = at ?? (clearOfWarps ? jitter : (map.spawn as Cell))
    document.body.dataset.ready = "0"
    this.update({
      loading: { map: map.name, text: "読み込んでいます…" },
      map: { id, name: map.name, warps: map.warps.map((w) => w.at) },
      dialogue: null,
      shop: null,
      players: [],
      online: "connecting",
    })
    // each map builds its own scene; leaving one throws its scene away
    if (this.scene && this.scene.map !== id) {
      this.scene.destroy()
      this.scene = null
      lap("left the last map")
    }
    this.session.warping = false
    if (!this.scene && this.container) {
      this.scene = new MapScene(
        this.container,
        {
          progress: (text) => this.update((s) => ({ loading: s.loading && { ...s.loading, text } })),
          ready: () => this.onSceneReady(),
          failed: (error) => {
            console.error(error)
            this.update({ failed: true })
          },
          walk: (cells) => {
            this.session.socket?.send({ type: "move", path: cells })
            // walking towards a way out: get the room beyond it ready now, not only on arrival
            const end = cells[cells.length - 1]
            const way = end && MAPS[this.state.get().map.id].warps.find((w) => cellDistance(w.at as Cell, end) <= 2)
            if (way) this.standBy(way.to.map)
          },
          reach: (resident) => this.onReachResident(resident),
          pickPlayer: (id) => {
            const p = this.session.others.get(id)
            if (p) this.update({ playerMenu: { id, name: p.name } })
          },
          gatherAt: (node) => this.gather(node),
          swing: (monster) => {
            this.session.fighting = { monster, at: performance.now() }
            this.session.socket?.send({ type: "attack", monster })
          },
          stationAt: (station) => (station === "exchange-board" ? this.openBoard() : this.update({ craft: station })),
          tick: () => this.onTick(),
        },
        id,
      )
    } else if (this.scene?.ready) this.onSceneReady()
    this.session.fullTries = 0
    this.session.wild = {}
    this.update({ nodes: {}, craft: null })
    void this.connect(id)
    void spriteManifest()
    lap("map entered (before the screen redraws)")
  }

  private leaveMap() {
    this.roomClient.cancel()
    this.session.engaged = null
    this.scene?.freeze(false)
    this.session.socket?.close()
    this.session.socket = null
    this.session.others.clear()
    this.scene?.clearRemotes()
    for (const resolve of this.session.waiting.values()) resolve({ ok: false, reason: "OFFLINE" })
    this.session.waiting.clear()
  }

  // ------------------------------------------------------------------ internals

  private update(patch: Partial<GameState> | ((state: GameState) => Partial<GameState>)) {
    this.state.set((state) => ({ ...state, ...(typeof patch === "function" ? patch(state) : patch) }))
  }

  private addChat(line: Omit<ChatLine, "id">) {
    this.update((s) => ({ chat: [...s.chat, { ...line, id: ++serial }].slice(-CHAT_KEEP) }))
  }

  private notify(text: string, tone: Notice["tone"] = "info") {
    const id = ++serial
    this.update((s) => ({ notices: [...s.notices, { id, text, tone }].slice(-4) }))
    setTimeout(() => this.dismissNotice(id), 2500)
  }

  private setPlayer(player: PlayerState) {
    const before = this.state.get().player
    this.update({ player, derived: { ...derive(player), weight: carried(player) } })
    if (!player.profileComplete) this.openModal("character")
    this.scene?.setAttackDelay(derive(player).attackDelay)
    this.scene?.setDown(player.hp <= 0)
    this.scene?.setSitting(player.sitting && player.hp > 0)
    const avatar = this.avatar(player)
    this.scene?.setAvatar(avatar)
    if (!before || before.look !== player.look || JSON.stringify(wornNeck(before)) !== JSON.stringify(wornNeck(player))) {
      portraitUrl(avatar.look, (portrait) => this.update({ portrait }))
    }
  }

  /** A picture of a look preset with a given neck wrap (the character screen's preview). */
  previewPortrait(look: number, neck: NeckKind, neckRamp: string, ready: (url: string) => void) {
    portraitUrl({ ...LOOKS[look].look, neck, neckRamp, neckStripe: undefined }, ready)
  }

  private onSceneReady() {
    const scene = this.scene!
    scene.setClock(this.state.get().clock.min)
    scene.setNodes(this.state.get().nodes)
    const map = MAPS[this.state.get().map.id]
    scene.placePlayer(this.session.arriveAt ?? (map.spawn as Cell))
    scene.setWarps(map.warps.map((w) => w.at))
    scene.setWild(this.session.wild)
    const player = this.state.get().player
    if (player) scene.setAvatar(this.avatar(player))
    for (const p of this.session.others.values()) scene.addRemote(p.id, this.avatarOf(p), p.at)
    this.update({ npcs: scene.residents().map((r) => ({ ...r, role: npcRole(r.name, this.state.get().clock.min) })) })
    this.onTick()
    this.roomClient.join()
    this.maybeReady()
  }

  /** Leave the loading screen once the scene is built and the room has answered. */
  private maybeReady() {
    if (this.scene?.ready && this.session.others.you && this.state.get().loading) {
      lapEnd("ready")
      // the maps one step away get their ground painted and kept, for when we go on; the one
      // through the way out we arrived beside first and straight away, since we may step right back out
      const here = MAPS[this.state.get().map.id]
      const beside = this.wayBeside(this.session.arriveAt)
      if (beside) void prefetchGround(beside)
      window.setTimeout(() => {
        for (const next of neighbours(here)) if (next !== beside) void prefetchGround(next)
      }, 1500)
      this.update({ loading: null })
      // for screenshots: the map is drawn and joined
      document.body.dataset.ready = "1"
      this.addChat({ channel: "system", text: `${this.state.get().map.name}に着いた。` })
    }
  }

  private onTick() {
    const scene = this.scene
    const me = scene?.player()
    if (!scene || !me) return
    this.update({ me, players: scene.remotes(), npcs: scene.residents().map((r) => ({ ...r, role: npcRole(r.name, this.state.get().clock.min) })) })
    this.syncZoom()
    // walked away from the shopkeeper or the person being talked to
    const { dialogue, shop } = this.state.get()
    const range = TALK_CELLS / 2
    const near = (name: string) => {
      const r = this.state.get().npcs.find((x) => x.name === name)
      return !!r && Math.hypot(r.x - me.x, r.z - me.z) <= range
    }
    if (dialogue && !near(dialogue.name)) this.closeDialogue()
    // standing on a warp takes the player to the next map
    const cell = scene.playerCell()
    const warps = MAPS[this.state.get().map.id].warps
    // near a way out, the room beyond is got ready: its channel asked for and its socket opened
    if (cell) {
      const next = warps
        .map((w) => ({ w, d: cellDistance(w.at as Cell, cell) }))
        .filter((x) => x.d <= STANDBY_CELLS)
        .sort((a, b) => a.d - b.d)[0]
      if (next) void this.standBy(next.w.to.map)
    }
    if (cell && !me.walking && !this.session.engaged && !this.session.warping && this.session.others.you && performance.now() >= this.session.warpAgainAt) {
      const i = warps.findIndex((w) => cellDistance(w.at as Cell, cell) <= 1)
      // a warp that turned us down waits until we step off it and come back
      if (i < 0) this.session.refusedWarp = -1
      if (i >= 0 && i !== this.session.refusedWarp) {
        this.session.warping = true
        this.session.warpAskedAt = performance.now()
        this.session.socket?.send({ type: "warp", warp: i })
      }
    }
    const craft = this.state.get().craft
    const station = craft ? stationAt(craft) : undefined
    if (station && cell && cellDistance(station.cell as Cell, cell) > 6) this.closeCraft()
    const commission = this.state.get().commission
    if (commission && !near(commission)) this.closeCommission()
    if (this.state.get().storage && !near(STORAGE_KEEPER)) this.closeStorage()
    if (this.state.get().board && cell && (this.state.get().map.id !== EXCHANGE_BOARD.map || cellDistance(EXCHANGE_BOARD.cell as Cell, cell) > 6)) this.closeBoard()
    if (shop && !SHOPS[shop].keepers.some(near)) {
      this.closeShop()
      this.notify("店から離れた。")
    }
  }

  private syncZoom() {
    const zoom = this.scene?.zoomLevel()
    const now = this.state.get().zoom
    if (zoom && (zoom.level !== now.level || zoom.max !== now.max)) this.update({ zoom })
  }

  private onReachResident = this.dialogueActions.onReachResident.bind(this.dialogueActions)

  /** Walk on along a screen direction while the keys are held, or stop (parts/keys.ts). */
  hold(dir: [number, number] | null) {
    this.scene?.hold(dir)
  }

  stopWalking() {
    this.scene?.stop()
  }

  private loadId = loadPlayerId

  private avatar = playerAvatar

  private avatarOf = remoteAvatar

  // ------------------------------------------------------------------ the map room

  /** Ask which channel of the map to join, then join its room. */
  private connect = this.roomClient.connect.bind(this.roomClient)

  /** The map through the way out nearest `at`, if one is close by (16 cells). */
  private wayBeside = this.roomClient.wayBeside.bind(this.roomClient)

  /** Get the room of `map` ready before arriving (once we are in a room ourselves). */
  private standBy = this.roomClient.standBy.bind(this.roomClient)

  private onServer = this.serverMessages.handle.bind(this.serverMessages)

  /** Send a command through the map room and wait for the server's answer. */
  private run = this.roomClient.run.bind(this.roomClient)

  private report(event: GameEvent) {
    const told = tell(event, this.state.get().player?.name)
    for (const n of told.notices) this.notify(n.text, n.tone)
    for (const text of told.chat) this.addChat({ channel: "system", text })
  }
}
