import type { GatherRequest } from "#/world/core/gather-receipt-types"
import type { Transition } from "#/world/core/transition"
import type { NatureRecord } from "#/world/server/nature-record-types"

export type NatureContext = { state: NatureRecord; id: { toString(): string }; setAlarm(at: number): Promise<void> }

export type GatherPlayer = { ownsConnection(connection: string): Promise<boolean>; receiveGather(source: string, request: GatherRequest): Promise<Transition> }

export type GatherPlayers = (owner: string) => GatherPlayer

export const RETRY_MS = 5000

export const BATCH = 20
