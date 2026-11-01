import type { MonsterDraft } from "#/world/core/monster-draft-types"
import { draft as ballRoller } from "#/world/core/bestiary/ball-roller"
import { draft as barrelHorn } from "#/world/core/bestiary/barrel-horn"
import { draft as bridgeBack } from "#/world/core/bestiary/bridge-back"
import { draft as cairnStack } from "#/world/core/bestiary/cairn-stack"
import { draft as chainCrawler } from "#/world/core/bestiary/chain-crawler"
import { draft as chimneyBadger } from "#/world/core/bestiary/chimney-badger"
import { draft as cragLimpet } from "#/world/core/bestiary/crag-limpet"
import { draft as dishEarMouse } from "#/world/core/bestiary/dish-ear-mouse"
import { draft as handWalker } from "#/world/core/bestiary/hand-walker"
import { draft as huskPuffer } from "#/world/core/bestiary/husk-puffer"
import { draft as kiteBird } from "#/world/core/bestiary/kite-bird"
import { draft as lanternBeetle } from "#/world/core/bestiary/lantern-beetle"
import { draft as netSpider } from "#/world/core/bestiary/net-spider"
import { draft as oneLegHopper } from "#/world/core/bestiary/one-leg-hopper"
import { draft as oneLegWatcher } from "#/world/core/bestiary/one-leg-watcher"
import { draft as peepingMole } from "#/world/core/bestiary/peeping-mole"
import { draft as plateCrest } from "#/world/core/bestiary/plate-crest"
import { draft as puffBloom } from "#/world/core/bestiary/puff-bloom"
import { draft as roofOx } from "#/world/core/bestiary/roof-ox"
import { draft as rulerWorm } from "#/world/core/bestiary/ruler-worm"
import { draft as sailLizard } from "#/world/core/bestiary/sail-lizard"
import { draft as sandPipe } from "#/world/core/bestiary/sand-pipe"
import { draft as snowShovelOx } from "#/world/core/bestiary/snow-shovel-ox"
import { draft as stoneBearer } from "#/world/core/bestiary/stone-bearer"
import { draft as stretchNeckGoat } from "#/world/core/bestiary/stretch-neck-goat"
import { draft as towerTortoise } from "#/world/core/bestiary/tower-tortoise"
import { draft as trumpetSnail } from "#/world/core/bestiary/trumpet-snail"
import { draft as vaneTailFox } from "#/world/core/bestiary/vane-tail-fox"

/** Creatures drawn and tuned but not yet let out into any map (game-system.md §8「魔物の案」). */
export const MONSTER_DRAFTS: Record<string, MonsterDraft> = {
  "ball-roller": ballRoller,
  "barrel-horn": barrelHorn,
  "bridge-back": bridgeBack,
  "cairn-stack": cairnStack,
  "chain-crawler": chainCrawler,
  "chimney-badger": chimneyBadger,
  "crag-limpet": cragLimpet,
  "dish-ear-mouse": dishEarMouse,
  "hand-walker": handWalker,
  "husk-puffer": huskPuffer,
  "kite-bird": kiteBird,
  "lantern-beetle": lanternBeetle,
  "net-spider": netSpider,
  "one-leg-hopper": oneLegHopper,
  "one-leg-watcher": oneLegWatcher,
  "peeping-mole": peepingMole,
  "plate-crest": plateCrest,
  "puff-bloom": puffBloom,
  "roof-ox": roofOx,
  "ruler-worm": rulerWorm,
  "sail-lizard": sailLizard,
  "sand-pipe": sandPipe,
  "snow-shovel-ox": snowShovelOx,
  "stone-bearer": stoneBearer,
  "stretch-neck-goat": stretchNeckGoat,
  "tower-tortoise": towerTortoise,
  "trumpet-snail": trumpetSnail,
  "vane-tail-fox": vaneTailFox,
}
