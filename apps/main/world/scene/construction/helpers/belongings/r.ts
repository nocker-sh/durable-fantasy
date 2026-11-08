import { hash2 } from "#/lib/engine/hash2"

export const r = (seed: number, n: number) => hash2(seed, n, 83)
