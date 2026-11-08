import { jstMinutes } from "#/world/core/jst-minutes"
import { MAPS } from "#/world/maps/index"
import { Store } from "#/lib/engine/store"
import { DEFAULT_WINDOWS } from "#/world/state"
import type { GameState } from "#/world/state"

export function createGameState() {
  return new Store<GameState>({
    loading: { map: MAPS.phanthiet.name, text: "読み込んでいます…" },
    failed: false,
    map: { id: "phanthiet", name: MAPS.phanthiet.name, warps: [] },
    me: { x: 0, z: 0, walking: false, heading: 0 },
    online: "connecting",
    players: [],
    npcs: [],
    chat: [],
    dialogue: null,
    shop: null,
    player: null,
    derived: null,
    busy: false,
    windows: DEFAULT_WINDOWS,
    layout: 0,
    modal: null,
    typing: false,
    zoom: { level: 0, max: 1 },
    portraits: {},
    portrait: null,
    notices: [],
    debug: false,
    clock: { min: jstMinutes(Date.now()), held: false },
    stock: null,
    room: null,
    homeTown: 1,
    threadAsk: null,
    nodes: {},
    craft: null,
    commission: null,
    storage: false,
    playerMenu: null,
    tradeAsk: null,
    trade: null,
    party: null,
    partyAsk: null,
    board: null,
  })
}
