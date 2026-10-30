import * as THREE from "three"

/** A pixel-scaled perspective camera that follows outside a still central region. */
export class PixelCamera {
  readonly camera = new THREE.PerspectiveCamera(32, 1, 0.5, 200)
  readonly focus: THREE.Vector3
  private readonly pitch = 0.82
  private readonly deadZone = 0.4
  private centring = false
  private level = 0
  width = 1
  height = 1
  distance = 13
  get scale() {
    return this.zooms[this.level]
  }
  private readonly pixelsPerUnit: number
  private readonly onResize: (width: number, height: number, scale: number) => void
  /** Screen pixels per rendered pixel, from the furthest zoom out; values below one render finer pixels. */
  private readonly zooms: readonly number[]
  constructor(inputProps2: { position: THREE.Vector3; pixelsPerUnit: number; onResize: (width: number, height: number, scale: number) => void; zooms?: readonly number[]; level?: number }) {
    const position = inputProps2.position
    const pixelsPerUnit = inputProps2.pixelsPerUnit
    const onResize = inputProps2.onResize
    const zooms = inputProps2.zooms === undefined ? [1, 2] : inputProps2.zooms
    const level = inputProps2.level === undefined ? 0 : inputProps2.level
    this.pixelsPerUnit = pixelsPerUnit
    this.onResize = onResize
    this.zooms = zooms

    this.focus = position.clone()
    this.level = Math.min(zooms.length - 1, Math.max(0, level))
  }
  resize = (width = this.width, height = this.height) => {
    this.width = Math.max(1, width)
    this.height = Math.max(1, height)
    const renderHeight = Math.ceil(this.height / this.scale)
    this.onResize(this.width, this.height, this.scale)
    this.distance = renderHeight / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * this.pixelsPerUnit)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
  }
  zoom = (delta: number) => {
    this.level = Math.min(this.zooms.length - 1, Math.max(0, this.level + Math.sign(delta)))
    this.resize()
  }
  zoomLevel = () => ({ level: this.level, max: this.zooms.length - 1 })
  /** Slide the point looked at so the ground follows a drag of (dx, dy) screen pixels. */
  pan(dx: number, dy: number, yaw: number) {
    const perPixel = (2 * this.distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))) / this.height
    const across = -dx * perPixel,
      along = (dy * perPixel) / Math.sin(this.pitch)
    this.focus.x += Math.cos(yaw) * across - Math.sin(yaw) * along
    this.focus.z += -Math.sin(yaw) * across - Math.cos(yaw) * along
  }
  /** Look straight at a point, with no still middle and no easing (a free camera). */
  look(at: THREE.Vector3, yaw: number) {
    const cam = this.camera,
      dist = this.distance,
      pitch = this.pitch
    this.focus.copy(at)
    cam.position.set(at.x + Math.sin(yaw) * Math.cos(pitch) * dist, at.y + Math.sin(pitch) * dist, at.z + Math.cos(yaw) * Math.cos(pitch) * dist)
    cam.lookAt(at)
  }
  update(inputProps: { meAt: THREE.Vector3; yaw: number; turned: boolean; dt: number }) {
    const meAt = inputProps.meAt
    const yaw = inputProps.yaw
    const turned = inputProps.turned
    const dt = inputProps.dt

    const cam = this.camera,
      camFocus = this.focus,
      dist = this.distance,
      pitch = this.pitch,
      DEAD = this.deadZone
    let centring = this.centring
    if (turned) centring = true
    const want = meAt.clone()
    if (!centring) {
      const halfH = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)),
        halfW = halfH * cam.aspect
      const rx = Math.cos(yaw),
        rz = -Math.sin(yaw),
        fx = -Math.sin(yaw),
        fz = -Math.cos(yaw)
      const dx = meAt.x - camFocus.x,
        dz = meAt.z - camFocus.z
      const sx = (dx * rx + dz * rz) / halfW,
        sy = ((dx * fx + dz * fz) * Math.sin(pitch)) / halfH
      const ex = Math.sign(sx) * Math.max(0, Math.abs(sx) - DEAD),
        ey = Math.sign(sy) * Math.max(0, Math.abs(sy) - DEAD)
      want.set(camFocus.x + rx * ex * halfW + (fx * ey * halfH) / Math.sin(pitch), meAt.y, camFocus.z + rz * ex * halfW + (fz * ey * halfH) / Math.sin(pitch))
    }
    camFocus.lerp(want, Math.min(1, dt * (centring ? 6 : 10)))
    if (centring && camFocus.distanceTo(meAt) < 0.05) centring = false
    cam.position.set(camFocus.x + Math.sin(yaw) * Math.cos(pitch) * dist, camFocus.y + Math.sin(pitch) * dist, camFocus.z + Math.cos(yaw) * Math.cos(pitch) * dist)
    cam.lookAt(camFocus)
    this.centring = centring
  }
}
