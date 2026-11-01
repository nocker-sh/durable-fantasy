import type * as THREE from "three"
import type { FigureSwing } from "#/world/core/monster-figure-types"

type Props = { body: THREE.Group; now: number; moving: boolean }

/** Swing a figure's jointed parts: legs stride while it walks, wings and tails keep a slow beat while it rests. */
export function poseFigure(props: Props) {
  const joints = props.body.userData.joints as THREE.Group[] | undefined
  if (!joints) return
  const t = props.now / 1000 + props.body.id * 0.37
  const go = props.moving ? 1 : 0
  for (const joint of joints) {
    const swing = joint.userData.swing as FigureSwing
    const side = joint.userData.side as number
    if (swing === "stride-a" || swing === "stride-b") joint.rotation.x = Math.sin(t * 9) * 0.55 * go * (swing === "stride-a" ? 1 : -1)
    else if (swing === "flap") joint.rotation.z = Math.sin(t * (props.moving ? 14 : 3)) * (props.moving ? 0.6 : 0.15) * side
    else if (swing === "wag") joint.rotation.y = Math.sin(t * (props.moving ? 8 : 2.5)) * 0.4
    else if (swing === "nod") joint.rotation.x = Math.sin(t * (props.moving ? 9 : 1.4)) * (props.moving ? 0.14 : 0.08)
    else if (swing === "sway") joint.rotation.z = Math.sin(t * 1.3 + side) * 0.14
    else joint.scale.setScalar(1 + Math.sin(t * 2.2) * 0.08)
  }
}
