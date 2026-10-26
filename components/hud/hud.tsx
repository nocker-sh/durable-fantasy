// Everything drawn over the world (ui.md §2): always-on HUD, windows, modals and notices.
import { TooltipProvider } from "#/components/game/tooltip.tsx"
import { useGameState } from "#/components/game/context.tsx"
import { Chat, SystemLog } from "./chat.tsx"
import { DialogueBox } from "./dialogue.tsx"
import { EquipmentWindow } from "./equipment-window.tsx"
import { Hotbar } from "./hotbar.tsx"
import { InventoryWindow } from "./inventory-window.tsx"
import { Loading } from "./loading.tsx"
import { Offline } from "./offline.tsx"
import { Minimap } from "./minimap.tsx"
import { Notices } from "./notices.tsx"
import { ShopWindow } from "./shop-window.tsx"
import { CraftWindow } from "./craft-window.tsx"
import { CommissionWindow } from "./commission-window.tsx"
import { ExchangeWindow } from "./exchange-window.tsx"
import { StatsWindow } from "./stats-window.tsx"
import { StatusFrame } from "./status-frame.tsx"
import { SystemModals } from "./system-menu.tsx"
import { WorldmapWindow } from "./worldmap-window.tsx"
import { ErrandsWindow } from "./errands-window.tsx"
import { Fallen } from "./fallen.tsx"
import { StorageWindow } from "./storage-window.tsx"
import { PlayerMenu, TradeAsk, TradeWindow } from "./trade-window.tsx"
import { PartyAsk, PartyFrame } from "./party-frame.tsx"
import { SkillsWindow } from "./skills-window.tsx"
import { FriendsWindow, ThreadAsk } from "./friends-window.tsx"

export function Hud() {
  const departed = useGameState((s) => s.departed)
  const replaced = useGameState((s) => s.connectionReplaced)
  if (departed) return <Loading />
  if (replaced) return <Offline />
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
