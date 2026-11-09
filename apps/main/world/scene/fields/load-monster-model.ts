import { GLTFLoader } from "#resources/three/gltf-loader"
import { MeshoptDecoder } from "#resources/three/meshopt-decoder"
import type { MonsterModel } from "#/world/core/monster-model-types"
import { monsterModels } from "#/world/scene/fields/monster-model-store"
import type { LoadedMonsterModel } from "#/world/scene/fields/monster-model-store"

/** The model and its walk and idle clips, fetched once per kind of model and shared by every creature drawn from it. */
export function loadMonsterModel(id: MonsterModel["id"]): Promise<LoadedMonsterModel> {
  const hit = monsterModels.loading.get(id)
  if (hit) return hit
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const base = `/models/monsters/${id}/`
  const loading: Promise<LoadedMonsterModel> = Promise.all([loader.loadAsync(base + "model.glb"), loader.loadAsync(base + "walk.glb"), loader.loadAsync(base + "idle.glb")])
    .then((files) => ({
      scene: files[0].scene,
      walk: files[1].animations[0],
      idle: files[2].animations[0],
    }))
    .then((loaded) => {
      monsterModels.loaded.set(id, loaded)
      return loaded
    })
  monsterModels.loading.set(id, loading)
  return loading
}
