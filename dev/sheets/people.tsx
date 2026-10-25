import { RowLink } from "./links.tsx"
import { formatTime } from "#/world/core/clock.ts"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents.ts"
import { SIZES, TILE_M } from "#/world/town/fit.ts"
import { HOUSEHOLDS, HOUSES, bedsOf, floorsOf, householdOf } from "#/world/town/houses.ts"
import { INTERIORS } from "#/world/town/interiors.ts"
import { buildInterior } from "#/world/scene/interior.ts"
import { ALL_LINES } from "#/world/town/lines/index.ts"
import { PEOPLE, RELATIONS } from "#/world/town/people.ts"
import { ROUTINES } from "#/world/town/routines.ts"
import { sheet } from "./schema.ts"
import { AGE, residentIndex, homeOf, ref, mapName, HOUSE_KIND } from "./shared.tsx"

const npcs = sheet({
  id: "npcs",
  label: "住民",
  rows: () => RESIDENTS,
  key: (r) => r.name,
  name: (r) => r.name,
  kind: (r) => r.job,
  cols: [
    { label: "年齢", get: (r) => AGE[RESIDENT_LOOKS[residentIndex(r.name)].age ?? "adult"], w: "w-16" },
    {
      label: "家",
      get: (r) => {
        const h = homeOf(r.name)
        return h ? (
          <RowLink sheet="houses" id={h.id}>
            {h.name}
          </RowLink>
        ) : (
          ""
        )
      },
    },
  ],
  refs: (r) => [
    ...ref("maps", r.map ?? "phanthiet", "立つ場所"),
    ...ref("households", householdOf(r.name)?.id, "世帯"),
    ...ref("houses", homeOf(r.name)?.id, "家"),
    ...[...new Set((ROUTINES[r.name] ?? []).flatMap((s) => (typeof s.where === "object" ? [s.where.map] : [])))].map((m) => ({ sheet: "maps", id: m, as: "出かける先" })),
  ],
  more: (r) => {
    const p = PEOPLE[r.name]
    return [
      ...(p ? [{ title: "人柄", head: ["性格", "話し方", "口癖"], rows: [[p.traits.join("・"), p.speech, p.habit]] }] : []),
      {
        title: "一日",
        head: ["時刻", "していること", "場所"],
        rows: [...(ROUTINES[r.name] ?? [])]
          .sort((a, b) => a.from - b.from)
          .map((s) => [formatTime(s.from), s.doing, typeof s.where === "string" ? s.where : `${mapName(s.where.map)}${"place" in s.where ? ` ${s.where.place}` : ""}`]),
      },
      {
        title: "台詞",
        head: ["台詞", "時間帯", "していること", "近くに", "親しさ", "出来事"],
        rows: (ALL_LINES[r.name] ?? []).map((l) => [l.text, l.phase?.join("・") ?? "", l.doing ?? "", l.near ?? "", l.friend ?? "", l.event ?? ""]),
      },
    ]
  },
})

const relations = sheet({
  id: "relations",
  label: "間柄",
  rows: () => RELATIONS,
  key: (x) => `${x.a}-${x.b}`,
  name: (x) => `${x.a}と${x.b}`,
  kind: (x) => x.kind,
  cols: [{ label: "こと", get: (x) => x.note }],
  refs: (x) => [...ref("npcs", x.a, x.kind), ...ref("npcs", x.b, x.kind)],
})

const households = sheet({
  id: "households",
  label: "世帯",
  rows: () => HOUSEHOLDS,
  key: (h) => h.id,
  name: (h) => h.name,
  kind: (h) => h.living,
  cols: [
    { label: "人数", get: (h) => h.members.length, w: "w-12" },
    { label: "暮らし", get: (h) => h.trade },
  ],
  refs: (h) => h.members.map((m) => ({ sheet: "npcs", id: m, as: "家族" })),
})

const houses = sheet({
  id: "houses",
  label: "建物",
  rows: () => HOUSES,
  key: (h) => h.id,
  name: (h) => h.name,
  kind: (h) => HOUSE_KIND[h.kind],
  cols: [
    { label: "マップ", get: (h) => mapName(h.map) },
    { label: "広さ(m)", get: (h) => `${((h.x1 - h.x0) * TILE_M).toFixed(1)}×${((h.z1 - h.z0) * TILE_M).toFixed(1)}`, w: "w-24" },
    { label: "階", get: (h) => floorsOf(h), w: "w-10" },
    { label: "寝台", get: (h) => bedsOf(h), w: "w-12" },
  ],
  refs: (h) => [
    ...ref("maps", h.map, "場所"),
    ...ref("households", h.household, "住む世帯"),
    ...ref("shops", h.shop, "店"),
    ...ref("maps", INTERIORS.find((i) => i.house.id === h.id)?.id, "中"),
    ...[...new Set(h.plan.furniture.map((f) => f.replace(/（.+）$/, "").replace(/×\d+$/, "")))].filter((f) => SIZES[f]).map((f) => ({ sheet: "objects", id: f, as: "家具" })),
  ],
  // the room you walk into, as the game draws it
  build: (h) => {
    const it = INTERIORS.find((i) => i.house.id === h.id)
    return it ? (root) => buildInterior(it)(root) : null
  },
  more: (h) => [
    { title: "部屋", head: ["部屋", "階", "寝台"], rows: h.plan.rooms.map((r) => [r.name, r.floor + 1, r.beds ?? 0]) },
    { title: "家具", head: ["家具"], rows: h.plan.furniture.map((f) => [f]) },
  ],
})

export { npcs, relations, households, houses }
