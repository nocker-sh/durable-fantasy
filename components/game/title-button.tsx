import type { ReactNode } from "react"

export function TitleButton(inputProps: { label: string; onClick: () => void; children: ReactNode }) {
  const label = inputProps.label
  const onClick = inputProps.onClick
  const children = inputProps.children

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-6 cursor-pointer items-center justify-center rounded-md font-head text-[14px] leading-none text-text-dim hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  )
}
