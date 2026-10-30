import { getFrontAccessApproachFrame } from "#/scripts/lib/get-front-access-approach-frame"
import { getRoomStorageSection } from "#/scripts/lib/get-room-storage-section"
import { getNativeFixedCuboidClearanceError } from "#/world/scene/figure/get-native-fixed-cuboid-clearance-error"
import { getForearmSelfClearanceError } from "#/world/scene/figure/get-forearm-self-clearance-error"
import type { SettingDocument } from "#/scripts/lib/setting-document"
type Props = Omit<Parameters<typeof getFrontAccessApproachFrame>[0], "leaf" | "progress"> & Readonly<{ building: SettingDocument | undefined }>

/** Every standing sample keeps solid hands outside every board; the selected arm also avoids clothing and the untouched arm. */
export function getFrontAccessApproachError(props: Props): Error | null {
  const source = props.slot.packing?.front_access?.approach_review
  if (!source) return null
  if (!Number.isSafeInteger(source.samples) || source.samples < 2 || source.samples > 128) return new Error("Invalid front-access approach sample count")
  const section = getRoomStorageSection(props.room, props.building, ["C", "R"])
  if (section instanceof Error) return section

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
    for (const sample of Array.from({ length: source.samples + 1 }).keys()) {
      const frame = getFrontAccessApproachFrame({ ...props, leaf, progress: sample / source.samples })
      if (frame instanceof Error) return frame
      const fixed = getNativeFixedCuboidClearanceError({
        look: frame.look,
        skeleton: frame.posed.skeleton,
        body: frame.body,
        rootY: frame.posed.rootY,
        heading: Math.PI / 2,
        ceiling: section.ceiling,
        obstacles: [...section.obstacles, ...frame.solids],
      })
      if (fixed) return fixed
      const self = getForearmSelfClearanceError({ look: frame.look, skeleton: frame.posed.skeleton, hand: frame.hand, margin: 0 })
      if (self) return self
    }

  return null
}
