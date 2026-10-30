import { withoutKeys } from "#/lib/engine/without-keys"
// A HUD panel: navy with the double brass edge and corner fittings, or a lighter see-through one.
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const panelVariants = cva("pointer-events-auto", {
  variants: {
    tone: {
      solid: "ui-panel ui-corners",
      soft: "ui-panel ui-panel--soft",
    },
  },
  defaultVariants: { tone: "solid" },
})

function Panel(inputProps: React.ComponentProps<"div"> & VariantProps<typeof panelVariants>) {
  const className = inputProps.className
  const tone = inputProps.tone
  const props = withoutKeys(inputProps, ["className", "tone"])

  return <div data-slot="panel" className={cn(panelVariants({ tone }), className)} {...props} />
}

export { Panel }
