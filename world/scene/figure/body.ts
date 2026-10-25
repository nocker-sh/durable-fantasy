import type { Skel } from "../rig"
import type { Primitive } from "../../../lib/graphics/ray/primitives.ts"
import type { V3, M3 } from "../../../lib/graphics/ray/vector.ts"
import type { Look, Item } from "./look.ts"
import { createBodyContext } from "./context.ts"
import { buildLegs } from "./legs.ts"
import { buildClothes } from "./clothes.ts"
import { buildArms } from "./arms.ts"
import { buildHead } from "./head.ts"
import { buildHair } from "./hair.ts"
import { buildHats } from "./hats.ts"
import { buildShield } from "./shield.ts"
import { buildHeldItem } from "./items.ts"

interface Built {
  prims: Primitive[]
  head: { c: V3; r: number; M: M3 }
}

function buildBody(L: Look, K: Skel, item: Item): Built {
  const context = createBodyContext(L, K, item)
  buildLegs(context)
  const clothes = buildClothes(context)
  const arms = buildArms({ ...context, ...clothes })
  const head = buildHead(context)
  const hair = buildHair({ ...context, ...head })
  buildHats({ ...context, ...head, ...hair })
  buildShield({ ...context, ...arms })
  buildHeldItem({ ...context, ...arms })
  return { prims: context.prims, head: { c: head.hc, r: head.headR, M: head.M } }
}

export { buildBody }
