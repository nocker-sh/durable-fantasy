import type { MonsterDraft } from "#/world/core/monster-draft-types"
import { draft as barrelHorn } from "#/world/core/bestiary/barrel-horn"
import { draft as bridgeBack } from "#/world/core/bestiary/bridge-back"
import { draft as chimneyBadger } from "#/world/core/bestiary/chimney-badger"
import { draft as lanternBeetle } from "#/world/core/bestiary/lantern-beetle"
import { draft as netSpider } from "#/world/core/bestiary/net-spider"
import { draft as oneLegWatcher } from "#/world/core/bestiary/one-leg-watcher"
import { draft as roofOx } from "#/world/core/bestiary/roof-ox"
import { draft as sandPipe } from "#/world/core/bestiary/sand-pipe"
import { draft as stoneBearer } from "#/world/core/bestiary/stone-bearer"
import { draft as towerTortoise } from "#/world/core/bestiary/tower-tortoise"

/** Creatures drawn and tuned but not yet let out into any map (game-system.md §8「魔物の案」). */
export const MONSTER_DRAFTS: Record<string, MonsterDraft> = {
  "barrel-horn": barrelHorn,
  "bridge-back": bridgeBack,
  "chimney-badger": chimneyBadger,
  "lantern-beetle": lanternBeetle,
  "net-spider": netSpider,
  "one-leg-watcher": oneLegWatcher,
  "roof-ox": roofOx,
  "sand-pipe": sandPipe,
  "stone-bearer": stoneBearer,
  "tower-tortoise": towerTortoise,
}
