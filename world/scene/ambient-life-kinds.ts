/**
 * The small living things and the air of each kind of land outside town (landscape.md「何を美しいとするか」,
 * world.md「伝え方とトーン」: something to watch even when standing still). Each kind is a swarm of
 * pixels kept in a box round where the camera looks; none of them can be touched or blocks the way.
 *
 * - flutter: butterflies low over the grass by day, white and pale yellow with a few blues and coppers
 * - dart: dragonflies hovering over still water, darting off and stopping again
 * - fall: leaves and petals let go by the trees, turning as they come down
 * - drift: carried on the wind (pampas down, blown sand, snow off the pass, mist over water)
 * - flock: a few birds crossing high overhead, wings beating, then gliding
 * - glint: salt crystals catching the sun for a moment where they lie
 */
export type AmbientMotion = "flutter" | "dart" | "fall" | "drift" | "flock" | "glint"

export type AmbientKind = Readonly<{
  motion: AmbientMotion
  count: number
  colors: readonly number[]
  /** point size in the low-resolution render's pixels */
  size: number
  /** height above the ground: lowest, highest */
  y: readonly [number, number]
  /** when it is out: by day, by night, or always (dimmed with the light) */
  when: "day" | "night" | "always"
  alpha: number
  /** the wind it rides (drift) or the way a flock flies (flock), in tiles a second */
  wind?: readonly [number, number]
  /** only over water (dart) */
  water?: boolean
}>

const BIRDS: AmbientKind = { motion: "flock", count: 7, colors: [0x2a2630, 0x34303a], size: 2, y: [6, 8], when: "day", alpha: 0.95, wind: [0.9, 0.35] }
const BUTTERFLIES: AmbientKind = { motion: "flutter", count: 16, colors: [0xf2eee2, 0xf0e0a0, 0xe8e4d8, 0x9cc0ec, 0xf0a868, 0xf0e0a0], size: 2, y: [0.25, 1.1], when: "day", alpha: 1 }
const PETALS: AmbientKind = { motion: "fall", count: 24, colors: [0xf0c4d0, 0xfce6ea, 0xd69cb2], size: 2, y: [0.2, 4], when: "always", alpha: 1, wind: [0.3, 0.1] }
const DRAGONFLIES: AmbientKind = { motion: "dart", count: 8, colors: [0x5a8ab0, 0x6aa0a0, 0x9a6a5a], size: 2, y: [0.2, 0.6], when: "day", alpha: 1, water: true }
const MIST: AmbientKind = { motion: "drift", count: 46, colors: [0xc8d0d0, 0xb8c2c4], size: 4, y: [0.05, 0.5], when: "always", alpha: 0.22, wind: [0.12, 0.04], water: true }

export const AMBIENT_KINDS: Readonly<Record<string, readonly AmbientKind[]>> = {
  meadow: [BUTTERFLIES, PETALS, { ...DRAGONFLIES, count: 4 }, BIRDS],
  highland: [{ motion: "drift", count: 70, colors: [0xf4f0e6, 0xe2dccc], size: 2, y: [0.3, 2.4], when: "always", alpha: 0.85, wind: [0.7, 0.22] }, { ...BUTTERFLIES, count: 8 }, BIRDS],
  marsh: [{ ...DRAGONFLIES, count: 14 }, MIST, { ...BIRDS, count: 5 }],
  valley: [{ ...BUTTERFLIES, count: 10 }, { ...PETALS, count: 14 }, { ...DRAGONFLIES, count: 6 }, { ...MIST, count: 34 }, BIRDS],
  forest: [
    { motion: "fall", count: 46, colors: [0xc08052, 0xdca866, 0x985a4a, 0x7f964f], size: 2, y: [0.2, 4.5], when: "always", alpha: 1, wind: [0.15, 0.05] },
    { ...BIRDS, count: 5 },
  ],
  coast: [
    { ...BUTTERFLIES, count: 6 },
    { ...BIRDS, count: 6, colors: [0xeef0f0, 0xd8dcdc], size: 3, wind: [-0.7, 0.5] },
  ],
  dune: [
    { motion: "drift", count: 90, colors: [0xd69c78, 0xecc6a6, 0xbc7858], size: 1, y: [0.02, 0.35], when: "always", alpha: 0.9, wind: [2.4, 0.9] },
    { ...BIRDS, count: 3 },
  ],
  pass: [
    { motion: "drift", count: 80, colors: [0xf4f8fa, 0xe2e8ec], size: 2, y: [0.1, 4], when: "always", alpha: 0.9, wind: [1.1, -0.35] },
    { ...BIRDS, count: 4 },
  ],
  salt: [
    { motion: "glint", count: 60, colors: [0xffffff, 0xf4f8fa], size: 1, y: [0.02, 0.04], when: "day", alpha: 1 },
    { ...BIRDS, count: 4 },
  ],
}
