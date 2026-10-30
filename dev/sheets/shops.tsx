import { StreetSellers } from "./street-sellers"
import { Pixel } from "#/dev/sheets/pixel"
import { ITEMS } from "#/world/core/items/catalog"
import { KIND_NAME, QUALITIES } from "#/world/core/items/kinds"
import type { ItemId } from "#/world/core/items/catalog"
import { MAKERS } from "#/world/core/makers"
import { BATCHES } from "#/world/core/market-batches"
import { SHOPS } from "#/world/core/shops"
import { SHOP_KIND_NAME } from "#/world/core/shop-kind-names"
import type { ShopDefinition } from "#/world/core/shop-types"
import type { ShopId } from "#/world/core/shop-types"
import { formatTime } from "#/world/core/format-time"
import { iconUrl } from "#/world/art/icon-url"
import { sheet } from "./schema"
import { mapName } from "#/dev/sheets/map-name"
import { ref } from "#/dev/sheets/ref"

const shops = sheet({
  id: "shops",
  label: "店",
  top: () => <StreetSellers />,
  rows: () => Object.keys(SHOPS) as ShopId[],
  key: (id) => id,
  name: (id) => SHOPS[id].name,
  kind: (id) => SHOP_KIND_NAME[SHOPS[id].kind],
  cols: [
    { label: "マップ", get: (id) => mapName(SHOPS[id].map) },
    { label: "店主", get: (id) => SHOPS[id].keepers.join("、") },
    { label: "品数", get: (id) => SHOPS[id].stock.length, w: "w-12" },
    { label: "屋台", get: (id) => ((SHOPS[id] as ShopDefinition).at ? "○" : ""), w: "w-12" },
  ],
  refs: (id) => {
    const s = SHOPS[id] as ShopDefinition
    return [...ref("maps", s.map, "場所"), ...s.keepers.flatMap((k) => ref("npcs", k, "店主")), ...s.stock.map((i) => ({ sheet: "items", id: i, as: "売り物" }))]
  },
  more: (id) => {
    const s = SHOPS[id] as ShopDefinition
    return [
      {
        title: "買取倍率",
        head: ["種類", "倍"],
        rows: Object.entries(s.rates ?? {}).map((entry) => {
          const k = entry[0]
          const r = entry[1]
          return [KIND_NAME[k as keyof typeof KIND_NAME], r]
        }),
      },
    ]
  },
})

type MakerRow = { maker: string; item: ItemId }

const makers = sheet<MakerRow>({
  id: "makers",
  label: "作り手",
  rows: () =>
    Object.entries(MAKERS).flatMap((entry2) => {
      const maker = entry2[0]
      const list = entry2[1]
      return Object.keys(list).map((item) => ({ maker, item: item as ItemId }))
    }),
  key: (r) => `${r.maker}:${r.item}`,
  name: (r) => `${r.maker}の${ITEMS[r.item].name}`,
  kind: () => "作り手",
  icon: (r) => <Pixel src={iconUrl(r.item, r.maker)} />,
  cols: [
    { label: "効き", get: (r) => `×${MAKERS[r.maker][r.item]!.effect ?? 1}`, w: "w-14" },
    { label: "値段", get: (r) => `×${MAKERS[r.maker][r.item]!.price ?? 1}`, w: "w-14" },
    { label: "品質の出方", get: (r) => MAKERS[r.maker][r.item]!.tiers.map((t, q) => `${QUALITIES[q]}${Math.round(t * 100)}`).join(" "), w: "w-40" },
    { label: "評判", get: (r) => MAKERS[r.maker][r.item]!.note },
  ],
  refs: (r) => [...ref("npcs", r.maker, "作り手"), { sheet: "items", id: r.item, as: "品" }],
})

type BatchRow = { shop: string; item: ItemId }

const batches = sheet<BatchRow>({
  id: "batches",
  label: "焼き上がり",
  rows: () =>
    Object.entries(BATCHES).flatMap((entry3) => {
      const shop = entry3[0]
      const list = entry3[1]
      return Object.keys(list).map((item) => ({ shop, item: item as ItemId }))
    }),
  key: (r) => `${r.shop}:${r.item}`,
  name: (r) => ITEMS[r.item].name,
  kind: (r) => (SHOPS[r.shop as ShopId] as ShopDefinition | undefined)?.name ?? r.shop,
  icon: (r) => <Pixel src={iconUrl(r.item)} />,
  cols: [
    { label: "時刻", get: (r) => BATCHES[r.shop][r.item]!.at.map(formatTime).join(" "), w: "w-36" },
    { label: "数", get: (r) => BATCHES[r.shop][r.item]!.count, w: "w-10" },
    {
      label: "住民が買う",
      get: (r) => {
        const e = BATCHES[r.shop][r.item]!.eaten
        return e ? `${e.after}分後に${e.count}` : ""
      },
    },
  ],
  refs: (r) => [...ref("shops", r.shop in SHOPS ? r.shop : null, "店"), { sheet: "items", id: r.item, as: "品" }],
})

export { shops, makers, batches }
