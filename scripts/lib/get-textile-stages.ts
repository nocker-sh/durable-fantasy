import type { z } from "zod"
import type { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import type { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
type Props = Pick<z.infer<typeof sleepingMaterialsSchema>, "textile"> & Readonly<{ owner: string }>
type Stage = Readonly<Pick<z.infer<typeof textileOrdersSchema>[number], "stage" | "recipient"> & { supplier: string }>

/** Both traversal directions use one handoff definition; the last recipient is the beneficiary, not another maker. */
export function getTextileStages(props: Props): readonly Stage[] {
  return [
    { stage: "wool", supplier: props.textile.wool_supplier, recipient: props.textile.spinner },
    { stage: "spin", supplier: props.textile.spinner, recipient: props.textile.weaver },
    { stage: "weave", supplier: props.textile.weaver, recipient: props.textile.tailor },
    { stage: "finish", supplier: props.textile.tailor, recipient: props.owner },
  ]
}
