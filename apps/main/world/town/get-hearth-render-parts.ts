import { hearthParts } from "#/world/town/hearth-parts"
import { getCookingHearthParts } from "#/world/town/get-cooking-hearth-parts"
import type { CookingTopSpec } from "#/world/town/get-cooking-top-box"
type Props = Omit<Parameters<typeof getCookingHearthParts>[0], "top"> & { top: CookingTopSpec | null }

/** Ordinary hearths keep their original masonry; cooking hearths replace only the measured plate volume. */
export function getHearthRenderParts(props: Props) {
  if (props.top) return getCookingHearthParts({ ...props, top: props.top })
  try {
    return { ...hearthParts({ bounds: props.bounds, front: props.front, spec: props.hearth, shaft: props.shaft, bottom: props.bottom }), plate: null }
  } catch (error) {
    if (error instanceof Error) return error
    return new Error("Invalid hearth geometry")
  }
}
