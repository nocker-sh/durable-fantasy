type DrawableCanvas = HTMLCanvasElement & { content?: string; updateElementGeometry?: unknown; getElementTransform?: unknown }

/**
 * 名前の変わる前の版には合わせない。`content="drawable"` を解釈し、描いた位置をクリックの判定へ
 * 渡せる版（`updateElementGeometry`）だけを対応とする。判定を渡せない版では、描いた HUD を押せない。
 */
export function supportsHtmlInCanvas(): boolean {
  if (typeof document === "undefined" || typeof CanvasRenderingContext2D === "undefined") return false
  const canvas = document.createElement("canvas") as DrawableCanvas
  canvas.setAttribute("content", "drawable")
  return (
    canvas.content === "drawable" && typeof canvas.updateElementGeometry === "function" && typeof canvas.getElementTransform === "function" && "drawElementImage" in CanvasRenderingContext2D.prototype
  )
}
