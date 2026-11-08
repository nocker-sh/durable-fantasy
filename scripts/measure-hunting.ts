import { HUNTING_STAGES } from "#/world/test/hunting-stages"
import { HuntSimulation } from "#/world/test/hunt-simulation"
import { newPlayer } from "#/world/core/new-player"
import { derive } from "#/world/core/derive"
import { bagWith } from "#/world/test/bag-with"

for (const stage of HUNTING_STAGES) {
  const base = newPlayer()
  const hero = {
    ...base,
    level: stage.level,
    stats: stage.stats,
    bag: bagWith(["herb", 30]),
    equipment: { ...base.equipment, weapon: stage.weapon, body: "chain-mail" as const, head: "iron-helm" as const, shield: "wooden-shield" as const },
  }
  const stats = derive(hero)
  const full = { ...hero, hp: stats.maxHp, sp: stats.maxSp }
  console.log(
    JSON.stringify({
      level: stage.level,
      build: stage.build,
      weapon: stage.weapon,
      kind: stage.kind,
      active: new HuntSimulation({ player: full, kind: stage.kind, arts: stage.arts, heal: true, seed: 42 }).fight(),
      normal: new HuntSimulation({ player: full, kind: stage.kind, arts: [], seed: 42 }).fight(),
    }),
  )
}
