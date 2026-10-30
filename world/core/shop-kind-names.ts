import type { ShopKind } from "#/world/core/shop-types"

export const SHOP_KIND_NAME: Record<ShopKind, string> = {
  food: "食料品",
  inn: "宿・食堂",
  weapon: "武器",
  armor: "防具",
  tools: "道具・雑貨",
  medicine: "薬",
  crystal: "結晶",
  tailor: "仕立て",
  buyer: "買取",
}
