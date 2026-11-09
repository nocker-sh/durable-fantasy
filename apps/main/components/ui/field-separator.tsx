import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"
import { Separator } from "#/components/ui/separator"

export function FieldSeparator(
  inputProps: React.ComponentProps<"div"> & {
    children?: React.ReactNode
  },
) {
  const children = inputProps.children
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["children", "className"])

  return (
    <div data-slot="field-separator" data-content={!!children} className={cn("relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2", className)} {...props}>
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground" data-slot="field-separator-content">
          {children}
        </span>
      )}
    </div>
  )
}
