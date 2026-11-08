// Right-clicking a picture (the 3D view, a sprite, an icon) does not open the browser's
// "save image" menu. Only the browser's menu is held back: right-click handlers still run.
import { useEffect } from "react"

const hold = (e: MouseEvent) => {
  if (e.target instanceof HTMLCanvasElement || e.target instanceof HTMLImageElement) e.preventDefault()
}

export function useNoCanvasMenu() {
  useEffect(() => {
    document.addEventListener("contextmenu", hold)
    return () => document.removeEventListener("contextmenu", hold)
  }, [])
}
