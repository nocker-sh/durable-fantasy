import { buildParkedCart } from "#/dev/build-parked-cart"
import { buildWaterJar } from "#/dev/build-water-jar"
import { ObjectThumbnail } from "#/dev/object-thumbnail"
import { PROPS } from "#/dev/studio/props-catalog"
import { FURNISHINGS } from "#/world/scene/construction/furnishing-builders"
import { furnishingAt } from "#/world/scene/construction/furnishing-at"
import { SIZES } from "#/world/town/fit"
import { HOUSES } from "#/world/town/houses"
import { INTERIORS } from "#/world/town/interiors"
import { ROOM_FURNITURE } from "#/dev/sheets/shared"
import { sheet } from "./schema"

/** Furniture in the house plans, the furniture drawn in rooms you walk into, and the things the maps are dressed with. */
type ObjectRow = { id: string; name: string; group: string }

const OBJECTS: ObjectRow[] = [
  ...Object.keys(SIZES).map((name) => ({ id: name, name, group: SIZES[name] === "wall" ? "壁に掛ける物" : "家具" })),
  ...Object.entries(ROOM_FURNITURE).map((entry) => {
    const kind = entry[0]
    const name = entry[1]
    return { id: `room-${kind}`, name, group: "店や公共の建物の中" }
  }),
  ...PROPS.map((p) => ({ id: p.id, name: p.name, group: `外（${p.group}）` })),
]

/** A piece of furniture is drawn in oak at the size the plans give it (construction/furnishings.ts). */
const furnitureBuilds = new Map<string, ReturnType<typeof furnishingAt>>()
function buildOf(id: string) {
  const p = PROPS.find((x) => x.id === id)
  if (p) return p.build
  const s = SIZES[id]
  if (!FURNISHINGS[id] || !s || s === "wall") return null
  let b = furnitureBuilds.get(id)
  if (!b) furnitureBuilds.set(id, (b = furnishingAt({ name: id, size: s, woodId: "oak" })))
  return b
}

const planCount = (name: string) =>
  HOUSES.flatMap((h) => h.plan.furniture).reduce((n, f) => {
    const m = /^(.+?)(?:×(\d+))?(?:（.+）)?$/.exec(f)!
    return m[1] === name ? n + Number(m[2] ?? 1) : n
  }, 0)

const objects = sheet<ObjectRow>({
  id: "objects",
  label: "オブジェクト",
  rows: () => OBJECTS,
  key: (o) => o.id,
  name: (o) => o.name,
  kind: (o) => o.group,
  cols: [
    {
      label: "幅×奥行(m)",
      get: (o) => {
        const s = SIZES[o.id]
        return s && s !== "wall" ? `${s.w}×${s.d}` : ""
      },
      w: "w-24",
    },
    {
      label: "前の空き(m)",
      get: (o) => {
        const s = SIZES[o.id]
        return s && s !== "wall" ? s.front : ""
      },
      w: "w-24",
    },
    {
      label: "数",
      get: (o) => (o.id.startsWith("room-") ? INTERIORS.reduce((n, i) => n + i.furniture.filter((f) => `room-${f.kind}` === o.id).length, 0) : SIZES[o.id] ? planCount(o.id) : ""),
      w: "w-12",
    },
  ],
  refs: (o) =>
    o.id.startsWith("room-")
      ? [...new Set(INTERIORS.filter((i) => i.furniture.some((f) => `room-${f.kind}` === o.id)).map((i) => i.house.id))].map((id) => ({ sheet: "houses", id, as: "置かれた建物" }))
      : [],
  icon: (o) => {
    const p = PROPS.find((x) => x.id === o.id)
    return p ? <ObjectThumbnail id={`prop-${p.id}`} build={p.build} px={32} /> : null
  },
  build: (o) => {
    const prop = PROPS.find((prop) => prop.id === o.id)
    if (prop) return prop.build
    if (o.id === "room-water-jar" || o.id === "水甕") return buildWaterJar
    if (o.id === "room-parked-cart" || o.id === "荷車") return buildParkedCart
    return buildOf(o.id)
  },
})

export { objects }
