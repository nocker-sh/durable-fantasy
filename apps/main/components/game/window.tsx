import { useEffect, useRef, useState } from "react"
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react"
import { cn } from "cn"
import { Kbd } from "#/components/game/kbd"
import { keep } from "#/components/game/keep"
import { TitleButton } from "#/components/game/title-button"

export type Layout = { x: number; y: number; w?: number; h?: number; folded?: boolean }

export function Window(inputProps: {
  id: string
  title: ReactNode
  hotkey?: string
  /** stacking order */
  z: number
  onClose?: () => void
  onFocus?: () => void
  /** first position, from the viewport size */
  initial: (width: number, height: number) => { x: number; y: number }
  /** resizable from the corner: first and smallest size */
  size?: { initial: [number, number]; min: [number, number] }
  /** a lighter, see-through ground (the chat) */
  tone?: "solid" | "soft"
  /** while set, a folded window opens out and stays open (the chat while typing) */
  unfold?: boolean
  /** extra buttons in the title bar */
  actions?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
  footer?: ReactNode
}) {
  const id = inputProps.id
  const title = inputProps.title
  const hotkey = inputProps.hotkey
  const z = inputProps.z
  const onClose = inputProps.onClose
  const onFocus = inputProps.onFocus
  const initial = inputProps.initial
  const size = inputProps.size
  const toneValue = inputProps.tone
  const tone = toneValue === undefined ? "solid" : toneValue
  const unfold = !!inputProps.unfold
  const actions = inputProps.actions
  const className = inputProps.className
  const bodyClassName = inputProps.bodyClassName
  const children = inputProps.children
  const footer = inputProps.footer

  const ref = useRef<HTMLDivElement>(null)
  const layoutState = useState<Layout | null>(null),
    layout = layoutState[0],
    setLayout = layoutState[1]
  const key = `ui-window/${id}`

  useEffect(() => {
    const saved: { value: Layout | null } = { value: null }
    try {
      saved.value = JSON.parse(localStorage.getItem(key) ?? "null")
    } catch {
      saved.value = null
    }
    const placeFor = (width: number, height: number): Layout => ({ ...initial(width, height), ...(size ? { w: size.initial[0], h: size.initial[1] } : {}) })
    setLayout(keep({ ...placeFor(window.innerWidth, window.innerHeight), ...saved.value }, ref.current))
    // a window nobody has moved goes back to its own corner at the new size (opened narrow, a right-hand window would stay at the left);
    // one the player placed only stays in view
    const onResize = () =>
      setLayout((l) => {
        if (!l) return l
        const moved = (() => {
          try {
            return localStorage.getItem(key) !== null
          } catch {
            return true
          }
        })()
        return keep(moved ? l : { ...placeFor(window.innerWidth, window.innerHeight), folded: l.folded }, ref.current)
      })
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
    // initial and size are read once, when the window opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const save = (l: Layout) => localStorage.setItem(key, JSON.stringify(l))

  const drag = (event: ReactPointerEvent, apply: (l: Layout, dx: number, dy: number) => Layout) => {
    if (event.button !== 0 || !layout) return
    event.preventDefault()
    event.stopPropagation()
    const start = { x: event.clientX, y: event.clientY, layout }
    const last = { value: layout }
    const move = (e: PointerEvent) => {
      last.value = keep(apply(start.layout, e.clientX - start.x, e.clientY - start.y), ref.current)
      setLayout(last.value)
    }
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      save(last.value)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  // asked to open out: the body shows at once, and the opened fold is saved as ＋ would save it
  useEffect(() => {
    if (!unfold || !layout?.folded) return
    const next = { ...layout, folded: false }
    setLayout(next)
    localStorage.setItem(key, JSON.stringify(next))
  }, [unfold, layout, key])

  const folded = !!layout?.folded && !unfold
  const fold = () => {
    if (!layout) return
    const next = { ...layout, folded: !folded }
    setLayout(next)
    save(next)
  }

  return (
    <section
      ref={ref}
      role="dialog"
      aria-label={typeof title === "string" ? title : id}
      data-slot="window"
      onPointerDownCapture={onFocus}
      style={{
        left: layout?.x ?? -9999,
        top: layout?.y ?? -9999,
        zIndex: z,
        width: size && layout?.w ? layout.w : undefined,
        height: size && layout?.h && !folded ? layout.h : undefined,
      }}
      className={cn(
        // its own width, even when it sticks out past the right edge
        "ui-panel pointer-events-auto absolute flex w-max animate-ui-in flex-col",
        tone === "soft" && "ui-panel--soft",
        className,
      )}
    >
      <div
        onPointerDown={(e) => {
          if (e.target instanceof Element && e.target.closest("button")) return
          drag(e, (l, dx, dy) => ({ ...l, x: l.x + dx, y: l.y + dy }))
        }}
        className="ui-titlebar flex h-8 shrink-0 cursor-grab items-center gap-2 pr-1.5 pl-3 active:cursor-grabbing"
      >
        <span className="truncate font-head text-[12px] font-bold text-white">{title}</span>
        {hotkey && <Kbd className="opacity-70">{hotkey}</Kbd>}
        <span className="ml-auto flex items-center gap-0.5">
          {actions}
          <TitleButton label={folded ? "広げる" : "たたむ"} onClick={fold}>
            {folded ? "＋" : "－"}
          </TitleButton>
          {onClose && (
            <TitleButton label="閉じる" onClick={onClose}>
              ×
            </TitleButton>
          )}
        </span>
      </div>
      {!folded && (
        <>
          <div className={cn("min-h-0 flex-1 px-3 pt-0.5 pb-3", bodyClassName)}>{children}</div>
          {footer && <div className="shrink-0 border-t border-white/10 px-3 py-2">{footer}</div>}
          {size && (
            <div
              aria-hidden
              onPointerDown={(e) => drag(e, (l, dx, dy) => ({ ...l, w: Math.max(size.min[0], (l.w ?? size.initial[0]) + dx), h: Math.max(size.min[1], (l.h ?? size.initial[1]) + dy) }))}
              className="absolute right-1 bottom-1 size-3 cursor-nwse-resize bg-[linear-gradient(135deg,transparent_50%,rgb(255_255_255/0.35)_50%,rgb(255_255_255/0.35)_60%,transparent_60%,transparent_70%,rgb(255_255_255/0.35)_70%,rgb(255_255_255/0.35)_80%,transparent_80%)]"
            />
          )}
        </>
      )}
    </section>
  )
}
