import { ObjectThumbnail } from "#/dev/object-thumbnail"
import type { Build } from "#/dev/three-view"
import { sheet } from "#/dev/sheets/schema"
import { MONSTER_DRAFTS } from "#/world/core/monster-drafts"
import { createMonsterBody } from "#/world/scene/create-monster-body"
import { updaters } from "#/world/scene/construction/registry"
import { poseModel } from "#/world/scene/fields/pose-model"
import { ModelReady } from "#/dev/model-ready"
import { MAPS } from "#/world/maps/index"
import type * as THREE from "three"

const builds = new Map<string, Build>()
const walking = new Set<THREE.Group>()
const walk = { registered: false }

/** The turntable walks every drafted creature in place, so its legs and wings can be seen moving. */
function walkInPlace(body: THREE.Group) {
  walking.add(body)
  if (walk.registered) return
  walk.registered = true
  updaters.push((t, dt) => {
    for (const b of walking) {
      const moving = Math.floor(t / 3) % 2 === 0
      if (!b.parent) walking.delete(b)
      else poseModel({ body: b, dt, moving })
    }
  })
}

function draftBuild(id: string): Build {
  let b = builds.get(id)
  if (!b) {
    b = (root, x, z) => {
      const body = createMonsterBody(MONSTER_DRAFTS[id].kind)
      body.position.set(x, 0.2, z)
      root.add(body)
      walkInPlace(body)
    }
    builds.set(id, b)
  }
  return b
}

const monsterDrafts = sheet({
  id: "monster-drafts",
  label: "魔物の案",
  rows: () => Object.keys(MONSTER_DRAFTS),
  key: (id) => id,
  name: (id) => MONSTER_DRAFTS[id].kind.name,
  kind: (id) => MAPS[MONSTER_DRAFTS[id].home]?.name ?? MONSTER_DRAFTS[id].home,
  cols: [
    { label: "HP", get: (id) => MONSTER_DRAFTS[id].kind.hp, w: "w-12" },
    { label: "防御", get: (id) => MONSTER_DRAFTS[id].kind.def, w: "w-12" },
    { label: "攻撃", get: (id) => MONSTER_DRAFTS[id].kind.atk, w: "w-12" },
    { label: "命中", get: (id) => MONSTER_DRAFTS[id].kind.hit, w: "w-12" },
    { label: "回避", get: (id) => MONSTER_DRAFTS[id].kind.flee, w: "w-12" },
    { label: "経験値", get: (id) => MONSTER_DRAFTS[id].kind.exp, w: "w-14" },
    { label: "大きさ", get: (id) => MONSTER_DRAFTS[id].kind.size ?? 1, w: "w-14" },
    { label: "叩かれると", get: (id) => (MONSTER_DRAFTS[id].kind.atk ? "反撃する" : "逃げる"), w: "w-20" },
  ],
  icon: (id) => {
    const kind = MONSTER_DRAFTS[id].kind
    return (
      <ModelReady id={kind.model.id}>
        <ObjectThumbnail id={`monster-draft-${id}`} build={draftBuild(id)} px={32} />
      </ModelReady>
    )
  },
  refs: (id) => [
    ...MONSTER_DRAFTS[id].kind.drops.map((d) => ({ sheet: "items", id: d.item, as: `落とす ${Math.round(d.chance * 100)}%` })),
    { sheet: "maps", id: MONSTER_DRAFTS[id].home, as: "住むなら" },
  ],
  build: draftBuild,
  more: (id) => {
    const draft = MONSTER_DRAFTS[id]
    const kind = draft.kind
    return [
      {
        title: "暮らしと出どころ",
        head: ["", ""],
        rows: [
          ["暮らし", draft.life],
          ["大戦の名残", draft.origin],
        ],
        wide: true,
      },
      {
        title: "ブロック（休みの姿勢、拡大前）",
        head: ["骨", "形", "色", "大きさ"],
        rows: kind.model.blocks.map((block) =>
          "to" in block ? [`${block.bone} → ${block.to}`, "box", block.paint, `${block.width}, ${block.height}`] : [block.bone, block.shape, block.paint, block.size.join(", ")],
        ),
      },
    ]
  },
})

export { monsterDrafts }
