import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import { kneelingPose } from "#/world/scene/figure/kneeling"
import { getNativeBimanualReachPose } from "#/world/scene/figure/get-native-bimanual-reach-pose"
import { getPersonalBoxHandTargets } from "#/scripts/lib/get-personal-box-hand-targets"
import type { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import type { StorageBoxPart } from "#/world/town/storage-box-types"
import type { z } from "zod"
type Props = { slot: z.infer<typeof personalStorageSchema>[number]; parts: readonly StorageBoxPart[] }

/** Static endpoints and intermediate boards use the same owner's native body and the same physical hand targets. */
export function getPersonalBoxReachPose(props: Props) {
  const source = props.slot.packing?.opening?.reach_review
  if (!source || source.operator !== props.slot.resident) return new Error("Personal box has no matching native reach review")
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => `resident-${resident.name}` === source.operator)]
  if (!look || source.frame >= FRAMES[source.animation]) return new Error("Invalid personal box native frame")
  const lid = props.parts.find((part) => part.part === "lid"),
    targets = getPersonalBoxHandTargets({ parts: props.parts, target: source.target ?? "west_edge", halfSpan: source.hand_half_span_m })
  if (!lid || targets instanceof Error) return new Error("Personal box hand targets leave the selected wood")
  const centre: readonly [number, number] = [(lid.x0 + lid.x1) / 2, (lid.z0 + lid.z1) / 2],
    body: readonly [number, number] = [centre[0] + source.body_from_lid_m[0], centre[1] + source.body_from_lid_m[1]]
  try {
    const skeleton = kneelingPose(look, skelFor(look, source.animation, source.frame), { pelvis_drop_m: source.pelvis_drop_m, knee: source.knee })
    const posed = getNativeBimanualReachPose({ look, skeleton, targets, body, heading: Math.PI / 2, poles: { l: [1, -0.3, -0.2], r: [-1, -0.3, -0.2] } })
    if (posed instanceof Error) return posed
    return { body, look, skeleton, posed, lid, targets }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid personal box reach posture")
  }
}
