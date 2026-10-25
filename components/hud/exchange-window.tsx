// The exchange board (economy.md §5): pick a thing, see who sells and buys at what price and how it
// has gone these past days, put up an order, take yours down, collect what changed hands.
import { useState } from "react"
import { escrowFor, parseSymbol, symbolKey, TRADE_FEE } from "#/world/core/exchange.ts"
import { ITEMS, QUALITIES, sellable, type ItemId } from "#/world/core/items.ts"
import { displayName } from "#/world/core/makers.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Gold } from "#/components/game/gold.tsx"
import { Input } from "#/components/game/input.tsx"
import { Slot } from "#/components/game/slot.tsx"
import { Stepper } from "#/components/game/stepper.tsx"
import { Window } from "#/components/game/window.tsx"

/** Everything that can be traded: plain things as they are, made things by quality. */
const SYMBOLS = (Object.keys(ITEMS) as ItemId[])
  .filter((id) => sellable(id) && !ITEMS[id].tool && ITEMS[id].kind !== "key")
  .flatMap((id) => (ITEMS[id].made ? ([0, 1, 2, 3] as const).map((q) => symbolKey({ item: id, q })) : [id]))

const label = (key: string) => {
  const s = parseSymbol(key)
  return s ? `${ITEMS[s.item].name}${s.q !== undefined ? `（${QUALITIES[s.q]}）` : ""}` : key
}

