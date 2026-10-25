import { Thumb } from "../three-view.tsx"
import { LATER_SPOTS } from "#/world/core/gather.ts"
import { STAT_NAME } from "#/world/core/growth.ts"
import { GATHER_SKILL_NAME, GATHER_SKILLS } from "#/world/core/items.ts"
import { LIFE_MILESTONE_TEXT, LIFE_SKILLS, MILESTONES } from "#/world/core/life.ts"
import { MONSTER_KINDS, SPAWNS } from "#/world/core/monsters.ts"
import { SKILLS, type Art } from "#/world/core/skills.ts"
import { hareBody, slimeBody } from "#/world/scene/fields.ts"
import type { Build } from "../three-view.tsx"
import { sheet } from "./schema.ts"
import { needsText } from "./shared.tsx"

const monsterBuilds = new Map<string, Build>()

/** A creature as the meadow draws it. */
function monsterBuild(id: string): Build {
  let b = monsterBuilds.get(id)
  if (!b) {
    const k = MONSTER_KINDS[id]
    b = (root, x, z) => {
      const body = k.look === "slime" ? slimeBody(k.color ?? 0x8ac06a) : hareBody()
      if (id === "blue-slime") body.scale.setScalar(1.2)
      body.position.set(x, 0.2, z)
      root.add(body)
    }
    monsterBuilds.set(id, b)
  }
  return b
}

const monsters = sheet({
  id: "monsters",
  label: "魔物・動物",
  rows: () => Object.keys(MONSTER_KINDS),
  key: (id) => id,
  name: (id) => MONSTER_KINDS[id].name,
  kind: (id) => (MONSTER_KINDS[id].look === "slime" ? "スライム" : "動物"),
  cols: [
    { label: "HP", get: (id) => MONSTER_KINDS[id].hp, w: "w-12" },
    { label: "防御", get: (id) => MONSTER_KINDS[id].def, w: "w-12" },
    { label: "攻撃", get: (id) => MONSTER_KINDS[id].atk, w: "w-12" },
    { label: "命中", get: (id) => MONSTER_KINDS[id].hit, w: "w-12" },
    { label: "回避", get: (id) => MONSTER_KINDS[id].flee, w: "w-12" },
    { label: "経験値", get: (id) => MONSTER_KINDS[id].exp, w: "w-14" },
    { label: "再出現(秒)", get: (id) => MONSTER_KINDS[id].respawn, w: "w-20" },
    { label: "叩かれると", get: (id) => (MONSTER_KINDS[id].atk ? "反撃する" : "逃げる"), w: "w-20" },
  ],
  icon: (id) => <Thumb id={`monster-${id}`} build={monsterBuild(id)} px={32} />,
  refs: (id) => [
    ...MONSTER_KINDS[id].drops.map((d) => ({ sheet: "items", id: d.item, as: `落とす ${Math.round(d.chance * 100)}%` })),
    ...[...new Set(SPAWNS.filter((s) => s.kind === id).map((s) => s.map))].map((m) => ({ sheet: "maps", id: m, as: `出る ×${SPAWNS.filter((s) => s.kind === id && s.map === m).length}` })),
  ],
  build: monsterBuild,
})

const skills = sheet({
  id: "skills",
  label: "技",
  rows: () => Object.keys(SKILLS) as (keyof typeof SKILLS)[],
  key: (id) => id,
  name: (id) => SKILLS[id].name,
  kind: (id) => ({ action: "動作", strike: "戦技", spell: "術", prayer: "祈り" })[SKILLS[id].kind],
  cols: [
    { label: "SP", get: (id) => SKILLS[id].sp, w: "w-10" },
    { label: "待ち(秒)", get: (id) => SKILLS[id].cooldown / 1000, w: "w-16" },
    { label: "必要", get: (id) => ("needs" in SKILLS[id] ? needsText(SKILLS[id].needs as Record<string, number>) : ""), w: "w-28" },
    {
      label: "効き",
      get: (id) => {
        const s: Partial<Omit<Art, "kind">> = SKILLS[id]
        return s.power
          ? `×${s.power}${s.sure ? " 必ず会心" : ""}`
          : s.magic
            ? `${s.magic.base}+${STAT_NAME[s.magic.stat]}×${s.magic.per}`
            : s.heal
              ? `回復 ${s.heal.base}+${STAT_NAME[s.heal.stat]}×${s.heal.per}`
              : ""
      },
    },
  ],
  refs: (id) => {
    const s = SKILLS[id]
    return "weapons" in s
      ? [
          ...s.weapons.map((w) => ({ sheet: "items", id: w, as: "使える武器" })),
          ...Object.keys(s.needs)
            .filter((k) => (LIFE_SKILLS as readonly string[]).includes(k))
            .map((k) => ({ sheet: "life", id: k, as: "必要" })),
        ]
      : []
  },
  more: (id) => [{ title: "説明", head: [], rows: [[SKILLS[id].text]] }],
})

const life = sheet({
  id: "life",
  label: "生活スキル",
  rows: () => LIFE_SKILLS,
  key: (s) => s,
  name: (s) => GATHER_SKILL_NAME[s],
  kind: (s) => ((GATHER_SKILLS as readonly string[]).includes(s) ? "採る" : "作る"),
  cols: MILESTONES.filter((m) => m <= 8).map((m) => ({ label: `Lv${m}`, get: (s: (typeof LIFE_SKILLS)[number]) => LIFE_MILESTONE_TEXT[s][m] ?? "" })),
  refs: (s) => LATER_SPOTS.filter((l) => l.skill === s).map((l) => ({ sheet: "items", id: l.item, as: `Lv${l.level} ${l.where}` })),
})

export { monsters, skills, life }
