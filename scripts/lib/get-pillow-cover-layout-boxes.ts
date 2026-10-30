import type { z } from "zod"
import type { LayoutBox } from "#/lib/engine/get-box-layout-error"
import type { pillowCoverCuttingSchema } from "#/scripts/lib/pillow-cover-cutting-schema"
type Props = Readonly<{ pillowId: string; panels: ReadonlyArray<Readonly<{ face: string; size: readonly [number, number] }>>; cuts: z.infer<typeof pillowCoverCuttingSchema>["cuts"] }>

/** Complete face identities are checked before reducing the cut plane to boxes with a common auxiliary axis. */
export function getPillowCoverLayoutBoxes(props: Props): readonly LayoutBox[] | Error {
  const expected = ["cover", "spare-cover"].flatMap((output) =>
    props.panels.map((panel) => ({ id: `${props.pillowId}:${output}:${panel.face}`, face: panel.face, output: `${props.pillowId}:${output}`, size: panel.size })),
  )
  if (expected.length !== props.cuts.length) return new Error("Pillow covers lack unique complete face sets")
  const boxes: LayoutBox[] = []

  for (const panel of expected) {
    const matches = props.cuts.filter((cut) => cut.output === panel.output && cut.face === panel.face)
    if (matches.length !== 1) return new Error("Pillow covers lack unique complete face sets")
    const cut = matches[0]
    boxes.push({ id: panel.id, origin: [cut.origin_m[0], 0, cut.origin_m[1]], size: [panel.size[0], 1, panel.size[1]] })
  }

  return boxes
}
