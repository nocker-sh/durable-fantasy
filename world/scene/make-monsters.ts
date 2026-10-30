import type * as THREE from "three"
import { MONSTER_KINDS } from "#/world/core/monsters"
import { spawnsOn } from "#/world/core/spawns-on"
import { MonsterMotion } from "#/world/core/monster-motion"
import { createMonsterBody } from "#/world/scene/create-monster-body"
import { isFree } from "#/world/scene/is-free"
import type { Vector2Tuple } from "#/lib/engine/vector2-types"
import type { MonsterView } from "#/world/scene/monsters"

export function makeMonsters(root: THREE.Group, map: string): MonsterView[] {
  return spawnsOn(map).map((spawn) => {
    const kind = MONSTER_KINDS[spawn.kind]
    const body = createMonsterBody(kind)
    body.userData.monster = spawn.id
    root.add(body)
    const label = document.createElement("div")
    label.className = "gx-nameplate gx-nameplate--npc"
    label.innerHTML = `<span>${kind.name}</span><span class="gx-hp"><span></span></span>`
    return {
      spawn,
      motion: new MonsterMotion({ spawn: spawn, free: isFree }),
      body,
      pos: [0, 0] as Vector2Tuple,
      hp: kind.hp,
      back: 0,
      burst: null,
      label,
      hpBar: label.querySelector<HTMLElement>(".gx-hp > span")!,
    }
  })
}
