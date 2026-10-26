import { useState } from "react"
import { SHOPS, type ShopDefinition, type ShopId } from "#/world/core/shops.ts"
import { ITEMS } from "#/world/core/items.ts"
import { formatTime } from "#/world/core/clock.ts"
import { shopOpen } from "#/world/maps/index.ts"
import { RowLink } from "./links"
import { mapName } from "./shared"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table.tsx"

const sellers = (Object.entries(SHOPS) as [ShopId, ShopDefinition][]).filter(([, shop]) => shop.at)

/** Uses the same schedule check as the map room; no copied opening hours. */
export function StreetSellers() {
  const [minute, setMinute] = useState(7 * 60)
  const open = new Set(sellers.filter(([id]) => shopOpen(id, minute)).map(([id]) => id))
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
              const [hours, minutes] = value.split(":").map(Number)
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
      <Table>
        <TableHeader>
          <TableRow>
            {["店", "営業", "場所", "売り手", "品揃え"].map((label) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map(([id, shop]) => (
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
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
