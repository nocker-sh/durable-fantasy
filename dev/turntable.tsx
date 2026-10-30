import { placePreviewCamera } from "#/dev/place-preview-camera"
import { SceneResources } from "#/lib/graphics/scene-resources"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { updateCutaways } from "#/world/scene/update-cutaways"
import { updaters } from "#/world/scene/construction/registry"
import { critters } from "#/world/scene/critters"
import type { Build } from "#/dev/three-view"
import { stage } from "#/dev/stage"

/** The thing turning slowly, filling the width of its box; `night` lights it as after dark. */
export function Turntable(inputProps: { build: Build; night: boolean; cutaway?: boolean }) {
  const build = inputProps.build
  const night = inputProps.night
  const cutawayValue = inputProps.cutaway
  const cutaway = cutawayValue === undefined ? false : cutawayValue

  const host = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: false })
    renderer.setPixelRatio(1)
    renderer.shadowMap.enabled = true
    renderer.outputColorSpace = THREE.SRGBColorSpace
    const canvas = renderer.domElement
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.imageRendering = "pixelated"
    el.appendChild(canvas)
    const preview = stage(build, night),
      scene = preview.scene
    const cam = new THREE.PerspectiveCamera(24, 1, 0.05, 200)
    // drawn at a third of the box's size and scaled up, as the game draws its pixels
    const fit = () => {
      const w = Math.max(1, Math.floor(el.clientWidth / 3)),
        h = Math.max(1, Math.floor(el.clientHeight / 3))
      renderer.setSize(w, h, false)
      cam.aspect = w / h
      cam.updateProjectionMatrix()
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    const raf = { value: 0 },
      frames = { value: 0 },
      last = { value: performance.now() }
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last.value) / 1000)
      last.value = t
      updaters.forEach((u) => u(t / 1000, dt))
      critters.forEach((c) => c.update(dt, new THREE.Vector3(1, 0, 0)))
      placePreviewCamera({ camera: cam, frame: preview, turn: t / 4000 })
      if (cutaway) updateCutaways(cam.position)
      renderer.render(scene, cam)
      if (++frames.value === 20) canvas.dataset.ready = "1"
      raf.value = requestAnimationFrame(tick)
    }
    raf.value = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf.value)
      ro.disconnect()
      new SceneResources(scene).dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      el.removeChild(canvas)
    }
  }, [build, night, cutaway])
  return <div ref={host} className="aspect-video max-h-[50svh] w-full overflow-hidden rounded-lg border" />
}
