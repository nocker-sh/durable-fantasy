// A HUD panel: navy with the double brass edge and corner fittings, or a lighter see-through one.
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const panelVariants = cva("pointer-events-auto", {
  variants: {
    tone: {
      solid: "ui-panel ui-corners",
      soft: "ui-panel ui-panel--soft",
    },
  },
  defaultVariants: { tone: "solid" },
});

function Panel({ className, tone, ...props }: React.ComponentProps<"div"> & VariantProps<typeof panelVariants>) {
  return <div data-slot="panel" className={cn(panelVariants({ tone }), className)} {...props} />;
}

export { Panel };
