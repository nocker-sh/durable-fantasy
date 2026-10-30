import type { Skel } from "#/world/scene/rig"
import type { Primitive } from "../../../lib/graphics/ray/primitive-types"
import type { Vector3Tuple as V3, Matrix3 as M3 } from "../../../lib/engine/vector3-types"
import type { Look, Item } from "./look"
import { createBodyContext } from "./context"
import { buildLegs } from "./legs"
import { buildClothes } from "./clothes"
import { buildArms } from "./arms"
import { buildHead } from "./head"
import { buildHair } from "./hair"
import { buildHats } from "./hats"
import { buildShield } from "./shield"
import { buildHeldItem } from "./items"

type Built = {
  skirtParts: readonly Primitive[]
  trouserParts: readonly Primitive[]
  tunicParts: readonly Primitive[]
  coatTailParts: readonly Primitive[]
  armParts: ReturnType<typeof buildArms>["parts"]
  legParts: Readonly<Record<"l" | "r", readonly Primitive[]>>
  shoeParts: ReturnType<typeof buildLegs>["shoeParts"]
  footwear: ReturnType<typeof buildLegs>["footwear"]
  knees: ReturnType<typeof buildLegs>["knees"]
  prims: Primitive[]
  head: { c: V3; r: number; M: M3 }
}

function buildBody(L: Look, K: Skel, item: Item): Built {
  const context = createBodyContext(L, K, item)
  const legs = buildLegs(context)
  const clothes = buildClothes(context)
  const arms = buildArms({ ...context, ...clothes })
  const head = buildHead(context)
  const hair = buildHair({ ...context, ...head })
  buildHats({ ...context, ...head, ...hair })
  buildShield({ ...context, ...arms })
  buildHeldItem({ ...context, ...arms })
  return {
    skirtParts: clothes.skirtParts,
    trouserParts: legs.trouserParts,
    tunicParts: clothes.tunicParts,
    coatTailParts: clothes.coatTailParts,
    armParts: arms.parts,
    legParts: legs.parts,
    shoeParts: legs.shoeParts,
    footwear: legs.footwear,
    knees: legs.knees,
    prims: context.prims,
    head: { c: head.hc, r: head.headR, M: head.M },
  }
}

export { buildBody }
