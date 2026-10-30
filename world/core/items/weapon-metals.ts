import type { Metal } from "#/world/core/items/weapon-types"
import type { Rarity } from "#/world/core/items/kinds"

export const METALS = ["iron", "steel", "engine"] as const

export const METAL_NAME: Record<Metal, string> = { iron: "鉄", steel: "鋼", engine: "機関鋼" }

/** How each metal changes a shape's weapon: attack, pace, what it asks of the arm, price, and the milestone that makes it. */
export const METAL_RULES: Record<Metal, { atk: number; delay: number; needs: number; price: number; rarity?: Rarity; milestone?: 16 | 32 }> = {
  iron: { atk: 1, delay: 1, needs: 0, price: 1 },
  steel: { atk: 1.5, delay: 0.96, needs: 2, price: 4.2, rarity: "rare", milestone: 16 },
  engine: { atk: 1.9, delay: 0.94, needs: 4, price: 8.5, rarity: "rare", milestone: 32 },
}

export const METAL_TEXT: Record<Metal, string> = {
  iron: "",
  steel: "鉄を炭で何度も鍛え直し、黒樫の柄を付けた。刃が欠けにくい。",
  engine: "沈んだ機関の芯の鋼で打った。いまの炉では、この硬さは出せない。",
}
