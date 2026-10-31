import type { Context } from "#/world/core/apply"
import type { Command, ServerCommand } from "#/world/core/commands"
import type { TradeProposal } from "#/world/core/trade-transaction-types"
import type { OrderIntent } from "#/world/core/exchange-types"
import type { SkillId } from "#/world/core/skill-types"
import type { PlayerRecord } from "#/world/server/player-record"

export type PlayerTradeContext = Readonly<{ state: PlayerRecord; setAlarm(at: number): Promise<void> }>
export type PlayerTradeInput = Readonly<{ peer: string; local: TradeProposal; remote: TradeProposal }>
export type PlayerTradeDecision = Readonly<{ id: string; revision: number; decision: "committed" | "aborted" }>
export type PlayerOrderInput = Readonly<{ id: number; intent: OrderIntent }>
export type PlayerStrikeInput = Readonly<{ source: string; id: number; art?: SkillId; life?: number }>
export type PlayerCommandInput = Readonly<{ command: Command | ServerCommand; context: Omit<Context, "now"> }>
