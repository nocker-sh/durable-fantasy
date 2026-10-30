import { useState } from "react"
import { thumbUrl } from "#/dev/thumb-url"
import type { Build } from "#/dev/three-view"
type Props = { id: string; build: Build; px: number }
type Preview = Props & { url: string }
/** Keep every object available without building offscreen scenes during the first page render. */
export function ObjectThumbnail(props: Props) {
  const previewState = useState<Preview | null>(null),
    preview = previewState[0],
    setPreview = previewState[1]
  const isCurrent = preview?.id === props.id && preview.build === props.build && preview.px === props.px
  return (
    <span
      data-thumbnail-state={isCurrent ? "ready" : "pending"}
      style={{ display: "inline-block", width: props.px, height: props.px, verticalAlign: "middle" }}
      ref={(host) => {
        if (!host || isCurrent) return
        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          observer.disconnect()
          setPreview({ ...props, url: thumbUrl(props.id, props.build, props.px) })
        })
        observer.observe(host)
        return () => observer.disconnect()
      }}
    >
      {isCurrent && <img src={preview.url} alt="" width={props.px} height={props.px} style={{ imageRendering: "pixelated" }} />}
    </span>
  )
}
