// Everything drawn over the world (ui.md §2): always-on HUD, windows, modals and notices.
import { TooltipProvider } from "#/components/game/tooltip-provider"
import { useGameState } from "#/hooks/use-game-state"
import { Chat } from "#/components/hud/chat"
import { SystemLog } from "#/components/hud/system-log"
import { DialogueBox } from "./dialogue"
import { EquipmentWindow } from "./equipment-window"
import { Hotbar } from "./hotbar"
import { InventoryWindow } from "./inventory-window"
import { Loading } from "#/components/hud/loading"
import { Offline } from "./offline"
import { Minimap } from "./minimap"
import { Notices } from "./notices"
import { ShopWindow } from "./shop-window"
import { CraftWindow } from "./craft-window"
import { CommissionWindow } from "./commission-window"
import { ExchangeWindow } from "./exchange-window"
import { StatsWindow } from "./stats-window"
import { StatusFrame } from "./status-frame"
import { SystemModals } from "./system-menu"
import { WorldmapWindow } from "./worldmap-window"
import { ErrandsWindow } from "./errands-window"
import { Fallen } from "./fallen"
import { StorageWindow } from "./storage-window"
import { PlayerMenu } from "#/components/hud/player-menu"
import { TradeAsk } from "#/components/hud/trade-ask"
import { TradeWindow } from "#/components/hud/trade-window"
import { PartyAsk } from "#/components/hud/party-ask"
import { PartyFrame } from "#/components/hud/party-frame"
import { SkillsWindow } from "./skills-window"
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
