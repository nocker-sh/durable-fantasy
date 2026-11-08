import { SHOP_SIGN, KIND_SIGN } from "#/world/scene/lettering"
import type { ShopKind } from "#/world/core/shop-types"

export const signWord = (shop: string, kind: ShopKind) => SHOP_SIGN[shop] ?? KIND_SIGN[kind]
