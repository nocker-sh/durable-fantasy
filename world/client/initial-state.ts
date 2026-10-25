import { jstMinutes } from "../core/clock.ts";
import { MAPS } from "../maps/index.ts";
import { Store } from "../../lib/engine/store.ts";
import { DEFAULT_WINDOWS, type GameState } from "../state.ts";

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
  });
}
