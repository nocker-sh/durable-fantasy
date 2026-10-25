// Things the scene builds (objects, creatures) drawn on their own for the dev pages: a small still
// thumbnail at the scene's pixel size, and a turning preview, by day or by night, that fits its box.
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { INDOOR } from "#/world/scene/interior.ts"
import { setLayout } from "#/world/scene/world.ts"
import { resetRegistries, updaters } from "#/world/scene/build.ts"
import { critters } from "#/world/scene/actors.ts"

/** Builds the thing at (x, z) into the group. */
export type Build = (root: THREE.Group, x: number, z: number) => void

const AT = 24

function stage(build: Build, night: boolean) {
  setLayout(INDOOR)
  resetRegistries()
  critters.length = 0
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(night ? 0x141a2c : 0x9ec4d8)
  const root = new THREE.Group()
  scene.add(root)
  build(root, AT, AT)
  const box = new THREE.Box3().setFromObject(root)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshLambertMaterial({ color: night ? 0x2a3326 : 0x6a7e4c }))
  ground.rotation.x = -Math.PI / 2
  ground.position.set(AT, Math.min(0, box.isEmpty() ? 0 : box.min.y), AT)
  ground.receiveShadow = true
  scene.add(ground)
  scene.add(new THREE.HemisphereLight(night ? 0x5a6a9a : 0xfff0d8, night ? 0x10121c : 0x48405a, night ? 0.5 : 1.4))
  const sun = new THREE.DirectionalLight(night ? 0x8aa0d8 : 0xffe0b0, night ? 0.6 : 2.4)
  sun.position.set(AT + 16, 20, AT + 20)
  sun.target.position.set(AT, 0, AT)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, far: 60 })
  scene.add(sun, sun.target)
  const size = box.isEmpty() ? new THREE.Vector3(1, 1, 1) : box.getSize(new THREE.Vector3())
  const centre = box.isEmpty() ? new THREE.Vector3(AT, 0.5, AT) : box.getCenter(new THREE.Vector3())
  const reach = Math.max(size.x, size.y, size.z, 0.6)
  return { scene, centre, reach }
}

/** Where the camera stands, looking down at the scene's angle from `turn` round. */
function place(cam: THREE.PerspectiveCamera, centre: THREE.Vector3, reach: number, turn: number) {
  const d = (reach * 0.9) / Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) + reach * 0.5
  cam.position.set(centre.x + Math.sin(turn) * d * 0.8, centre.y + d * 0.6, centre.z + Math.cos(turn) * d * 0.8)
  cam.lookAt(centre)
}

let shared: THREE.WebGLRenderer | null = null
const thumbs = new Map<string, string>()

/** A still of the thing at `px` pixels square, drawn once and kept. */
export function thumbUrl(key: string, build: Build, px = 40): string {
  const known = thumbs.get(key)
  if (known) return known
  shared ??= new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, alpha: true })
  shared.setPixelRatio(1)
  shared.setSize(px, px)
  shared.shadowMap.enabled = true
  shared.outputColorSpace = THREE.SRGBColorSpace
  const { scene, centre, reach } = stage(build, false)
  scene.background = null
  scene.children.filter((c) => c instanceof THREE.Mesh).forEach((c) => scene.remove(c))
  const cam = new THREE.PerspectiveCamera(24, 1, 0.05, 200)
  place(cam, centre, reach, 0.6)
  updaters.forEach((u) => u(0, 0))
  shared.render(scene, cam)
  const url = shared.domElement.toDataURL()
  thumbs.set(key, url)
  return url
}

/** A thumbnail drawn in the browser after the page has mounted. */
export function Thumb({ id, build, px = 40 }: { id: string; build: Build; px?: number }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => setUrl(thumbUrl(id, build, px)), [id, build, px])
  return url ? <img src={url} alt="" width={px} height={px} style={{ imageRendering: "pixelated" }} /> : null
}

/** The thing turning slowly, filling the width of its box; `night` lights it as after dark. */
export function Turntable({ build, night }: { build: Build; night: boolean }) {
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
    const { scene, centre, reach } = stage(build, night)
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
    let raf = 0,
      last = performance.now()
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      updaters.forEach((u) => u(t / 1000, dt))
      critters.forEach((c) => c.update(dt, new THREE.Vector3(1, 0, 0)))
      place(cam, centre, reach, t / 4000)
      renderer.render(scene, cam)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.dispose()
      el.removeChild(canvas)
    }
  }, [build, night])
  return <div ref={host} className="aspect-video max-h-[50svh] w-full overflow-hidden rounded-lg border" />
}
