import * as THREE from "three"
import { M } from "#/world/scene/construction/materials"
import { ruinMats } from "#/world/scene/fields/ruin-materials"
import { piece } from "#/world/scene/fields/piece"
import { drum } from "#/world/scene/fields/drum"
import { stand } from "#/world/scene/fields/stand"

type Kind = "gear" | "boiler" | "leg" | "gun" | "plates"

type Props = {
  root: THREE.Group
  x: number
  z: number
  rot: number
  kind: Kind
}

type Here = ReturnType<typeof stand>

const HALF = Math.PI / 2

/** A great cog standing on its edge, half of it under the ground. */
function gear(here: Here) {
  const wheel = new THREE.Group()
  wheel.position.set(0, 0.3, 0)
  wheel.rotation.set(HALF - 0.22, 0, 0.08, "YXZ")
  here.group.add(wheel)
  drum({ root: wheel, at: [0, 0, 0], radius: 1.35, length: 0.3, material: ruinMats.rust, segments: 14 })
  drum({ root: wheel, at: [0, 0, 0], radius: 0.95, length: 0.34, material: ruinMats.rustDark, segments: 14 })
  drum({ root: wheel, at: [0, 0, 0], radius: 0.4, length: 0.5, material: ruinMats.rust, segments: 8 })
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2
    piece({
      root: wheel,
      at: [Math.cos(a) * 1.46, 0, Math.sin(a) * 1.46],
      turn: [0, -a, 0],
      build: (gb) => gb.box({ side: ruinMats.rustDark, top: ruinMats.rust, x0: -0.15, y0: -0.15, z0: -0.14, x1: 0.15, y1: 0.15, z1: 0.14, repeat: 1, bottom: true }),
    })
  }
  for (const x of [-0.9, 0, 0.9]) here.block(x, 0, 0.5)
}

/** A boiler on its side, burst at one end, its stack snapped and its plates in the grass. */
function boiler(here: Here) {
  drum({ root: here.group, at: [0, 0.5, 0], turn: [HALF, 0, 0], radius: 0.85, length: 2.8, material: ruinMats.rust, segments: 12 })
  for (const z of [-1.15, 0, 1.15]) drum({ root: here.group, at: [0, 0.5, z], turn: [HALF, 0, 0], radius: 0.91, length: 0.16, material: ruinMats.rustDark, segments: 12 })
  drum({ root: here.group, at: [0, 0.5, 1.4], turn: [HALF, 0, 0], radius: 0.68, length: 0.05, material: M.dark, segments: 12 })
  drum({ root: here.group, at: [0, 1.4, -0.6], radius: 0.34, length: 0.5, material: ruinMats.rustDark, segments: 8 })
  drum({ root: here.group, at: [0.12, 1.95, -0.6], turn: [0, 0, -0.3], radius: 0.17, radiusTop: 0.15, length: 0.9, material: ruinMats.rust, segments: 7 })
  // the rest of the stack where it fell, and plates torn from the burst end
  drum({ root: here.group, at: [1.5, 0.13, -0.9], turn: [HALF, 0.5, 0], radius: 0.16, length: 1.3, material: ruinMats.rust, segments: 7 })
  for (const p of [
    [1.2, 2.0, 0.4],
    [-0.9, 2.3, -0.7],
    [0.3, 2.9, 1.9],
  ])
    piece({
      root: here.group,
      at: [p[0], 0.06, p[1]],
      turn: [0.12, p[2], -0.1],
      build: (gb) => gb.box({ side: ruinMats.rustDark, top: ruinMats.rust, x0: -0.5, y0: -0.04, z0: -0.35, x1: 0.5, y1: 0.05, z1: 0.35, repeat: 2 }),
    })
  for (const z of [-1, 0, 1]) here.block(0, z, 0.85)
}

/** One leg of a walking engine, the knee still up in the air and the foot in the ground. */
function leg(here: Here) {
  drum({ root: here.group, at: [0, 0.25, 0], turn: [HALF, 0, 0], radius: 0.62, length: 0.9, material: ruinMats.rust, segments: 10 })
  drum({ root: here.group, at: [0, 0.25, 0], turn: [HALF, 0, 0], radius: 0.3, length: 1.1, material: ruinMats.rustDark, segments: 8 })
  const limb = (at: readonly [number, number, number], lean: number, len: number, thick: number) =>
    piece({
      root: here.group,
      at: at,
      turn: [0, 0, -lean],
      build: (gb) => {
        gb.box({ side: ruinMats.rust, top: ruinMats.rustDark, x0: -thick, y0: 0, z0: -thick * 0.8, x1: thick, y1: len, z1: thick * 0.8, repeat: 2, bottom: true })
        // the rod that worked it, alongside
        gb.box({ side: ruinMats.rustDark, top: null, x0: thick, y0: len * 0.15, z0: -0.05, x1: thick + 0.1, y1: len * 0.8, z1: 0.05, repeat: 1 })
      },
    })
  limb([0, 0.3, 0], 0.5, 2.7, 0.22)
  const knee: readonly [number, number, number] = [Math.sin(0.5) * 2.7, 0.3 + Math.cos(0.5) * 2.7, 0]
  drum({ root: here.group, at: knee, turn: [HALF, 0, 0], radius: 0.36, length: 0.62, material: ruinMats.rustDark, segments: 9 })
  limb(knee, 2.45, 3.0, 0.17)
  const foot = knee[0] + Math.sin(2.45) * 3.0
  piece({
    root: here.group,
    at: [foot, 0, 0],
    turn: [0, 0, 0.12],
    build: (gb) => {
      gb.box({ side: ruinMats.rustDark, top: ruinMats.rust, x0: -0.5, y0: -0.2, z0: -0.4, x1: 0.5, y1: 0.22, z1: 0.4, repeat: 2 })
      for (const z of [-0.3, 0, 0.3]) gb.box({ side: ruinMats.rust, top: ruinMats.rustDark, x0: 0.5, y0: -0.2, z0: z - 0.08, x1: 0.95, y1: 0.1, z1: z + 0.08, repeat: 1 })
    },
  })
  here.block(0, 0, 0.75)
  here.block(foot, 0, 0.6)
}

