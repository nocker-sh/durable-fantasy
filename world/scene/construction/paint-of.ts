import { hash2 } from "#/lib/engine/hash2"
import type { WoodId } from "#/world/scene/construction/furnishings"

export const paintOf = (seed: number): WoodId => (["paintBlue", "paintRed", "paintGreen"] as const)[Math.floor(hash2(seed, 3, 67) * 3)]
