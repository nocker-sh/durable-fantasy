import type { V3, Bone, Proportions } from "#/world/scene/rig"

export function restPose(P: Proportions): Record<Bone, V3> {
  const hSource = P,
    h = hSource.hipY,
    sh = hSource.shoulderY,
    shW = hSource.shW,
    hipW = hSource.hipW,
    S = hSource.S
  const r = {} as Record<Bone, V3>
  const arm = h + sh - 0.105 * S,
    up = 0.17 * S,
    fo = 0.15 * S // arms hang from low, sloping shoulders
  r.pelvis = [0, h, 0]
  r.spine_01 = [0, h + 0.06 * S, 0]
  r.spine_02 = [0, h + 0.15 * S, 0]
  r.spine_03 = [0, h + 0.25 * S, 0]
  r.neck_01 = [0, h + sh - 0.02, 0]
  r.head = [0, h + sh + 0.048 * S, 0] // a short visible neck
  for (const entry of [
    ["l", 1],
    ["r", -1],
  ] as const) {
    const s = entry[0]
    const x = entry[1]

    const ax = x * (shW + 0.025 * S)
    r[`clavicle_${s}`] = [x * 0.02 * S, arm - 0.01, 0.02 * S]
    r[`upperarm_${s}`] = [ax, arm, 0]
    r[`lowerarm_${s}`] = [ax + x * up, arm, 0]
    r[`hand_${s}`] = [ax + x * (up + fo), arm, 0]
    const lx = x * hipW
    r[`thigh_${s}`] = [lx, h, 0]
    r[`calf_${s}`] = [lx, h * 0.51, 0.003]
    r[`foot_${s}`] = [lx, 0.045 * S, -0.015 * S]
    r[`ball_${s}`] = [lx, 0.008, 0.05 * S]
  }
  return r
}
