// Copied from the dev shadcn Input and restyled: ecru text in a sunken strip.
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-full bg-black/35 px-3.5 font-body text-[13px] text-text outline-none placeholder:text-text-faint shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)] focus:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.3)] disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
