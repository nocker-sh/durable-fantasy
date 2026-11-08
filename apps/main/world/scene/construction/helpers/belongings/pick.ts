import { r } from "#/world/scene/construction/helpers/belongings/r"

export const pick = <T>(xs: readonly T[], seed: number, n = 0) => xs[Math.floor(r(seed, n) * xs.length) % xs.length]
