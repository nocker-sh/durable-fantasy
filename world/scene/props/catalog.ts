import type { Thing } from "./types.ts";
import { ashThings } from "./ash.ts";
import { waterThings } from "./water.ts";
import { eavesThings } from "./eaves.ts";
import { animalsThings } from "./animals.ts";
import { workThings } from "./work.ts";

export const THINGS: Readonly<Record<string, Thing>> = {
  "ash-broom": ashThings["ash-broom"],
  "ash-shovel": ashThings["ash-shovel"],
  "ash-heap": ashThings["ash-heap"],
  "roof-rake": ashThings["roof-rake"],
  "covered-goods": ashThings["covered-goods"],
  doormat: ashThings["doormat"],
  "lidded-bucket": waterThings["lidded-bucket"],
  "water-butt": waterThings["water-butt"],
  kindling: waterThings["kindling"],
  "log-basket": waterThings["log-basket"],
  "hand-lantern": waterThings["hand-lantern"],
  stool: eavesThings["stool"],
  boots: eavesThings["boots"],
  "basket-stack": eavesThings["basket-stack"],
  pots: eavesThings["pots"],
  crock: eavesThings["crock"],
  "sack-pile": eavesThings["sack-pile"],
  "crate-stack": eavesThings["crate-stack"],
  ladder: eavesThings["ladder"],
  postbox: eavesThings["postbox"],
  "onion-string": eavesThings["onion-string"],
  "herb-bundle": eavesThings["herb-bundle"],
  birdcage: animalsThings["birdcage"],
  wheelbarrow: workThings["wheelbarrow"],
  sawhorse: workThings["sawhorse"],
  grindstone: workThings["grindstone"],
  washtub: workThings["washtub"],
  "clay-jars": workThings["clay-jars"],
  "wood-stack": waterThings["wood-stack"],
  bench: eavesThings["bench"],
  "flower-box": eavesThings["flower-box"],
  "hand-cart": workThings["hand-cart"],
  "milk-churns": workThings["milk-churns"],
  "hay-bale": workThings["hay-bale"],
  "bucket-yoke": waterThings["bucket-yoke"],
  "tool-rack": workThings["tool-rack"],
  "drying-hide": workThings["drying-hide"],
  "ash-sieve": ashThings["ash-sieve"],
  "rope-coil": workThings["rope-coil"],
  "bird-feeder": animalsThings["bird-feeder"],
  cat: animalsThings["cat"],
};

/** What a household keeps by its walls, by what it does and how it lives. */
/** What each household keeps by its walls beyond what every house has (things.test.ts: every household is here, every thing is used). */
export const THINGS_BY_HOUSEHOLD: Record<string, readonly string[]> = {
  farm: ["wheelbarrow", "sack-pile", "basket-stack", "cat", "milk-churns", "hay-bale", "tool-rack"],
  fisher: ["washtub", "clay-jars", "bucket-yoke", "rope-coil"],
  greengrocer: ["basket-stack", "crate-stack", "washtub"],
  fruit: ["basket-stack", "crate-stack", "ladder"],
  well: ["washtub", "stool", "bucket-yoke"],
  carter: ["wheelbarrow", "covered-goods", "sack-pile", "hand-cart", "rope-coil"],
  elder: ["stool", "birdcage", "pots", "cat", "bench", "flower-box", "bird-feeder"],
  bakers: ["sack-pile", "kindling", "cat", "wood-stack"],
  inn: ["crate-stack", "clay-jars", "onion-string", "stool", "wood-stack", "bench"],
  woodcutter: ["sawhorse", "roof-rake", "log-basket", "wood-stack"],
  shepherd: ["sack-pile", "stool", "milk-churns", "hay-bale"],
  priest: ["pots", "herb-bundle"],
  smith: ["grindstone", "crate-stack", "wood-stack"],
  tavern: ["crate-stack", "stool", "onion-string", "bench"],
  apothecary: ["herb-bundle", "clay-jars", "pots", "flower-box"],
  general: ["crate-stack", "covered-goods", "ladder", "rope-coil"],
  tailor: ["basket-stack", "birdcage", "flower-box"],
  crystal: ["covered-goods", "hand-lantern", "flower-box"],
  buyer: ["covered-goods", "crate-stack", "sack-pile", "hand-cart"],
  armorer: ["grindstone", "crate-stack"],
  woodworker: ["sawhorse", "ladder", "tool-rack"],
  leather: ["washtub", "stool", "drying-hide"],
  guards: ["roof-rake", "stool", "bench"],
  guide: ["stool", "birdcage"],
  warehouse: ["covered-goods", "crate-stack", "wheelbarrow", "roof-rake", "rope-coil"],
  // the households that came later
  lamp: ["hand-lantern", "stool", "basket-stack"],
  mapmaker: ["stool", "boots"],
  scribe: ["herb-bundle", "stool", "crock", "flower-box"],
  candle: ["clay-jars", "crock", "covered-goods"],
  potter: ["clay-jars", "pots", "crock", "crate-stack", "ash-sieve"],
  baskets: ["basket-stack", "washtub", "stool", "hand-cart"],
  mason: ["wheelbarrow", "sack-pile", "ladder", "hand-cart", "tool-rack", "ash-sieve"],
  sweep: ["ladder", "roof-rake", "sack-pile", "boots", "tool-rack", "ash-sieve"],
  tinker: ["grindstone", "crate-stack", "pots"],
  hunter: ["boots", "sawhorse", "log-basket", "wood-stack", "drying-hide"],
  teacher: ["stool", "boots", "cat", "bench", "bird-feeder"],
  retired: ["stool", "birdcage", "crock", "cat", "bench", "flower-box", "bird-feeder"],
};

export function thingsFor(trade: string | undefined, living: string | undefined, vacant: boolean): string[] {
  if (vacant) return ["ash-heap", "doormat"];
  const out = ["ash-broom", "doormat", "lidded-bucket", "ash-heap", "kindling"];
  if (living !== "慎ましい") out.push("water-butt", "postbox", "hand-lantern");
  else out.push("ash-shovel", "log-basket");
  out.push(...(THINGS_BY_HOUSEHOLD[trade ?? ""] ?? ["stool"]));
  return out;
}
