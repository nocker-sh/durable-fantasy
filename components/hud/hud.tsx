// Everything drawn over the world (ui.md §2): always-on HUD, windows, modals and notices.
import { TooltipProvider } from "#/components/game/tooltip-provider"
import { useGameState } from "#/hooks/use-game-state"
import { Chat } from "#/components/hud/chat"
import { SystemLog } from "#/components/hud/system-log"
import { DialogueBox } from "#/components/hud/dialogue"
import { EquipmentWindow } from "#/components/hud/equipment-window"
import { Hotbar } from "#/components/hud/hotbar"
import { InventoryWindow } from "#/components/hud/inventory-window"
import { Loading } from "#/components/hud/loading"
import { Offline } from "#/components/hud/offline"
import { Minimap } from "#/components/hud/minimap"
import { Notices } from "#/components/hud/notices"
import { ShopWindow } from "#/components/hud/shop-window"
import { CraftWindow } from "#/components/hud/craft-window"
import { CommissionWindow } from "#/components/hud/commission-window"
import { ExchangeWindow } from "#/components/hud/exchange-window"
import { StatsWindow } from "#/components/hud/stats-window"
import { StatusFrame } from "#/components/hud/status-frame"
import { SystemModals } from "#/components/hud/system-menu"
import { WorldmapWindow } from "#/components/hud/worldmap-window"
import { ErrandsWindow } from "#/components/hud/errands-window"
import { Fallen } from "#/components/hud/fallen"
import { StorageWindow } from "#/components/hud/storage-window"
import { PlayerMenu } from "#/components/hud/player-menu"
import { TradeAsk } from "#/components/hud/trade-ask"
import { TradeWindow } from "#/components/hud/trade-window"
import { PartyAsk } from "#/components/hud/party-ask"
import { PartyFrame } from "#/components/hud/party-frame"
import { SkillsWindow } from "#/components/hud/skills-window"
import { FriendsWindow } from "#/components/hud/friends-window"
import { ThreadAsk } from "#/components/hud/thread-ask"

export function Hud() {
  const departed = useGameState((s) => s.departed)
  const player = useGameState((s) => s.player)
  const replaced = useGameState((s) => s.connectionReplaced)
  if (departed) return <Loading />
  if (replaced) return <Offline />
  if (!player) return <Loading />
  if (!player.profileComplete) return <SystemModals />
  return (
    <TooltipProvider>
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <StatusFrame />
        <PartyFrame />
        <Minimap />
        <SystemLog />
        <Chat />
        <Hotbar />
        <DialogueBox />
        <ShopWindow />
        <CraftWindow />
        <CommissionWindow />
        <ExchangeWindow />
        <StorageWindow />
        <TradeWindow />
        <PlayerMenu />
        <TradeAsk />
        <PartyAsk />
        <ThreadAsk />
        <InventoryWindow />
        <EquipmentWindow />
        <StatsWindow />
        <WorldmapWindow />
        <ErrandsWindow />
        <SkillsWindow />
        <FriendsWindow />
        <Fallen />
        <Notices />
      </div>
      <SystemModals />
      <Offline />
      <Loading />
    </TooltipProvider>
  )
}
