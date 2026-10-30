import "#resources/components/game/game"
import { useEffect, useState } from "react"
import { apply } from "#/world/core/apply"
import { addItem } from "#/world/core/add-item"
import { emptyBag } from "#/world/core/empty-bag"
import { emptyEquipment } from "#/world/core/empty-equipment"
import { newPlayer } from "#/world/core/new-player"
import type { PlayerState } from "#/world/core/player-types"
import { lifeExpAt } from "#/world/core/life-exp-at"
import { isShopId } from "#/world/core/is-shop-id"
import { derive } from "#/world/core/derive"
import { carried } from "#/world/core/inventory-weight"
import { Game } from "#/world/game"
import type { GameState, WindowId } from "#/world/state"
import { GameProvider } from "#/components/game/game-provider"
import { TooltipProvider } from "#/components/game/tooltip-provider"
import { Chat } from "#/components/hud/chat"
import { DialogueBox } from "#/components/hud/dialogue"
import { EquipmentWindow } from "#/components/hud/equipment-window"
import { Hotbar } from "#/components/hud/hotbar"
import { InventoryWindow } from "#/components/hud/inventory-window"
import { ShopWindow } from "#/components/hud/shop-window"
import { StatsWindow } from "#/components/hud/stats-window"
import { StatusFrame } from "#/components/hud/status-frame"
import { SystemModals } from "#/components/hud/system-menu"
import { WorldmapWindow } from "#/components/hud/worldmap-window"
import { Loading } from "#/components/hud/loading"
import { Offline } from "#/components/hud/offline"
import { Fallen } from "#/components/hud/fallen"
import { useNoCanvasMenu } from "#/hooks/use-no-canvas-menu"

const WINDOWS = ["status", "hotbar", "chat", "inventory", "equipment", "stats", "worldmap", "shop", "dialogue", "system", "character", "loading", "fallen", "offline", "failed"] as const
type Shown = (typeof WINDOWS)[number]

/** A traveller a few days in: some gear on, a bag with a bit of everything. */
function samplePlayer(): PlayerState {
  let bag = emptyBag()
  for (const entry of [
    ["rye-bread", 5],
    ["red-potion", 8],
    ["herb", 12],
    ["jelly", 23],
    ["soft-fur", 4],
    ["short-bow", 1],
    ["small-crystal", 2],
    ["sealed-letter", 1],
  ] as const) {
    const id = entry[0]
    const n = entry[1]
    bag = addItem({ bag: bag, item: id, count: n }) ?? bag
  }
  const p: PlayerState = {
    ...newPlayer(),
    gold: 1234,
    level: 7,
    exp: 300,
    statPoints: 6,
    stats: { vit: 10, mnd: 6, str: 12, dex: 9, int: 5, fth: 5 },
    life: { ...newPlayer().life, woodcutting: lifeExpAt(4), carpentry: lifeExpAt(2), foraging: 300 },
    bag,
    equipment: { ...emptyEquipment(), weapon: "short-sword", body: "leather-armor", head: "cloth-hat", neck: "striped-muffler", feet: "leather-boots", accessory1: "fang-charm" },
  }
  return { ...p, hp: Math.floor(derive(p).maxHp * 0.7) }
}

/**
 * The game's windows on their own, with a fixed state: /dev/ui/frame?window=shop&shop=smithy. It
 * stands outside the dev frame (the game's own styles would leak into it); /dev/ui shows it in a box.
 * Nothing is connected; buttons that would talk to the server do nothing.
 */
export const layout = false

export default function UiFrame() {
  useNoCanvasMenu()
  const q = typeof location === "undefined" ? new URLSearchParams() : new URLSearchParams(location.search)
  const shown = (WINDOWS as readonly string[]).includes(q.get("window") ?? "") ? (q.get("window") as Shown) : "inventory"
  const shopParam = q.get("shop") ?? "smithy"
  const gameState = useState(() => {
      const g = new Game()
      const player = samplePlayer()
      const windows: WindowId[] = (["inventory", "equipment", "stats", "worldmap", "chat"] as WindowId[]).filter((w) => w === shown || (shown === "shop" && w === "inventory"))
      const patch: Partial<GameState> = {
        loading: shown === "loading" ? { map: "ファンティエット ― 広場", text: q.get("text") ?? "街を建てています…" } : null,
        failed: shown === "failed",
        online: shown === "offline" ? "offline" : "online",
        player: shown === "fallen" ? { ...player, hp: 0 } : player,
        derived: { ...derive(player), weight: carried(player) },
        windows,
        shop: shown === "shop" && isShopId(shopParam) ? shopParam : null,
        modal: shown === "system" ? "system" : shown === "character" ? "character" : null,
        chat: [
          { id: 1, channel: "system", text: "商店通りに着いた。" },
          { id: 2, channel: "npc", name: "ブルーノ", text: "旅支度ならおまかせを。" },
          { id: 3, channel: "player", name: "旅のアグネス", text: "こんばんは。寒いね" },
          { id: 4, channel: "player", name: "シグレニ", text: "マフラー新調した", self: true },
        ],
        dialogue:
          shown === "dialogue"
            ? {
                resident: 0,
                name: "ギュンター",
                job: "鍛冶屋",
                pages: ["よう、旅の人。ここは町でただ一つの鍛冶場だ。", "鉄は熱いうちに打て、だ。"],
                page: 1,
                choices: [
                  { label: "買い物をする", action: "shop" },
                  { label: "さようなら", action: "close" },
                ],
                shownAt: 0,
              }
            : null,
      }
      g.state.set((s) => ({ ...s, ...patch }))
      void apply
      return g
    }),
    game = gameState[0]
  const mountedState = useState(false),
    mounted = mountedState[0],
    setMounted = mountedState[1]
  useEffect(() => {
    setMounted(true)
    document.body.dataset.ready = "1"
  }, [])
  if (!mounted) return null
  return (
    <GameProvider game={game}>
      <TooltipProvider>
        <div className="relative h-svh overflow-hidden bg-[radial-gradient(circle_at_40%_30%,#4a5a3a,#1e2418)]" data-window={shown}>
          {shown === "status" && <StatusFrame />}
          {shown === "hotbar" && <Hotbar />}
          {shown === "chat" && <Chat />}
          {shown === "inventory" && <InventoryWindow />}
          {shown === "equipment" && <EquipmentWindow />}
          {shown === "stats" && <StatsWindow />}
          {shown === "worldmap" && <WorldmapWindow />}
          {shown === "shop" && (
            <>
              <ShopWindow />
              <InventoryWindow />
            </>
          )}
          {shown === "dialogue" && <DialogueBox />}
          {(shown === "system" || shown === "character") && <SystemModals />}
          {(shown === "loading" || shown === "failed") && <Loading />}
          {shown === "offline" && <Offline />}
          {shown === "fallen" && <Fallen />}
        </div>
      </TooltipProvider>
    </GameProvider>
  )
}
