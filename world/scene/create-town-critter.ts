import type { Object3D } from "three"
import type { TownAnimalSpawn } from "#/world/town/animal-types"
import type { Critter } from "#/world/scene/animal-types"
import { SpriteCritter } from "#/world/scene/sprite-critter"
import { MeshCritter } from "#/world/scene/mesh-critter"
import { pigMesh } from "#/world/scene/construction/pig-mesh"
import { sheepMesh } from "#/world/scene/construction/sheep-mesh"
import { henFrames } from "#/world/scene/hen-frames"
import { catFrames } from "#/world/scene/cat-frames"
import { GPPU } from "#/world/scene/goods"
type Props = Readonly<{ scene: Object3D; spawn: TownAnimalSpawn }>

/** Use exactly the original animal kind, sprite variants and mesh scale. */
export function createTownCritter(props: Props): Critter {
  const spawn = props.spawn
  if (spawn.kind === "hen" || spawn.kind === "cat") {
    const framesFor = { hen: henFrames, cat: catFrames }
    return new SpriteCritter({ scene: props.scene, frames: framesFor[spawn.kind](spawn.variant), ppu: GPPU * spawn.scale, area: spawn.area, speed: spawn.speed, kind: spawn.kind })
  }
  const meshFor = { pig: pigMesh, sheep: sheepMesh },
    mesh = meshFor[spawn.kind]()
  mesh.scale.setScalar(spawn.scale)

  return new MeshCritter({ scene: props.scene, obj: mesh, area: spawn.area, speed: spawn.speed })
}
