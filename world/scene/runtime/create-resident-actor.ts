import { Actor } from "#/world/scene/actor"
import { FIG } from "#/world/scene/figure/display-scale"
import { getResidentBakedStrips } from "#/world/scene/get-resident-baked-strips"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { SPRITES } from "#/world/scene/runtime/assets"
import type { Scene } from "three"
import type { SpriteManifest } from "#/world/scene/sprite-manifest-types"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"
import type { V2 } from "#/world/scene/construction/registry"

type Props = Readonly<{ index: number; scene: Scene; world: SceneDefinition; position: V2; manifest: SpriteManifest | null; own(actor: Actor): void }>

/** 次の住民を作る前に所有を登録し、会話窓からの発話だけを使う。 */
export function createResidentActor(props: Props): Actor {
  const resident = RESIDENTS[props.index]
  const look = RESIDENT_LOOKS[props.index]
  const baked = getResidentBakedStrips({ directory: SPRITES, index: props.index, name: resident.name, look, item: resident.item, manifest: props.manifest })
  const actor = new Actor({
    name: resident.name,
    job: resident.job,
    look,
    start: props.position,
    routine: [
      { do: "idle", t: 6 + Math.random() * 6 },
      { do: "look", t: 3 },
    ],
    lines: [],
    scene: props.scene,
    speed: 1,
    item: resident.item,
    baked: baked ?? undefined,
    figureScale: props.world.figureMetres === undefined ? 1 : props.world.figureMetres / FIG,
  })
  props.own(actor)
  actor.faceTo(props.world.centre)
  actor.nextSay = Infinity
  return actor
}
