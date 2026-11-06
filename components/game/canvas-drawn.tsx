// A HUD piece painted through a canvas of its own where the browser can (ui.md §3.5), and plain HTML
// everywhere else. The children stay real DOM in both: React, focus, clicks and screen readers do not change.
import { useEffect, useRef, useState } from "react"
import { readDrawnRect } from "#/components/game/read-drawn-rect"
import { supportsHtmlInCanvas } from "#/components/game/supports-html-in-canvas"

type DrawableContext = CanvasRenderingContext2D & {
  drawElementImage(element: Element, x: number, y: number, width: number, height: number): unknown
}

type PaintingCanvas = HTMLCanvasElement & { requestPaint(): void }

type Props = Readonly<{
  /** Places the piece. Its box must hold everything it paints: a canvas clips overflow and ignores transforms. */
  className: string
  children: React.ReactNode
}>

export function CanvasDrawn(props: Props) {
  const usesCanvasState = useState(supportsHtmlInCanvas),
    usesCanvas = usesCanvasState[0],
    setUsesCanvas = usesCanvasState[1]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current as PaintingCanvas | null
    const element = drawnRef.current
    if (!usesCanvas || !canvas || !element) return
    const context = canvas.getContext("2d") as DrawableContext | null
    if (!context) {
      setUsesCanvas(false)
      return
    }
    const paint = () => {
      const rect = readDrawnRect({ canvas, element })
      context.clearRect(0, 0, canvas.width, canvas.height)
      try {
        context.drawElementImage(element, rect.x, rect.y, rect.width, rect.height)
      } catch (error) {
        // the conversation holds the player still, so it must never stay open unseen
        console.error(error)
        setUsesCanvas(false)
      }
    }
    const observer = new ResizeObserver((entries) => {
      const size = entries[0].devicePixelContentBoxSize[0]
      canvas.width = size.inlineSize
      canvas.height = size.blockSize
      canvas.requestPaint()
    })
    canvas.addEventListener("paint", paint)
    observer.observe(canvas, { box: "device-pixel-content-box" })
    return () => {
      observer.disconnect()
      canvas.removeEventListener("paint", paint)
    }
  }, [usesCanvas, setUsesCanvas])

  if (!usesCanvas) return <div className={props.className}>{props.children}</div>
  return (
    <canvas ref={canvasRef} content="drawable" className="pointer-events-none absolute inset-0 z-30 size-full">
      <div ref={drawnRef} {...{ drawable: "" }} className={props.className}>
        {props.children}
      </div>
    </canvas>
  )
}