export function ExchangeWindow() {
  const game = useGame()
  const board = useGameState((s) => s.board)
  const player = useGameState((s) => s.player)
  const busy = useGameState((s) => s.busy)
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [price, setPrice] = useState("")
  const [qty, setQty] = useState(1)
  const [filter, setFilter] = useState("")
  if (!board || !player) return null
  const sym = parseSymbol(board.symbol)
  const v = board.view
  const bestAsk = v?.book.asks[0]?.price,
    bestBid = v?.book.bids[0]?.price
  const p = Number(price) || (side === "buy" ? bestAsk : bestBid) || (sym ? Math.max(1, Math.round(ITEMS[sym.item].price * 0.8)) : 1)
  const slot = sym ? player.bag.findIndex((s) => s?.item === sym.item && s.q === sym.q) : -1
  const have = slot >= 0 ? player.bag[slot]!.count : 0
  const { gold: needs, fee } = escrowFor(side, p, qty)
  const reason = side === "sell" ? (have < qty ? "手元に足りない" : player.gold < fee ? "出品料が足りない" : null) : player.gold < needs ? "所持金が足りない" : null
  const candles = (v?.history ?? []).slice(-14)
  const hi = Math.max(1, ...candles.map((c) => c.high)),
    lo = Math.min(hi, ...candles.map((c) => c.low))
  const list = SYMBOLS.filter((k) => !filter || label(k).includes(filter)).slice(0, 60)
  return (
    <Window id="exchange" title="取引の掲示板" z={30} onClose={() => game.closeBoard()} initial={(w) => ({ x: Math.max(12, w / 2 - 330), y: 90 })} className="w-[660px]">
      <div className="flex gap-3">
        {/* what to look at */}
        <div className="flex w-40 shrink-0 flex-col gap-1.5">
          <Input placeholder="さがす" value={filter} onChange={(e) => setFilter(e.target.value)} className="h-7 text-xs" />
          <ul className="ui-scroll ui-well flex h-[330px] flex-col overflow-y-auto p-1 font-body text-xs">
            {list.map((k) => (
              <li key={k}>
                <button type="button" onClick={() => game.openBoard(k)} className={`w-full truncate px-1 py-0.5 text-left hover:text-brass-hi ${k === board.symbol ? "bg-sunk text-brass-hi" : ""}`}>
                  {label(k)}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* the book and the chart */}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            {sym && <Slot icon={game.iconUrl(sym.item)} rarity={ITEMS[sym.item].rarity} aria-label={label(board.symbol)} />}
            <div className="font-head text-sm text-brass-hi">{label(board.symbol)}</div>
            <div className="ml-auto font-head text-[11px] text-text-dim">
              店の値段 <Gold amount={sym ? ITEMS[sym.item].price : 0} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 font-head text-xs tabular-nums">
            <div className="ui-well p-1.5">
              <p className="mb-1 text-text-dim">売り（安い順）</p>
              {(v?.book.asks ?? []).map((l) => (
                <div key={l.price} className="flex justify-between text-[#e08a7a]">
                  <span>{l.price}G</span>
                  <span>{l.qty}個</span>
                </div>
              ))}
              {!v?.book.asks.length && <p className="text-text-faint">なし</p>}
            </div>
            <div className="ui-well p-1.5">
              <p className="mb-1 text-text-dim">買い（高い順）</p>
              {(v?.book.bids ?? []).map((l) => (
                <div key={l.price} className="flex justify-between text-good">
                  <span>{l.price}G</span>
                  <span>{l.qty}個</span>
                </div>
              ))}
              {!v?.book.bids.length && <p className="text-text-faint">なし</p>}
            </div>
          </div>
          <div className="ui-well p-1.5">
            <p className="mb-1 font-head text-[11px] text-text-dim">この二週間（終値と出来高）</p>
            <svg width="100%" height="64" viewBox="0 0 280 64" preserveAspectRatio="none">
              {candles.map((c, i) => {
                const x = (i + 0.5) * (280 / 14),
                  y = (n: number) => 52 - ((n - lo) / Math.max(1, hi - lo)) * 44
                return (
                  <g key={c.day}>
                    <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke="#a89878" strokeWidth={1} />
                    <rect x={x - 4} width={8} y={Math.min(y(c.open), y(c.close))} height={Math.max(1.5, Math.abs(y(c.open) - y(c.close)))} fill={c.close >= c.open ? "#7cba7c" : "#e08a7a"} />
                    <rect x={x - 4} width={8} y={64 - Math.min(10, c.volume)} height={Math.min(10, c.volume)} fill="#5a5470" />
                  </g>
                )
              })}
              {!candles.length && (
                <text x="140" y="36" textAnchor="middle" fill="#8a8494" fontSize="11">
                  まだ取引がない
                </text>
              )}
            </svg>
          </div>
          {!!v?.last.length && <p className="truncate font-body text-[11px] text-text-dim">出している人: {v.last.map((o) => `${o.by ?? o.name} ${o.price}G×${o.left}`).join("、")}</p>}
        </div>
        {/* an order of your own */}
        <div className="flex w-48 shrink-0 flex-col gap-2 font-head text-xs">
          <div className="flex gap-1">
            <Button size="sm" variant={side === "buy" ? "primary" : "default"} onClick={() => setSide("buy")}>
              買う
            </Button>
            <Button size="sm" variant={side === "sell" ? "primary" : "default"} onClick={() => setSide("sell")}>
              売る
            </Button>
          </div>
          <label className="flex items-center gap-1.5 text-text-dim">
            一つ <Input value={price} placeholder={String(p)} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} className="h-7 w-20 text-xs" />G
          </label>
          <div className="flex items-center gap-1.5 text-text-dim">
            数 <Stepper value={qty} max={side === "sell" ? Math.max(1, have) : 99} onChange={setQty} />
          </div>
          <p className="text-[11px] text-text-dim">
            {side === "buy" ? (
              <>
                預ける <Gold amount={needs} />
              </>
            ) : (
              <>
                手元に {have}個 ・ 売れたら手数料 {Math.round(TRADE_FEE * 100)}%
              </>
            )}
            <br />
            出品料 <Gold amount={fee} />
            （戻らない）
          </p>
          <Button
            variant="primary"
            size="sm"
            disabled={!!reason || busy}
            title={reason ?? undefined}
            onClick={() => void game.placeOrder({ side, price: p, qty, ...(side === "sell" ? { slot } : {}) })}
          >
            掲示板に出す
          </Button>
          {reason && <p className="text-[11px] text-bad">{reason}</p>}
          <div className="ui-rule my-1" />
          <p className="text-brass-hi">あなたの注文</p>
          <ul className="ui-scroll flex max-h-24 flex-col gap-0.5 overflow-y-auto">
            {(v?.mine ?? []).map((o) => (
              <li key={o.id} className="flex items-center gap-1 text-[11px]">
                <span className={o.side === "buy" ? "text-good" : "text-[#e08a7a]"}>{o.side === "buy" ? "買" : "売"}</span>
                <span className="min-w-0 flex-1 truncate">
                  {label(o.symbol)} {o.price}G×{o.left}
                </span>
                <button type="button" className="text-text-dim hover:text-bad" onClick={() => void game.cancelOrder(o.id)}>
                  取消
                </button>
              </li>
            ))}
            {!v?.mine.length && <li className="text-[11px] text-text-faint">なし</li>}
          </ul>
          <p className="text-brass-hi">受取箱</p>
          <p className="text-[11px] text-text-dim">
            <Gold amount={v?.inbox.gold ?? 0} /> ・ {(v?.inbox.items ?? []).map((i) => `${displayName(i.item, i.by)}×${i.count}`).join("、") || "品物なし"}
          </p>
          <Button size="sm" disabled={busy || (!v?.inbox.gold && !v?.inbox.items.length)} onClick={() => void game.claimInbox()}>
            受け取る
          </Button>
        </div>
      </div>
    </Window>
  )
}
