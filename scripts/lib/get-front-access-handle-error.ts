import { getFrontAccessHandleFrame } from "#/scripts/lib/get-front-access-handle-frame"
import { getFrontAccessHandleFrameError } from "#/scripts/lib/get-front-access-handle-frame-error"
type Props = Omit<Parameters<typeof getFrontAccessHandleFrame>[0], "leaf" | "progress">

/** Only the selected whole bar has palm contact; every post, solid leaf and opposite handle still blocks all body parts. */
export function getFrontAccessHandleError(props: Props): Error | null {
  const source = props.slot.packing?.front_access?.handle_review
  if (!source) return null
  if (!Number.isSafeInteger(source.samples) || source.samples < 2 || source.samples > 128) return new Error("Invalid raised-handle sample count")

  for (const leaf of ["north", "south"] satisfies ("north" | "south")[])
    for (const sample of Array.from({ length: source.samples + 1 }).keys()) {
      const frame = getFrontAccessHandleFrame({ ...props, leaf, progress: sample / source.samples })
      if (frame instanceof Error) return frame
      const error = getFrontAccessHandleFrameError({ frame })
      if (error) return error
    }

  return null
}
