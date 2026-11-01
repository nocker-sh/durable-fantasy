import * as THREE from "three"
import { clone } from "#resources/three/skeleton-utils"
import type { MonsterModel } from "#/world/core/monster-model-types"
import { loadMonsterModel } from "#/world/scene/fields/load-monster-model"
import { muteTexture } from "#/world/scene/fields/mute-texture"
import { monsterModels } from "#/world/scene/fields/monster-model-store"
import type { LoadedMonsterModel } from "#/world/scene/fields/monster-model-store"

/** Where a body stands: the scene lifts every creature this far above the ground. */
const GROUND = -0.06

/**
 * A creature drawn from a rigged model. The group is returned at once and the model joins it when loaded;
 * `poseModel` plays its walk or idle clip from `userData.mixer`.
 */
export function modelBody(model: MonsterModel): THREE.Group {
  const body = new THREE.Group()
  const here = monsterModels.loaded.get(model.id)
  if (here) attachRig({ body, model, loaded: here })
  else body.userData.ready = loadMonsterModel(model.id).then((loaded) => attachRig({ body, model, loaded }))
  return body
}

function attachRig(props: { body: THREE.Group; model: MonsterModel; loaded: LoadedMonsterModel }) {
  const body = props.body
  const model = props.model
  const loaded = props.loaded
  const rig = clone(loaded.scene) as THREE.Group
  rig.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.castShadow = true
    mesh.frustumCulled = false
    const old = mesh.material as THREE.MeshStandardMaterial
    mesh.material = new THREE.MeshLambertMaterial({ map: old.map ? muteTexture({ map: old.map, tint: model.tint, amount: model.mute }) : null })
  })
  // Fit to its authored length from the rest pose, then stand it on the ground.
  const rest = new THREE.Box3().setFromObject(rig)
  const size = rest.getSize(new THREE.Vector3())
  rig.scale.setScalar(model.length / size[model.axis])
  rig.rotation.y = model.yaw ?? 0
  rig.updateMatrixWorld(true)
  const fitted = new THREE.Box3().setFromObject(rig)
  rig.position.y = GROUND - fitted.min.y
  const mixer = new THREE.AnimationMixer(rig)
  const walk = mixer.clipAction(loaded.walk)
  const idle = mixer.clipAction(loaded.idle)
  walk.play()
  idle.play()
  walk.weight = 0
  body.userData.mixer = mixer
  body.userData.actions = { walk, idle }
  body.add(rig)
  return body
}
