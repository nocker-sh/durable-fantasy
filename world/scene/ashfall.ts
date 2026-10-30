import * as THREE from "three"
import { PhaseOscillator } from "#/lib/engine/phase-oscillator"

/** Ash falling round a point: a box of grains that follows the camera's focus and drifts down slowly. */
export class Ashfall {
  readonly points: THREE.Points
  private v: Float32Array
  private readonly driftX: PhaseOscillator
  private readonly driftZ: PhaseOscillator
  private readonly size = 22
  constructor(count = 1600) {
    this.driftX = new PhaseOscillator(count, 1)
    this.driftZ = new PhaseOscillator(count, 1.7)
    const pos = new Float32Array(count * 3)
    this.v = new Float32Array(count)
    for (const i = { value: 0 }; i.value < count; i.value++) {
      pos[i.value * 3] = (Math.random() - 0.5) * this.size
      pos[i.value * 3 + 1] = Math.random() * 9
      pos[i.value * 3 + 2] = (Math.random() - 0.5) * this.size
      this.v[i.value] = 0.25 + Math.random() * 0.35
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    const mat = new THREE.PointsMaterial({ color: 0xb8b4ac, size: 2, sizeAttenuation: false, transparent: true, opacity: 0.55, depthWrite: false })
    this.points = new THREE.Points(geo, mat)
    this.points.frustumCulled = false
    this.points.renderOrder = 5
  }

  /** Move the grains on; `focus` is where the camera looks, `night` from 0 (day) to 1 (night). */
  update(inputProps: { dt: number; t: number; focus: THREE.Vector3; night: number }) {
    const dt = inputProps.dt
    const t = inputProps.t
    const focus = inputProps.focus
    const night = inputProps.night

    const pos = this.points.geometry.attributes.position as THREE.BufferAttribute
    const a = pos.array as Float32Array,
      h = this.size / 2
    this.driftX.setTime(t * 0.4)
    this.driftZ.setTime(t * 0.3)
    for (const i = { value: 0 }; i.value < this.v.length; i.value++) {
      a[i.value * 3 + 1] -= this.v[i.value] * dt
      a[i.value * 3] += this.driftX.sin(i.value) * 0.08 * dt + 0.05 * dt
      a[i.value * 3 + 2] += this.driftZ.cos(i.value) * 0.06 * dt
      if (a[i.value * 3 + 1] < -1) {
        a[i.value * 3 + 1] = 8 + Math.random()
        a[i.value * 3] = (Math.random() - 0.5) * this.size
        a[i.value * 3 + 2] = (Math.random() - 0.5) * this.size
      }
      if (a[i.value * 3] > h) a[i.value * 3] -= this.size
    }
    pos.needsUpdate = true
    this.points.position.set(focus.x, focus.y - 1, focus.z)
    const m = this.points.material as THREE.PointsMaterial
    // by day grey grains against the haze; by night only those near a light are seen, faintly warm
    m.color.setHex(night > 0.5 ? 0xc8b8a0 : 0xb8b4ac)
    m.opacity = 0.55 - night * 0.25
  }
}
