// A shop (ui.md §3.6), opened from the conversation: buy from the stock, or pick from the bag to
// sell. Buttons grey out with the reason when the server would refuse.
import { useEffect, useState } from "react"
import { REASON_TEXT } from "#/world/core/commands"
import { roomFor } from "#/world/core/room-for"
import { ITEMS } from "#/world/core/items/catalog"
import { QUALITIES, QUALITY_PRICE } from "#/world/core/items/kinds"
import { sellable } from "#/world/core/items/sellable"
import { SHOPS } from "#/world/core/shops"
import { makerAt } from "#/world/core/maker-at"
import { sellsFor } from "#/world/core/sells-for"
import { shopFriend } from "#/world/core/shop-friend"
import { friendPrice } from "#/world/core/friend-price"
import { displayName } from "#/world/core/display-name"
import { priceOf } from "#/world/core/price-of"
import { qualitiesOf } from "#/world/core/qualities-of"
import { formatTime } from "#/world/core/format-time"
import { jstMinutes } from "#/world/core/jst-minutes"
import type { Offer } from "#/world/state"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Gold } from "#/components/game/gold"
import { Slot } from "#/components/game/slot"
import { Stepper } from "#/components/game/stepper"
import { Tabs } from "#/components/game/tabs"
import { TabsContent } from "#/components/game/tabs-content"
import { TabsList } from "#/components/game/tabs-list"
import { TabsTrigger } from "#/components/game/tabs-trigger"
import { Tooltip } from "#/components/game/tooltip"
import { TooltipContent } from "#/components/game/tooltip-content"
import { TooltipTrigger } from "#/components/game/tooltip-trigger"
import { Window } from "#/components/game/window"
import { ItemTooltip } from "#/components/hud/item-tooltip"

