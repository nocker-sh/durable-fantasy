import { withoutKeys } from "#/lib/engine/without-keys"
import { cn } from "cn"

export function FieldDescription(inputProps: React.ComponentProps<"p">) {
  const className = inputProps.className
  const props = withoutKeys(inputProps, ["className"])

  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  )
}
