import { activityPose } from "#/world/town/activity-pose"
import type * as THREE from "three"
import { shopBoards } from "#/world/scene/dressing"
import { shopOpen } from "#/world/maps/shop-open"
import type { SHOPS } from "#/world/core/shops"
import { places, stalls } from "#/world/scene/construction/registry"
import type { V2 } from "#/world/scene/construction/registry"
import { ROUTINES } from "#/world/town/routines"
import { spotAt } from "#/world/town/spot-at"
import { workSpot } from "#/world/town/work-spot"
import type { Spot } from "#/world/town/routines"
import { Actor } from "#/world/scene/actor"
import { FIG } from "#/world/scene/figure/display-scale"
import { getResidentBakedStrips } from "../get-resident-baked-strips"
import { lap } from "#/world/lap"
import { RESIDENTS, RESIDENT_LOOKS } from "../../town/residents"
import type { SceneDefinition } from "./definitions"
import { spriteManifest, SPRITES } from "./assets"

async function createPopulation(inputProps: { scene: THREE.Scene; map: string; world: SceneDefinition; progress: (text: string) => void; tick: () => Promise<unknown>; own?: (actor: Actor) => void }) {
  const scene = inputProps.scene
  const map = inputProps.map
  const world = inputProps.world
  const progress = inputProps.progress
  const tick = inputProps.tick
  const own = inputProps.own === undefined ? () => {} : inputProps.own

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
  for (const entry of RESIDENTS.entries()) {
    const i = entry[0]
    const r = entry[1]

    // everyone who stands on this map at some hour of the day
    const work = workSpot(r)
    const here = (ROUTINES[r.name] ?? []).map((s) => spotAt(r.name, s.from, work)).find((s) => s?.map === map)
    const at = here ? spotPos(here) : null
    if (!at) continue
    works.push(work)
    const look = RESIDENT_LOOKS[i]
    const baked = getResidentBakedStrips({ directory: SPRITES, index: i, name: r.name, look, item: r.item, manifest })
    const a = new Actor({
      name: r.name,
      job: r.job,
      look: look,
      start: at,
      routine: [
        { do: "idle", t: 6 + Math.random() * 6 },
        { do: "look", t: 3 },
      ],
      lines: [],
      scene: scene,
      speed: 1,
      item: r.item,
      baked: baked ?? undefined,
      figureScale: world.figureMetres === undefined ? 1 : world.figureMetres / FIG,
    })
    own(a)
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
      if (b.wares) b.wares.visible = open
    }
    for (const entry2 of Object.entries(stalls)) {
      const place = entry2[0]
      const st = entry2[1]

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
      const pose = pos ? activityPose(a.name, min, map) : null
      const previousSeat = a.seat
      a.seat = pose?.seat ?? null
      if (previousSeat && !a.seat) a.anim = "idle"

      const moved = pos && (pos[0] !== a.pos[0] || pos[1] !== a.pos[1])
      if (moved) {
        a.pos = [...pos!] as V2
      }
      const facing = pose?.facing
      if (facing) a.faceTo(facing)
      else if (moved) a.faceTo(world.centre)
    })
  }
  return { people, ids, personOf, applySchedule }
}

export { createPopulation }
