// The HUD painted through a canvas of its own where the browser can (ui.md §2), and plain HTML
// everywhere else. The children stay real DOM in both: React, focus, clicks and screen readers do not change.
import { useEffect, useRef, useState } from "react"
import { supportsHtmlInCanvas } from "#/components/game/supports-html-in-canvas"

type DrawableContext = CanvasRenderingContext2D & {
  drawElementImage(element: Element, x: number, y: number): unknown
}

type PaintingCanvas = HTMLCanvasElement & {
  requestPaint(): void
  getElementImageDefaultSize(element: Element): { width: number; height: number }
  getElementTransform(element: Element, draw: DOMMatrix): DOMMatrix
  updateElementGeometry(element: Element, transform: DOMMatrix): void
}

type Props = Readonly<{
  /** Places the layer: the canvas, or the plain div that stands in for it. It needs a size of its own. */
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
    // windows that hold the player still (a conversation, a shop) must never stay open unseen or unclickable
    const fallBack = (error: unknown) => {
      console.error(error)
      setUsesCanvas(false)
    }
    const paint = () => {
      if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return
      const size = canvas.getElementImageDefaultSize(element)
      if (size.width === 0 || size.height === 0) return fallBack(new Error("The HUD has no size to paint inside its canvas"))
      const scale = canvas.width / canvas.clientWidth
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.clearRect(0, 0, canvas.width, canvas.height)
      context.setTransform(scale, 0, 0, scale, 0, 0)
      try {
        context.drawElementImage(element, 0, 0)
        // clicks find what is drawn only once the canvas is told where it went
        canvas.updateElementGeometry(element, canvas.getElementTransform(element, context.getTransform()))
      } catch (error) {
        fallBack(error)
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
    <canvas ref={canvasRef} content="drawable" className={props.className}>
      {/* in the flow and sized: an absolutely placed child is not painted */}
      <div ref={drawnRef} {...{ drawable: "" }} className="relative size-full">
        {props.children}
      </div>
    </canvas>
  )
}
