import { hash2 } from "#/lib/engine/hash2"
import { N } from "#/world/maps/ground/rules"

export const edgeward = (depth: number) => (x: number, z: number) => Math.min(x, z, N - x, N - z) < depth + hash2(Math.floor(x * 3), Math.floor(z * 3), 5) * depth
