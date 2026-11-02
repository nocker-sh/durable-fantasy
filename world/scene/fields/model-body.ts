import * as THREE from "three"
import { clone } from "#resources/three/skeleton-utils"
import { createColorMaterial as colorMat } from "#/lib/graphics/create-color-material"
import type { FigurePaint } from "#/world/core/monster-figure-types"
import type { MonsterModel, RigBlock } from "#/world/core/monster-model-types"
import { loadMonsterModel } from "#/world/scene/fields/load-monster-model"
import { monsterModels } from "#/world/scene/fields/monster-model-store"
import type { LoadedMonsterModel } from "#/world/scene/fields/monster-model-store"
import { blockGeometry } from "#/world/scene/fields/block-geometry"

/** Where a body stands: the scene lifts every creature this far above the ground. */
const GROUND = -0.06

/**
 * A block creature moved by a rig. The group is returned at once and the rig joins it when loaded (at once if it is
 * already here); `poseModel` plays its walk or idle clip from `userData.mixer`.
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
  const rig = clone(props.loaded.scene) as THREE.Group
  // Fit the rest pose to its authored length, centre it and stand it on the ground, measured from the model's own skin.
  const rest = new THREE.Box3().setFromObject(rig)
  rig.scale.setScalar(model.length / rest.getSize(new THREE.Vector3())[model.axis])
  rig.updateMatrixWorld(true)
  const fitted = new THREE.Box3().setFromObject(rig)
  const middle = fitted.getCenter(new THREE.Vector3())
  rig.position.set(-middle.x, GROUND - fitted.min.y, -middle.z)
  body.add(rig)
  body.updateMatrixWorld(true)
  // The skin is only the rig's measure; the creature is drawn in blocks hung on its bones.
  const skins: THREE.Object3D[] = []
  const bones = new Map<string, THREE.Bone>()
  rig.traverse((object) => {
    if ((object as THREE.SkinnedMesh).isSkinnedMesh || (object as THREE.Mesh).isMesh) skins.push(object)
    if ((object as THREE.Bone).isBone) bones.set(object.name, object as THREE.Bone)
  })
  for (const skin of skins) skin.removeFromParent()
  const paint = paints(model)
  const toBody = new THREE.Matrix4().copy(body.matrixWorld).invert()
  for (const block of model.blocks) {
    const bone = bones.get(block.bone)
    if (!bone) throw new Error(`No bone ${block.bone} in the ${model.id} rig`)
    const mesh = blockMesh({ block, at: (name) => restAt({ bones, name, toBody }), paint })
    // place the block in the body as authored, then hang it on its bone without moving it
    const inBody = mesh.matrix.clone().setPosition(new THREE.Vector3().setFromMatrixPosition(mesh.matrix).add(new THREE.Vector3(0, GROUND, 0)))
    const boneInBody = new THREE.Matrix4().multiplyMatrices(toBody, bone.matrixWorld)
    const local = new THREE.Matrix4().copy(boneInBody).invert().multiply(inBody)
    local.decompose(mesh.position, mesh.quaternion, mesh.scale)
    mesh.castShadow = block.paint !== "eye"
    bone.add(mesh)
  }
  const mixer = new THREE.AnimationMixer(rig)
  const walk = mixer.clipAction(props.loaded.walk)
  const idle = mixer.clipAction(props.loaded.idle)
  walk.play()
  idle.play()
  walk.weight = 0
  body.userData.mixer = mixer
  body.userData.actions = { walk, idle }
}

function paints(model: MonsterModel): (key: FigurePaint) => THREE.Material {
  const p = model.palette
  const colours: Record<FigurePaint, number> = {
    hide: p.hide,
    belly: p.belly ?? 0xd8ccb8,
    dark: p.dark ?? 0x3a3238,
    eye: p.eye ?? 0x1a1420,
    accent: p.accent ?? p.hide,
    bone: p.bone ?? 0xe6dcc4,
    glow: p.glow ?? 0xf0e0a0,
  }
  const made = new Map<FigurePaint, THREE.Material>()
  return (key) => {
    let m = made.get(key)
    if (!m) {
      m = key === "eye" || key === "glow" ? new THREE.MeshBasicMaterial({ color: colours[key] }) : colorMat(colours[key])
      made.set(key, m)
    }
    return m
  }
}

/** A block posed in the body's rest-pose space, ground at y = 0 (its matrix holds the pose; it is not yet hung). */
function blockMesh(props: { block: RigBlock; at: (bone: string) => THREE.Vector3; paint: (key: FigurePaint) => THREE.Material }): THREE.Mesh {
  const block = props.block
  if ("to" in block) {
    const from = props.at(block.bone)
    const to = props.at(block.to)
    const grow = block.grow ?? 0
    const length = from.distanceTo(to) + grow * 2
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(block.width, block.height, Math.max(0.001, length)), props.paint(block.paint))
    const along = to.clone().sub(from).normalize()
    const up = Math.abs(along.y) > 0.95 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(0, 1, 0)
    const turn = new THREE.Matrix4().lookAt(new THREE.Vector3(), along, up)
    mesh.matrix.copy(turn).setPosition(from.clone().add(to).multiplyScalar(0.5))
    return mesh
  }
  const mesh = new THREE.Mesh(blockGeometry(block.shape, block.size), props.paint(block.paint))
  const scale = block.shape === "ball" ? new THREE.Vector3(block.size[0], block.size[1], block.size[2]) : new THREE.Vector3(1, 1, 1)
  const turn = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(block.turn ?? [0, 0, 0])))
  mesh.matrix.compose(new THREE.Vector3(...block.at), turn, scale)
  return mesh
}

/** Where a joint stands in the rest pose, in the body with the ground at y = 0. */
function restAt(props: { bones: Map<string, THREE.Bone>; name: string; toBody: THREE.Matrix4 }): THREE.Vector3 {
  const bone = props.bones.get(props.name)
  if (!bone) throw new Error(`No bone ${props.name}`)
  return new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld).applyMatrix4(props.toBody).sub(new THREE.Vector3(0, GROUND, 0))
}
