import type { SceneEnvironment } from "#/world/scene/runtime/scene-environment-types"

type Props = Readonly<{ environment: { puffs: SceneEnvironment["puffs"]; smoke: Pick<SceneEnvironment["smoke"], "set"> }; dt: number }>

/** 煙の粒の寿命と元の位相を保ち、一括描画の位置と透け方だけを更新する。 */
export function updateSceneSmoke(props: Props): void {
  props.environment.puffs.forEach((puff, index) => {
    puff.age += props.dt
    if (puff.age > puff.life) puff.age -= puff.life
    const phase = puff.age / puff.life
    props.environment.smoke.set({
      index,
      x: puff.origin.x + phase * phase * 1.6 * puff.driftX * 6 + Math.sin(puff.age * 2 + puff.origin.x) * 0.08,
      y: puff.origin.y + phase * 2.6,
      z: puff.origin.z - phase * phase * 0.6,
      size: 0.18 + phase * 0.5,
      opacity: (1 - phase) * 0.5 * Math.min(1, phase * 8),
    })
  })
}
