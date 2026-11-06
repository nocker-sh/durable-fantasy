/** 名前の変わる前の版には合わせない。`content="drawable"` を解釈する版だけを対応とする。 */
export function supportsHtmlInCanvas(): boolean {
  if (typeof document === "undefined") return false
  const canvas = document.createElement("canvas") as HTMLCanvasElement & { content?: string }
  canvas.setAttribute("content", "drawable")
  return canvas.content === "drawable"
}
