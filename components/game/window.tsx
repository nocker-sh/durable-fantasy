// A game window (ui.md §5): a panel with a title bar. Drag it by the title bar, fold it to the
// title bar with －, resize it from the corner grip if it allows. It remembers position, size and
// folding, stays at least 80px on screen (also when the browser window shrinks) and comes to the
// front when touched. Which windows are open, and their order, belong to the Game.
import { useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import { cn } from "cn";
import { Kbd } from "./kbd.tsx";

type Layout = { x: number; y: number; w?: number; h?: number; folded?: boolean };

const keep = (l: Layout, el: HTMLElement | null): Layout => {
  const w = el?.offsetWidth ?? l.w ?? 200;
  return {
    ...l,
    x: Math.round(Math.min(Math.max(l.x, 80 - w), window.innerWidth - 80)),
    y: Math.round(Math.min(Math.max(l.y, 0), window.innerHeight - 32)),
  };
};

function Window({
  id,
  title,
  hotkey,
  z,
  onClose,
  onFocus,
  initial,
  size,
  tone = "solid",
  actions,
  className,
  bodyClassName,
  children,
  footer,
}: {
  id: string;
  title: ReactNode;
  hotkey?: string;
  /** stacking order */
  z: number;
  onClose?: () => void;
  onFocus?: () => void;
  /** first position, from the viewport size */
  initial: (width: number, height: number) => { x: number; y: number };
  /** resizable from the corner: first and smallest size */
  size?: { initial: [number, number]; min: [number, number] };
  /** a lighter, see-through ground (the chat) */
  tone?: "solid" | "soft";
  /** extra buttons in the title bar */
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const key = `ui-window/${id}`;

  useEffect(() => {
    let saved: Layout | null = null;
    try {
      saved = JSON.parse(localStorage.getItem(key) ?? "null");
    } catch {
      saved = null;
    }
    const first: Layout = { ...initial(window.innerWidth, window.innerHeight), ...(size ? { w: size.initial[0], h: size.initial[1] } : {}) };
    setLayout(keep({ ...first, ...saved }, ref.current));
    const onResize = () => setLayout((l) => (l ? keep(l, ref.current) : l));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // initial and size are read once, when the window opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = (l: Layout) => localStorage.setItem(key, JSON.stringify(l));

  const drag = (event: ReactPointerEvent, apply: (l: Layout, dx: number, dy: number) => Layout) => {
    if (event.button !== 0 || !layout) return;
    event.preventDefault();
    event.stopPropagation();
    const start = { x: event.clientX, y: event.clientY, layout };
    let last = layout;
    const move = (e: PointerEvent) => {
      last = keep(apply(start.layout, e.clientX - start.x, e.clientY - start.y), ref.current);
      setLayout(last);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      save(last);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const fold = () => {
    if (!layout) return;
    const next = { ...layout, folded: !layout.folded };
    setLayout(next);
    save(next);
  };

  const folded = !!layout?.folded;
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
        onPointerDown={(e) => !(e.target as HTMLElement).closest("button") && drag(e, (l, dx, dy) => ({ ...l, x: l.x + dx, y: l.y + dy }))}
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
  );
}

function TitleButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
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
  );
}

export { Window, TitleButton };
