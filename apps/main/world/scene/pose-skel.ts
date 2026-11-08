import type { Bone } from "#/world/scene/rig"
const BEND: [Bone, number][] = [
  ["pelvis", 0.7],
  ["spine_01", 0.55],
  ["spine_02", 0.55],
  ["spine_03", 0.6],
  ["neck_01", 0.6],
  ["head", 0.6],
]
import { qrot } from "#/lib/engine/qrot"
import type { V3, Q, Proportions, Skel, Sample } from "#/world/scene/rig"
import { D, PARENT, BONE_ORDER, bendDamp } from "#/world/scene/rig"
import { scaleQ } from "#/world/scene/helpers/rig/scale-q"
import { restPose } from "#/world/scene/rest-pose"

/** Pose the skeleton at one moment of a clip. */
export function poseSkel(clip: string, s: Sample, P: Proportions): Skel {
  const C = D.value.clips[clip] ?? D.value.clips.Idle_A
  const n = C.f.length
  const fi = Math.min(n - 1, Math.max(0, Math.round(s.t * n) % n))
  const row = C.f[fi]
  const rest = restPose(P)
  const q = {} as Record<Bone, Q>
  D.value.bones.forEach((b, k) => {
    const x = row[3 + k * 3],
      y = row[4 + k * 3],
      z = row[5 + k * 3]
    q[b as Bone] = [x, y, z, Math.sqrt(Math.max(0, 1 - x * x - y * y - z * z))]
  })
  // big heads on short bodies: soften the torso bends so heads stay clear of the ground
  if (bendDamp.value > 0)
    for (const entry of BEND) {
      const b = entry[0]
      const k = entry[1]
      q[b] = scaleQ(q[b], 1 - (1 - k) * bendDamp.value)
    }
  const legLen = P.hipY - 0.045 * P.S
  const ox = { value: row[0] * legLen },
    oy = { value: row[1] * legLen },
    oz = { value: row[2] * legLen }
  if (s.still) {
    ox.value = 0
    oz.value = 0
  }
  const p = {} as Record<Bone, V3>
  p.pelvis = [rest.pelvis[0] + ox.value, s.seatY ?? rest.pelvis[1] + oy.value, rest.pelvis[2] + oz.value]
  for (const b of BONE_ORDER) {
    const pa = PARENT[b]
    if (!pa) continue
    const off: V3 = [rest[b][0] - rest[pa][0], rest[b][1] - rest[pa][1], rest[b][2] - rest[pa][2]]
    const r = qrot(q[pa], off)
    p[b] = [p[pa][0] + r[0], p[pa][1] + r[1], p[pa][2] + r[2]]
  }
  return { p, q, rest }
}
