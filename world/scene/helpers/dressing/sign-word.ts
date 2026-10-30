import type { ShopKind } from "#/world/core/shop-types"
const SIGN_WORD: Partial<Record<string, string>> = { tavern: "酒場", inn: "宿", smithy: "鍛冶", woodworker: "木工", leather: "革", bakery: "パン" }
import { SHOP_KIND_NAME } from "#/world/core/shop-kind-names"

export const signWord = (shop: string, kind: ShopKind) => SIGN_WORD[shop] ?? SHOP_KIND_NAME[kind].split("・")[0]
