import { getFrontAccessStorageReview } from "#/scripts/lib/get-front-access-storage-review"
import { getSlidingCabinetLeafDefinition } from "#/world/town/get-sliding-cabinet-leaf-definition"
import { getSlidingCabinetPanelParts } from "#/world/town/get-sliding-cabinet-panel-parts"
import { getNativeSingleHandReachPose } from "#/world/scene/figure/get-native-single-hand-reach-pose"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"
import { skelFor } from "#/world/scene/figure/helpers/animation/skel-for"
import { FRAMES } from "#/world/scene/figure/animation"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Omit<Parameters<typeof getFrontAccessStorageReview>[0], "cell"> & Readonly<{ room: SettingDocument; leaf: "north" | "south"; progress: number }>

/** Independent standing samples approach the actual cutout; relocating the feet between samples is not certified motion. */
export function getFrontAccessApproachFrame(props: Props) {
  const source = props.slot.packing?.front_access?.approach_review,
    review = getFrontAccessStorageReview({ slot: props.slot, cell: props.room.grid?.cell_m ?? NaN })
  if (!source || source.operator !== props.slot.resident || review instanceof Error) return new Error("Missing matching front-access approach proposal")
  if (!Number.isFinite(props.progress) || props.progress < 0 || props.progress > 1 || !["north", "south"].includes(props.leaf)) return new Error("Invalid front-access approach progress")
  const look = RESIDENT_LOOKS[RESIDENTS.findIndex((resident) => `resident-${resident.name}` === source.operator)]
  if (!look || !Number.isSafeInteger(source.frame) || source.frame < 0 || source.frame >= FRAMES[source.animation]) return new Error("Invalid front-access native standing frame")
  const direction = { north: 1, south: -1 },
    offset = direction[props.leaf] * review.travel[props.leaf] * props.progress
  const definition = getSlidingCabinetLeafDefinition({ spec: review.spec, leaf: props.leaf, offset }),
    pull = definition.pull,
    z = (pull.z0 + pull.z1) / 2
  const body: readonly [number, number] = [pull.x0 + source.body_from_pull_m[0], z + source.body_from_pull_m[1]],
    skeleton = skelFor(look, source.animation, source.frame)
  const posed = getNativeSingleHandReachPose({
    look,
    skeleton,
    target: [pull.x0 - source.target_clearance_m, (pull.bottom + pull.top) / 2, z],
    body,
    heading: Math.PI / 2,
    hand: source.hand,
    pole: source.elbow_pole,
  })
  if (posed instanceof Error) return posed
  const opposite = { north: review.closed.south, south: review.closed.north },
    panels = getSlidingCabinetPanelParts({ spec: review.spec, leaf: props.leaf, offset })

  return { look, skeleton, posed, body, pull, solids: [...review.fixed, ...panels, ...opposite[props.leaf], ...review.contents], hand: source.hand }
}
