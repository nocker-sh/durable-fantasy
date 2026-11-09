import { useState } from "react"
import { SHOPS } from "#/world/core/shops"
import type { ShopDefinition } from "#/world/core/shop-types"
import type { ShopId } from "#/world/core/shop-types"
import { ITEMS } from "#/world/core/items/catalog"
import { formatTime } from "#/world/core/format-time"
import { shopOpen } from "#/world/maps/shop-open"
import { RowLink } from "#/dev/sheets/row-link"
import { mapName } from "#/dev/sheets/map-name"
import { Table } from "#/components/ui/table"
import { TableBody } from "#/components/ui/table-body"
import { TableCell } from "#/components/ui/table-cell"
import { TableHead } from "#/components/ui/table-head"
import { TableHeader } from "#/components/ui/table-header"
import { TableRow } from "#/components/ui/table-row"

const sellers = (Object.entries(SHOPS) as [ShopId, ShopDefinition][]).filter((entry) => {
  const shop = entry[1]
  return shop.at
})

/** Uses the same schedule check as the map room; no copied opening hours. */
export function StreetSellers() {
  const minuteState = useState(7 * 60),
    minute = minuteState[0],
    setMinute = minuteState[1]
  const open = new Set(
    sellers
      .filter((entry2) => {
        const id = entry2[0]
        return shopOpen(id, minute)
      })
      .map((entry3) => {
        const id = entry3[0]
        return id
      }),
  )
  return (
    <section className="space-y-3 rounded-md border p-3" aria-label="路上販売の時間割">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold">路上販売の時間割</h2>
        <label className="flex items-center gap-2 text-xs">
          時刻
          <input
            type="time"
            aria-label="路上販売の時刻"
            className="rounded border px-2 py-1"
            value={formatTime(minute)}
            onChange={(event) => {
              const value = event.target.value
              if (!value) return
              const hoursState = value.split(":").map(Number),
                hours = hoursState[0],
                minutes = hoursState[1]
              setMinute(hours * 60 + minutes)
            }}
          />
        </label>
        <span className="text-xs" aria-live="polite">
          出店中 {open.size} / {sellers.length}
        </span>
      </div>
      <input type="range" aria-label="路上販売の時刻スライダー" min={0} max={1439} step={1} value={minute} onChange={(event) => setMinute(Number(event.target.value))} className="w-full" />
      <p className="text-xs text-muted-foreground">住民の日課に基づく出店予定。品揃えは定義上の販売品で、共有在庫の残数は含みません。</p>
      <Table className="table-fixed [&_td]:whitespace-normal [&_td]:[overflow-wrap:anywhere]">
        <TableHeader>
          <TableRow>
            {["店", "営業", "場所", "売り手", "品揃え"].map((label) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map((entry4) => {
            const id = entry4[0]
            const shop = entry4[1]
            return (
              <TableRow key={id} data-seller={id}>
                <TableCell>
                  <RowLink sheet="shops" id={id}>
                    {shop.name}
                  </RowLink>
                </TableCell>
                <TableCell className="whitespace-nowrap">{open.has(id) ? "出店中" : "不在"}</TableCell>
                <TableCell>
                  <RowLink sheet="maps" id={shop.map}>
                    {mapName(shop.map)}
                  </RowLink>
                </TableCell>
                <TableCell>
                  {shop.keepers.map((name, i) => (
                    <span key={name}>
                      {i > 0 && "、"}
                      <RowLink sheet="npcs" id={name}>
                        {name}
                      </RowLink>
                    </span>
                  ))}
                </TableCell>
                <TableCell className="whitespace-normal">
                  {shop.stock.map((id, i) => (
                    <span key={id}>
                      {i > 0 && "、"}
                      <RowLink sheet="items" id={id}>
                        {ITEMS[id].name}
                      </RowLink>
                    </span>
                  ))}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </section>
  )
}
