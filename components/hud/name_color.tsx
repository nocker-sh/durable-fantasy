import type { ChatLine } from "#/world/state"

export const NAME_COLOR = (line: ChatLine) => (line.self ? "text-white" : line.channel === "npc" ? "text-npc" : "text-player")
