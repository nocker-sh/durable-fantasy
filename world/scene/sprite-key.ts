// The key a look and held item are cached and baked under.
import type { Item, Look } from "./figure"

export function lookKey(look: Look, item: Item) {
  return JSON.stringify(look) + "|" + item
}
