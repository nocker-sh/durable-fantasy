import type { Group } from "three"
import type { V2 } from "#/world/scene/construction/registry"

export type GatheringSpot = Readonly<{ full: Group; spent: Group; at: V2 }>