export function ShopWindow() {
  const game = useGame()
  const shop = useGameState((s) => s.shop)
  const player = useGameState((s) => s.player)
  const stock = useGameState((s) => s.stock)
  const tabState = useState("buy"),
    tab = tabState[0],
    setTab = tabState[1]
  const pickedState = useState<number | null>(null),
    picked = pickedState[0],
    setPicked = pickedState[1]

  // right-clicking in the bag picks an item to sell
  useEffect(() => {
    const pick = (e: Event) => {
      setTab("sell")
      setPicked((e as CustomEvent<number>).detail)
    }
    window.addEventListener("ui:sell-pick", pick)
    return () => window.removeEventListener("ui:sell-pick", pick)
  }, [])
  useEffect(() => setPicked(null), [shop])

  if (!shop) return null
  // the shelves as the server last said; until it answers, the list as it would be
  const offers: Offer[] =
    stock?.shop === shop
      ? [...stock.offers]
      : SHOPS[shop].stock.flatMap((item) => {
          const by = ITEMS[item].made ? makerAt(shop, item) : undefined
          return qualitiesOf(item, by).map((q) => ({ item, q, price: priceOf(item, q, by), left: null, next: null }))
        })
  return (
    <Window
      id="shop"
      title={SHOPS[shop].name}
      z={30}
      onClose={() => game.closeShop()}
      initial={() => ({ x: 364, y: 104 })}
      className="w-[356px]"
      footer={
        <div className="flex items-center justify-between font-head text-xs text-text-dim">
          <span>所持金</span>
          <Gold amount={player?.gold ?? 0} className="text-[13px] text-text" />
        </div>
      }
    >
      <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
        <TabsList className="mb-2.5">
          <TabsTrigger value="buy">買う</TabsTrigger>
          <TabsTrigger value="sell">売る</TabsTrigger>
        </TabsList>
        <TabsContent value="buy">
          <ul className="ui-scroll flex max-h-[340px] flex-col gap-1 overflow-y-auto pr-1">
            {offers.map((o) => (
              <BuyRow key={`${o.item}-${o.q}`} offer={o} />
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="sell">
          <SellPanel picked={picked} onPick={setPicked} />
        </TabsContent>
      </Tabs>
    </Window>
  )
}

function BuyRow(inputProps: { offer: Offer }) {
  const offer = inputProps.offer

  const game = useGame()
  const player = useGameState((s) => s.player)
  const shop = useGameState((s) => s.shop)!
  const busy = useGameState((s) => s.busy)
  const countState = useState(1),
    count = countState[0],
    setCount = countState[1]
  const itemSource = offer,
    item = itemSource.item,
    price = itemSource.price,
    left = itemSource.left,
    next = itemSource.next
  const d = ITEMS[item]
  const q = d.made ? offer.q : undefined
  const by = d.made ? makerAt(shop, item) : undefined
  const list = priceOf(item, offer.q, by)
  const mark = by ? { q: offer.q, by } : undefined
  // what we pay: the shop's price, less a friend's discount (core/friend-price.ts)
  const pay = player ? friendPrice(price, shopFriend(player, shop)) : price
  const affordable = player ? Math.floor(player.gold / pay) : 0
  const max = Math.max(1, Math.min(99, affordable, left ?? 99, player ? roomFor(player.bag, item, mark) : 1))
  const n = Math.min(count, max)
  const soldOut = left === 0
  const reason = soldOut ? "SOLD_OUT" : game.preview({ type: "buy", shop, item, count: n, ...(q !== undefined ? { q } : {}) })
  const buy = (
    <Button
      variant="primary"
      size="sm"
      disabled={!!reason || busy}
      onClick={() => {
        game.buy({ item: item, count: n, q: q, price: price })
        setCount(1)
      }}
    >
      買う
    </Button>
  )
  return (
    <li className="ui-well flex items-center gap-2.5 p-1.5">
      <ItemTooltip item={item} mark={mark} side="left">
        <Slot icon={game.iconUrl(item, by)} rarity={d.rarity} dim={affordable === 0} aria-label={displayName(item, by)} />
      </ItemTooltip>
      <div className="min-w-0 flex-1">
        <div className="break-words font-body text-[13px] leading-snug">{d.name}</div>
        {by && (
          <div className="truncate font-head text-[11px] text-text-dim" title={by}>
            作り手：{by}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {d.made && <span className="bg-sunk px-1 font-head text-[11px] leading-4 text-brass-hi shadow-[inset_0_0_0_1px_var(--color-brass-lo)]">{QUALITIES[offer.q]}</span>}
          <Gold amount={pay * n} className={affordable < n ? "text-xs text-bad" : "text-xs text-text-dim"} />
          {price < list && <span className="font-head text-[11px] text-good">値引き</span>}
          {pay < price && <span className="font-head text-[11px] text-good">なじみ</span>}
          {left !== null && (
            <span className={soldOut ? "font-head text-[11px] text-bad" : "font-head text-[11px] text-text-dim"}>
              {soldOut ? `売り切れ${next ? `（次は ${formatTime(jstMinutes(next))}）` : ""}` : `残り ${left}`}
            </span>
          )}
        </div>
      </div>
      <Stepper value={n} max={max} onChange={setCount} />
      {reason ? (
        <Tooltip>
          <TooltipTrigger render={<span />}>{buy}</TooltipTrigger>
          <TooltipContent>{REASON_TEXT[reason]}</TooltipContent>
        </Tooltip>
      ) : (
        buy
      )}
    </li>
  )
}

function SellPanel(inputProps2: { picked: number | null; onPick: (slot: number | null) => void }) {
  const picked = inputProps2.picked
  const onPick = inputProps2.onPick

  const game = useGame()
  const shop = useGameState((s) => s.shop)
  const player = useGameState((s) => s.player)
  const busy = useGameState((s) => s.busy)
  const countState2 = useState(1),
    count = countState2[0],
    setCount = countState2[1]
  const stock = useGameState((s) => s.stock)
  const bag = player?.bag ?? []
  const stack = picked !== null ? bag[picked] : null
  // what the shop pays now (by its stock), else its list price
  const each = (s: NonNullable<typeof stack>) => {
    const now = stock?.buys[s.item]
    return now === undefined ? sellsFor(shop!, s) : ITEMS[s.item].made ? Math.max(1, Math.floor(now * QUALITY_PRICE[s.q ?? 1])) : now
  }
  useEffect(() => setCount(1), [picked])
  return (
    <div className="flex flex-col gap-2.5">
      <div className="ui-well grid grid-cols-6 gap-1 p-1.5">
        {bag.map((s, index) => (
          <ItemTooltip key={index} item={s?.item} mark={s} side="left">
            <Slot
              icon={s ? game.iconUrl(s.item, s.by) : null}
              rarity={s ? ITEMS[s.item].rarity : undefined}
              count={s?.count}
              dim={!!s && !sellable(s.item)}
              over={picked === index}
              disabled={!s || !sellable(s.item)}
              aria-label={s ? displayName(s.item, s.by) : "空き"}
              onClick={() => onPick(index)}
              className="disabled:cursor-default"
            />
          </ItemTooltip>
        ))}
      </div>
      <div className="flex h-9 items-center gap-2.5 font-body text-[13px]">
        {stack ? (
          <>
            <span className="min-w-0 flex-1 truncate">
              {displayName(stack.item, stack.by)}
              {ITEMS[stack.item].made && `（${QUALITIES[stack.q ?? 1]}）`}
            </span>
            <Gold amount={each(stack) * Math.min(count, stack.count)} className="text-xs" />
            <Stepper value={Math.min(count, stack.count)} max={stack.count} onChange={setCount} />
            <Button
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={() => {
                game.sell(picked!, Math.min(count, stack.count))
                if (Math.min(count, stack.count) === stack.count) onPick(null)
              }}
            >
              売る
            </Button>
          </>
        ) : (
          <span className="text-text-dim">売る品を選ぶ。</span>
        )}
      </div>
    </div>
  )
}
