import type * as THREE from "three"

type Props = { body: THREE.Group; dt: number; moving: boolean }

/** Ease a model between its walk and idle clips and advance them. Does nothing until the model has loaded. */
export function poseModel(props: Props) {
  const mixer = props.body.userData.mixer as THREE.AnimationMixer | undefined
  if (!mixer) return
  const actions = props.body.userData.actions as { walk: THREE.AnimationAction; idle: THREE.AnimationAction }
  const k = 1 - 0.0001 ** props.dt
  actions.walk.weight += ((props.moving ? 1 : 0) - actions.walk.weight) * k
  actions.idle.weight = 1 - actions.walk.weight
  mixer.update(props.dt)
}
