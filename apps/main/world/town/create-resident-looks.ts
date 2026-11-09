import type { Look, Fringe } from "#/world/scene/figure/look"
import { wearable } from "#/world/town/wearable"

const FRINGES: Readonly<Record<Look["sex"], readonly Fringe[]>> = {
  f: ["swept", "curtain", "blunt", "flicked", "dangle", "natural", "slant", "zigzag"],
  m: ["spiky", "blunt", "swept", "flicked", "curtain", "natural", "slant", "zigzag"],
}
const SEXES = ["f", "m"] as const
const NECKS: readonly Look["neck"][] = ["muffler", "scarf", "muffler", "stole", "muffler", "scarf"]
const NECK_RAMPS = ["cRed", "cMustard", "cGreen", "cBlue", "cWine", "cCream", "cPlum", "cHoney", "cSky", "cBrown"]
const NECK_STRIPES = [undefined, "cCream", undefined, "cLinen", undefined, undefined, "cWine"]

/** Preserve authored traits; fringe sequences count only missing fringes of the same sex, while necks use the global resident order. */
export function createResidentLooks(looks: readonly Look[]): Look[] {
  const missing = looks.map((look, index) => ({ look, index })).filter((entry) => !entry.look.fringe)
  const fringes = new Map(SEXES.flatMap((sex) => missing.filter((entry) => entry.look.sex === sex).map((entry, index): [number, Fringe] => [entry.index, FRINGES[sex][index % FRINGES[sex].length]])))

  return looks.map((source, index) => {
    const look = wearable(source)
    const withFringe = look.fringe ? look : { ...look, fringe: fringes.get(index) }
    if (withFringe.neck) return withFringe

    const stripe = NECK_STRIPES[(index * 5) % NECK_STRIPES.length]
    return { ...withFringe, neck: NECKS[(index * 7) % NECKS.length], neckRamp: NECK_RAMPS[(index * 3) % NECK_RAMPS.length], ...(stripe ? { neckStripe: stripe } : {}) }
  })
}
