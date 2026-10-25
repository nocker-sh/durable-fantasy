// Copied from the dev shadcn Button and restyled (ui.md §6.4): a raised navy plate that lights
// its edge on hover and sinks when pressed.
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md font-head font-semibold whitespace-nowrap text-text outline-none select-none focus-visible:outline-1 focus-visible:outline-offset-1 focus-visible:outline-white/60 disabled:cursor-default disabled:text-text-faint disabled:shadow-none",
  {
    variants: {
      variant: {
        default: "bg-white/10 hover:bg-white/16 active:bg-white/8 disabled:bg-white/5",
        primary: "bg-[rgb(90_140_220/0.55)] text-white hover:bg-[rgb(100_150_230/0.7)] active:bg-[rgb(80_125_200/0.6)] disabled:bg-white/5",
        ghost: "hover:bg-white/8 aria-pressed:bg-white/12",
      },
      size: {
        default: "h-7 px-3 text-[13px]",
        sm: "h-6 px-2 text-xs",
        icon: "size-7 text-[13px]",
        "icon-sm": "size-5 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({ className, variant = "default", size = "default", ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
