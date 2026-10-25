import type * as THREE from "three"
import { shopBoards } from "../dressing"
import { shopOpen } from "../../maps/index.ts"
import type { SHOPS } from "../../core/shops.ts"
import { places, stalls, type V2 } from "../build"
import { ROUTINES, spotAt, workSpot, type Spot } from "../../town/routines.ts"
import { Actor, type BakedStrips } from "../actors"
import { lookKey } from "../sprite-pool"
import { stripFile } from "../baked"
import { lap } from "../../diagnostics.ts"
import { RESIDENTS, RESIDENT_LOOKS } from "../../town/residents.ts"
import type { SceneDefinition } from "./definitions.ts"
import { spriteManifest, SPRITES } from "./assets.ts"

async function createPopulation(scene: THREE.Scene, map: string, world: SceneDefinition, progress: (text: string) => void, tick: () => Promise<unknown>) {
  lap("scene: buildings and props")
  progress("住民を描いています…")
  await tick()
  const people: Actor[] = []
  /** each person's index in RESIDENTS */
  const ids: number[] = []
  const manifest = await spriteManifest()
  /** each person's usual spot, for their routine (town/routines.ts) */
  const works: Spot[] = []
  /** a spot on this map as a position on the ground */
  const spotPos = (s: Spot): V2 | null => (s.map !== map ? null : "place" in s ? (places[s.place] ?? null) : "tile" in s ? [s.tile[0], s.tile[1]] : [(s.cell[0] + 0.5) / 2, (s.cell[1] + 0.5) / 2])
  for (const [i, r] of RESIDENTS.entries()) {
    // everyone who stands on this map at some hour of the day
    const work = workSpot(r)
    const here = (ROUTINES[r.name] ?? []).map((s) => spotAt(r.name, s.from, work)).find((s) => s?.map === map)
    const at = here ? spotPos(here) : null
    if (!at) continue
    works.push(work)
    const look = RESIDENT_LOOKS[i]
    // baked strips only if they were baked from this very look (otherwise the workers draw it)
    const entry = manifest?.residents[i]
    const baked: BakedStrips | undefined =
      entry && entry.key === lookKey(look, r.item) ? { item: r.item, url: (anim, view) => (entry.anims[anim] ? `${SPRITES}/${stripFile(i, anim, view)}` : null) } : undefined
    const a = new Actor(
      r.name,
      r.job,
      look,
      at,
      [
        { do: "idle", t: 6 + Math.random() * 6 },
        { do: "look", t: 3 },
      ],
      [],
      scene,
      1,
      r.item,
      baked,
    )
    a.faceTo(world.centre)
    a.nextSay = Infinity // residents speak only when spoken to, in the conversation window
    people.push(a)
    ids.push(i)
  }
  lap("scene: residents")
  const personOf = (id: number) => people[ids.indexOf(id)]
  /** Put everyone where their routine has them at `min`; those elsewhere or at home are not drawn. */
  function applySchedule(min: number) {
    // a stall is set out while its seller stands at it; a street seller's stall is not there at all otherwise
    const manned = new Set(
      people.flatMap((a) => {
        const s = spotAt(a.name, min, works[people.indexOf(a)])
        return s && "place" in s && s.map === map ? [s.place] : []
      }),
    )
    for (const b of shopBoards) {
      const open = shopOpen(b.shop as keyof typeof SHOPS, min)
      b.open.visible = open
      b.shut.visible = !open
    }
    for (const [place, st] of Object.entries(stalls)) {
      const open = manned.has(place)
      if (st.vanish && st.group) st.group.visible = open
      else {
        st.wares.visible = open
        st.cover.visible = !open
      }
    }
    people.forEach((a, k) => {
      const spot = spotAt(a.name, min, works[k])
      const pos = spot ? spotPos(spot) : null
      a.fig.root.visible = !!pos

      if (pos && (pos[0] !== a.pos[0] || pos[1] !== a.pos[1])) {
        a.pos = [...pos] as V2
        a.faceTo(world.centre)
      }
    })
  }
  return { people, ids, personOf, applySchedule }
}

export { createPopulation }
