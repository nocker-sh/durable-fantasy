import { Pixel } from "./shared.tsx";
import { STAT_NAME } from "#/world/core/growth.ts";
import { ITEMS, ITEM_IDS, KIND_NAME, QUALITIES, RARITY_NAME, SLOT_NAME, sellPrice } from "#/world/core/items.ts";
import { priceOf, qualitiesOf } from "#/world/core/makers.ts";
import { SHOPS, shopBuys, type ShopId } from "#/world/core/shops.ts";
import { iconUrl } from "#/world/art/icons.ts";
import { ITEM_SPRITES } from "#/world/art/item-art.ts";
import { sheet } from "./schema.ts";
import { effects, needsText } from "./shared.tsx";
import { texUrl } from "./art.tsx";

// ---------------------------------------------------------------- the sheets

const items = sheet({
  id: "items",
  label: "アイテム",
  rows: () => ITEM_IDS,
  key: (id) => id,
  name: (id) => ITEMS[id].name,
  kind: (id) => KIND_NAME[ITEMS[id].kind],
  icon: (id) => <Pixel src={iconUrl(id)} />,
  cols: [
    { label: "レア度", get: (id) => RARITY_NAME[ITEMS[id].rarity], w: "w-16" },
    { label: "重さ", get: (id) => ITEMS[id].weight, w: "w-12" },
    { label: "買値", get: (id) => ITEMS[id].price || "—", w: "w-14" },
    { label: "売値", get: (id) => (ITEMS[id].kind === "key" ? "—" : sellPrice(id)), w: "w-14" },
    { label: "効果", get: (id) => effects(id).join(" ") },
  ],
  more: (id) => {
    const d = ITEMS[id];
    return [
      { title: "説明", head: [], rows: [[d.description]] },
      ...(d.made ? [{ title: "品質ごとの値段", head: ["品質", "G"], rows: qualitiesOf(id).map((q) => [QUALITIES[q], priceOf(id, q)]) }] : []),
      ...(d.kind === "key"
        ? []
        : [
            {
              title: "店の買い取り",
              head: ["G", "店"],
              rows: [...new Set((Object.keys(SHOPS) as ShopId[]).map((s) => shopBuys(s, id)))]
                .sort((a, b) => b - a)
                .map((g) => {
                  const at = (Object.keys(SHOPS) as ShopId[]).filter((s) => shopBuys(s, id) === g);
                  return [g, at.length === Object.keys(SHOPS).length ? "どの店も" : at.map((s) => SHOPS[s].name).join("、")];
                }),
            },
          ]),
      ...(d.equip
        ? [
            {
              title: "装備",
              head: ["部位", "必要", "成長", "間合い(ms)"],
              rows: [
                [
                  d.equip.part === "accessory" ? SLOT_NAME.accessory1 : SLOT_NAME[d.equip.part],
                  needsText(d.equip.needs ?? {}),
                  Object.entries(d.equip.scale ?? {})
                    .map(([k, g]) => `${STAT_NAME[k as keyof typeof STAT_NAME]}${g}`)
                    .join(" "),
                  d.equip.delay ?? "",
                ],
              ],
            },
          ]
        : []),
    ];
  },
});

const itemArt = sheet<string>({
  id: "item-art",
  label: "アイテムの絵",
  rows: () => Object.keys(ITEM_SPRITES),
  key: (k) => k,
  name: (k) => k,
  kind: () => "描いた絵",
  icon: (k) => <img src={texOf2(k)} alt="" style={{ imageRendering: "pixelated" }} />,
  cols: [{ label: "大きさ", get: (k) => `${ITEM_SPRITES[k].w}×${ITEM_SPRITES[k].h}`, w: "w-20" }],
  refs: (k) => ITEM_IDS.filter((i) => ITEMS[i].icon === k).map((i) => ({ sheet: "items", id: i, as: "絵" })),
});

const artCache = new Map<string, string>();

const texOf2 = (k: string) => artCache.get(k) ?? (artCache.set(k, texUrl(ITEM_SPRITES[k])), artCache.get(k)!);

export { items, itemArt };
