import { expect, it, vi } from "vitest"
import { emptyOffer } from "#/world/core/empty-offer"
import { newPlayer } from "#/world/core/new-player"
import { getTradeProposals } from "#/world/server/map-room/get-trade-proposals"
import { advanceTradeSettlement } from "#/world/server/map-room/advance-trade-settlement"
import { prepareTradeSettlement } from "#/world/server/map-room/prepare-trade-settlement"
import { publishSettledTrade } from "#/world/server/map-room/publish-settled-trade"
import type { TradeSide, Presence } from "#/world/server/map-room/presence"
import type { TradeRecord } from "#/world/core/trade-transaction-types"
import type { TradeJob } from "#/world/server/trade-coordinator"
import type { TradeSettlementContext } from "#/world/server/map-room/trade-settlement-types"

type Rpc = TradeSettlementContext["playerA"]

function fixture() {
  const mine: TradeSide = { with: "b", session: "session", open: true, offer: emptyOffer(), shown: [], locked: true, done: true }
  const other: Presence = { owner: "b", player: null, route: [], since: 0, said: [], engaged: null, trade: { ...mine, with: "a" } }
  const proposals = getTradeProposals({ id: "job", mine, other: mine, recordA: null, recordB: null })
  const job: TradeJob = { peer: "b", ...proposals, decision: "committed", finished: true, reason: null }
  const read = vi.fn(async () => newPlayer())
  const tradeStatus = vi.fn(async (): Promise<TradeRecord | null> => null)
  const beginTrade = vi.fn(async (): Promise<Awaited<ReturnType<Rpc["beginTrade"]>>> => ({ ok: true, job }))
  const advanceTrade = vi.fn(async (): Promise<TradeJob | null> => job)
  const playerA = { read, tradeStatus, beginTrade, advanceTrade }
  const playerB = {
    read: vi.fn(async () => newPlayer()),
    tradeStatus: vi.fn(async (): Promise<TradeRecord | null> => null),
    beginTrade: vi.fn(async (): Promise<Awaited<ReturnType<Rpc["beginTrade"]>>> => ({ ok: true, job })),
    advanceTrade: vi.fn(async (): Promise<TradeJob | null> => job),
  }
  return { mine, other, proposals, job, playerA, playerB, context: { ownerA: "a", ownerB: "b", playerA, playerB } }
}

it("creates reciprocal proposals while advancing each participant's own revision", () => {
  const request = fixture()
  const peer: TradeSide = { ...request.mine, offer: { lots: [], gold: 7 }, shown: [{ item: "log", count: 2 }] }
  const record: TradeRecord = { proposal: { ...request.proposals.local, revision: 9 }, status: "aborted", inventory: { bag: [], gold: 0 } }
  const proposals = getTradeProposals({ id: "next", mine: request.mine, other: peer, recordA: record, recordB: null })
  expect(proposals.local).toMatchObject({ id: "next", revision: 10, incoming: peer.shown, gold: 7 })
  expect(proposals.remote).toMatchObject({ id: "next", revision: 1, outgoing: peer.shown, incoming: request.mine.shown, gold: 0 })
  expect(proposals.local.offer).toBe(request.mine.offer)
  expect(record.proposal.revision).toBe(9)
})

it.each([true, false])("uses owner order for coordination and advances two save boundaries (first=%s)", async (first) => {
  const request = fixture()
  const context = { ...request.context, ownerA: first ? "a" : "z" }
  expect(await advanceTradeSettlement({ context, ...request.proposals })).toBeNull()
  const coordinator = first ? request.playerA : request.playerB
  expect(coordinator.beginTrade).toHaveBeenCalledExactlyOnceWith({
    peer: first ? "b" : "z",
    local: first ? request.proposals.local : request.proposals.remote,
    remote: first ? request.proposals.remote : request.proposals.local,
  })
  expect(coordinator.advanceTrade).toHaveBeenCalledTimes(2)
  const nonCoordinator = first ? request.playerB : request.playerA
  expect(nonCoordinator.beginTrade).not.toHaveBeenCalled()
  expect(nonCoordinator.advanceTrade).not.toHaveBeenCalled()
})

it("does not advance a refused reservation and preserves pending or aborted results", async () => {
  const request = fixture()
  request.playerA.beginTrade.mockResolvedValueOnce({ ok: false, reason: "NOT_READY" })
  expect(await advanceTradeSettlement({ context: request.context, ...request.proposals })).toBe("NOT_READY")
  expect(request.playerA.advanceTrade).not.toHaveBeenCalled()
  request.playerA.advanceTrade.mockResolvedValue(null)
  expect(await advanceTradeSettlement({ context: request.context, ...request.proposals })).toBe("PENDING")
  request.playerA.advanceTrade.mockResolvedValue({ ...request.job, reason: "NOT_ENOUGH" })
  expect(await advanceTradeSettlement({ context: request.context, ...request.proposals })).toBe("NOT_ENOUGH")
})

it("rejects existing prepared records before making a new proposal", async () => {
  const request = fixture()
  request.playerB.tradeStatus.mockResolvedValue({ proposal: request.proposals.remote, status: "prepared", inventory: { bag: [], gold: 0 } })
  expect(await prepareTradeSettlement(request)).toEqual({ ok: false, reason: "NOT_READY" })
  expect(request.playerA.beginTrade).not.toHaveBeenCalled()
})

it("validates current inventories before building the pair of proposals", async () => {
  const request = fixture()
  expect(await prepareTradeSettlement(request)).toMatchObject({ ok: true, local: { revision: 1 }, remote: { revision: 1 } })
  request.mine.offer = { lots: [], gold: Number.MAX_SAFE_INTEGER }
  expect(await prepareTradeSettlement(request)).toMatchObject({ ok: false })
})

it("publishes both saved states even if one recipient rejects the notification", async () => {
  const request = fixture()
  const sender = {
    send: vi.fn(async () => {
      throw Error("Disconnected")
    }),
  }
  const recipient = { send: vi.fn(async () => {}) }
  await expect(publishSettledTrade({ sender, recipient, playerA: request.playerA, playerB: request.playerB })).resolves.toBeUndefined()
  expect(sender.send).toHaveBeenCalledOnce()
  expect(recipient.send).toHaveBeenCalledOnce()
  expect(request.playerA.read).toHaveBeenCalledOnce()
  expect(request.playerB.read).toHaveBeenCalledOnce()
})
