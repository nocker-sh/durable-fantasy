// A modal screen (ui.md §2.1): dims everything behind it and takes the input until closed.
import type { ReactNode } from "react"
import { cn } from "cn"

function Modal({ title, onClose, className, children }: { title: string; onClose?: () => void; className?: string; children: ReactNode }) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-[90] flex items-center justify-center bg-black/45 animate-ui-in" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <section role="dialog" aria-modal aria-label={title} className={cn("ui-panel ui-corners flex flex-col p-[3px]", className)}>
        <div className="ui-titlebar flex h-8 items-center justify-center px-4">
          <span className="font-head text-[13px] text-brass-hi ui-text-shadow">{title}</span>
        </div>
        <div className="p-4">{children}</div>
      </section>
    </div>
  )
}

export { Modal }
