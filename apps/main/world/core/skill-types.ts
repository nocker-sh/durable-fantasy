import type { Stat } from "#/world/core/growth-types"
import type { ItemId } from "#/world/core/items/catalog"
import type { Skill as LifeSkill } from "#/world/core/items/kinds"
import type { SKILLS } from "#/world/core/skills"

type Base = {
  name: string
  /** SP it takes */
  sp: number
  /** ms before it can be used again */
  cooldown: number
  text: string
}

/** Anyone, any time. */
export type Action = Base & {
  kind: "action"
}

/** Weapon requirements are shared; each art kind carries only its own effect. */
type EquippedArt = Base & {
  weapons: readonly ItemId[]
  needs: Partial<Record<Stat | LifeSkill, number>>
}

type StatEffect = { base: number; per: number; stat: Stat }
export type OffensiveEffect = { kind: "strike"; power: number; sure?: boolean } | { kind: "spell"; magic: StatEffect }
export type Art = EquippedArt & (OffensiveEffect | { kind: "prayer"; heal: StatEffect })

export type SkillDef = Action | Art

export type SkillId = keyof typeof SKILLS
export type SkillKey = `skill:${SkillId}`
