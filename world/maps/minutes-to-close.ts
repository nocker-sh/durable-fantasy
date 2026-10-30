import type { SHOPS } from "#/world/core/shops"
import { shopOpen } from "#/world/maps/shop-open"

/** Minutes until the shop's last keeper goes home, looking up to two hours ahead; null if not that soon. */
export function minutesToClose(shopId: keyof typeof SHOPS, minute: number): number | null {
  if (!shopOpen(shopId, minute)) return null
  for (const minutes of Array.from({ length: 24 }, (_, index) => (index + 1) * 5)) if (!shopOpen(shopId, (minute + minutes) % 1440)) return minutes
  return null
}