/** A field gun on what is left of its carriage, still pointing at the sky. */
function gun(here: Here) {
  piece({
    root: here.group,
    at: [0, 0, 0],
    build: (gb) => {
      for (const s of [-1, 1]) gb.box({ side: ruinMats.greyWood, top: ruinMats.greyWood, x0: s * 0.34 - 0.07, y0: -0.1, z0: -1.3, x1: s * 0.34 + 0.07, y1: 0.62, z1: 0.5, repeat: 1 })
      gb.box({ side: ruinMats.rustDark, top: ruinMats.rust, x0: -0.5, y0: 0.4, z0: -0.2, x1: 0.5, y1: 0.75, z1: 0.3, repeat: 2 })
    },
  })
  const lift = HALF - 0.52
  const axis = [0, Math.cos(lift), Math.sin(lift)]
  drum({ root: here.group, at: [0, 1.0 + axis[1] * 0.5, 0.2 + axis[2] * 0.5], turn: [lift, 0, 0], radius: 0.25, radiusTop: 0.17, length: 2.6, material: ruinMats.rust, segments: 9 })
  drum({ root: here.group, at: [0, 1.0 + axis[1] * 1.75, 0.2 + axis[2] * 1.75], turn: [lift, 0, 0], radius: 0.22, length: 0.18, material: ruinMats.rustDark, segments: 9 })
  drum({ root: here.group, at: [0, 1.0 - axis[1] * 0.85, 0.2 - axis[2] * 0.85], turn: [lift, 0, 0], radius: 0.3, length: 0.3, material: ruinMats.rustDark, segments: 9 })
  // one wheel still on its axle, the other flat in the grass
  drum({ root: here.group, at: [-0.52, 0.5, -0.1], turn: [0, 0, HALF], radius: 0.56, length: 0.12, material: ruinMats.greyWood, segments: 12 })
  drum({ root: here.group, at: [-0.52, 0.5, -0.1], turn: [0, 0, HALF], radius: 0.14, length: 0.2, material: ruinMats.rustDark, segments: 7 })
  drum({ root: here.group, at: [1.25, 0.07, -0.7], turn: [0.07, 0, 0.05], radius: 0.56, length: 0.12, material: ruinMats.greyWood, segments: 12 })
  drum({ root: here.group, at: [1.25, 0.1, -0.7], turn: [0.07, 0, 0.05], radius: 0.14, length: 0.2, material: ruinMats.rustDark, segments: 7 })
  here.block(0, -0.3, 0.75)
  here.block(0, 0.9, 0.5)
  here.block(1.25, -0.7, 0.45)
}

/** Armour plates torn off a hull, leaning on each other with a rib of the frame between them. */
function plates(here: Here) {
  const plate = (at: readonly [number, number, number], turn: readonly [number, number, number], w: number) =>
    piece({
      root: here.group,
      at: at,
      turn: turn,
      build: (gb) => {
        gb.box({ side: ruinMats.rust, top: ruinMats.rustDark, x0: -w, y0: -0.6, z0: -0.05, x1: w, y1: 0.6, z1: 0.05, repeat: 2, bottom: true })
        gb.box({ side: ruinMats.rustDark, top: ruinMats.rustDark, x0: -w, y0: -0.6, z0: 0.05, x1: -w + 0.12, y1: 0.6, z1: 0.14, repeat: 1 })
      },
    })
  plate([-0.3, 0.42, 0], [-0.42, 0.3, 0.08], 0.85)
  plate([0.55, 0.36, 0.5], [0.5, -0.6, -0.12], 0.7)
  plate([0.1, 0.05, -1.1], [HALF - 0.06, 0.9, 0], 0.8)
  for (const k of [0, 1, 2])
    piece({
      root: here.group,
      at: [-1.2 + k * 0.5, 0, 0.9 + k * 0.2],
      turn: [0.3 + k * 0.15, 0.2, 0.2 - k * 0.2],
      build: (gb) => gb.box({ side: ruinMats.rustDark, top: ruinMats.rust, x0: -0.06, y0: -0.2, z0: -0.06, x1: 0.06, y1: 1.5 - k * 0.3, z1: 0.06, repeat: 1 }),
    })
  here.block(-0.2, 0.1, 0.8)
  here.block(0.6, 0.5, 0.6)
}

const WRECKS: Record<Kind, (here: Here) => void> = { gear: gear, boiler: boiler, leg: leg, gun: gun, plates: plates }

/**
 * A piece of the war's engines left where it stopped (world.md「場所」: 錆びた兵器): a cog on its
 * edge, a burst boiler, a walking engine's leg, a gun, armour plates. Each is rusted through and
 * half in the ground; none is whole.
 */
export function warWreck(props: Props) {
  WRECKS[props.kind](stand(props.root, [props.x, props.z], props.rot))
}
