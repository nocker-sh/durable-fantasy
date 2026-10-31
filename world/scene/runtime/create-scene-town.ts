import type { Object3D } from "three"
import { Group } from "three"
import { mergeStatic } from "#/lib/graphics/merge-static"
import { occluders, stalls, movingObjects } from "#/world/scene/construction/registry"
import { lap } from "#/world/lap"
import type { MAP_SCENES } from "#/world/scene/runtime/definitions"

type Props = { scene: Object3D; world: (typeof MAP_SCENES)[string] }

/** Moving and fading owners keep their transforms when static geometry is merged. */
export function createSceneTown(props: Props): Group {
  const town = new Group()
  props.scene.add(town)
  props.world.build(town)
  lap("scene: town built")
  if (!props.world.indoor) {
    const anchors = [...occluders.map((entry) => entry.obj), ...Object.values(stalls).flatMap((stall) => [stall.wares, stall.cover, stall.group ?? stall.wares])]
    const merged = mergeStatic(town, { anchors, moving: movingObjects })
    lap(`scene: merged ${merged.before} meshes into ${merged.after}`)
  }
  return town
}
