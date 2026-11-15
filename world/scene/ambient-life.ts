import * as THREE from "three"
import { WATER_Y } from "#/world/maps/ground/rules"
import { groundH } from "#/world/scene/ground-h"
import { view } from "#/world/scene/actors"
import { AMBIENT_KINDS } from "#/world/scene/ambient-life-kinds"
import type { AmbientKind } from "#/world/scene/ambient-life-kinds"

/** Half the side of the box of air kept round the camera's focus. */
const HALF = 13

const shaders = {
  vertexShader: `
    attribute float size; attribute float alpha; attribute vec3 tone;
    varying float vAlpha; varying vec3 vTone;
    void main(){ vAlpha = alpha; vTone = tone; gl_PointSize = size; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform vec3 tint; uniform float opacity;
    varying float vAlpha; varying vec3 vTone;
    void main(){ if (vAlpha * opacity < 0.01) discard; gl_FragColor = vec4(vTone * tint, vAlpha * opacity);
    #include <colorspace_fragment>
    }`,
}

type Swarm = {
  kind: AmbientKind
  points: THREE.Points
  material: THREE.ShaderMaterial
  pos: Float32Array
  size: Float32Array
  alpha: Float32Array
  /** per point: anchor x, anchor z, base height, phase, speed, timer, target x, target z */
  state: Float32Array
}

const S = 8

/**
 * The living air of a field outside town: butterflies, dragonflies, birds, falling leaves and what
 * the wind carries, by the kinds in ambient-life-kinds.ts for the map's ground. Like the falling
 * ash it follows the camera's focus and costs one draw per kind; it never touches the walk grid.
 */
export class AmbientLife {
  readonly group = new THREE.Group()
  private readonly swarms: Swarm[] = []
  private readonly focus = new THREE.Vector3()
  private started = false

  constructor(biome: string | undefined) {
    for (const kind of AMBIENT_KINDS[biome ?? ""] ?? []) this.swarms.push(this.createSwarm(kind))
    this.group.name = "ambient-life"
  }

  private createSwarm(kind: AmbientKind): Swarm {
    const n = kind.count
    const pos = new Float32Array(n * 3),
      size = new Float32Array(n),
      alpha = new Float32Array(n),
      tone = new Float32Array(n * 3)
    const color = new THREE.Color()
    for (let i = 0; i < n; i++) {
      color.setHex(kind.colors[i % kind.colors.length])
      tone.set([color.r, color.g, color.b], i * 3)
      size[i] = kind.size
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    geo.setAttribute("size", new THREE.BufferAttribute(size, 1))
    geo.setAttribute("alpha", new THREE.BufferAttribute(alpha, 1))
    geo.setAttribute("tone", new THREE.BufferAttribute(tone, 3))
    const material = new THREE.ShaderMaterial({
      uniforms: { tint: { value: new THREE.Color(1, 1, 1) }, opacity: { value: 1 } },
      transparent: true,
      depthWrite: false,
      ...shaders,
    })
    const points = new THREE.Points(geo, material)
    points.frustumCulled = false
    points.renderOrder = 5
    this.group.add(points)
    return { kind, points, material, pos, size, alpha, state: new Float32Array(n * S) }
  }

  /** A random spot in the box round the focus; over water if the kind wants it (null if none is found). */
  private spot(water: boolean | undefined): [number, number] | null {
    for (let k = 0; k < (water ? 40 : 1); k++) {
      const x = this.focus.x + (Math.random() - 0.5) * 2 * HALF,
        z = this.focus.z + (Math.random() - 0.5) * 2 * HALF
      if (!water || groundH(x, z) < WATER_Y - 0.08) return [x, z]
    }
    return null
  }

  private place(sw: Swarm, i: number, first: boolean): void {
    const k = sw.kind,
      st = sw.state,
      o = i * S
    st[o + 3] = Math.random() * Math.PI * 2
    st[o + 4] = 0.7 + Math.random() * 0.6
    st[o + 2] = k.y[0] + Math.random() * (k.y[1] - k.y[0])
    if (k.motion === "flock") {
      // a flock enters from upwind, after a while, so birds are seen now and then and not always
      const w = k.wind ?? [1, 0]
      const len = Math.hypot(w[0], w[1]) || 1
      const side = (Math.random() - 0.5) * 2 * HALF
      st[o] = this.focus.x - (w[0] / len) * HALF * 1.3 - (w[1] / len) * side
      st[o + 1] = this.focus.z - (w[1] / len) * HALF * 1.3 + (w[0] / len) * side
      st[o + 5] = first ? Math.random() * 6 : 6 + Math.random() * 18
      return
    }
    const at = this.spot(k.water)
    if (!at) {
      st[o + 5] = -1 // nothing here to settle on; look again later
      sw.alpha[i] = 0
      return
    }
    st[o] = st[o + 6] = at[0]
    st[o + 1] = st[o + 7] = at[1]
    st[o + 5] = k.motion === "drift" && k.water ? 6 + Math.random() * 8 : Math.random() * 2
    sw.pos[i * 3] = at[0]
    sw.pos[i * 3 + 2] = at[1]
    const g = Math.max(groundH(at[0], at[1]), k.water ? WATER_Y : -99)
    sw.pos[i * 3 + 1] = k.motion === "fall" ? g + (first ? st[o + 2] : k.y[1]) : g + st[o + 2]
  }

  /** Move the swarms on; `focus` is where the camera looks, `night` from 0 (day) to 1 (night). */
  update(inputProps: { dt: number; t: number; focus: THREE.Vector3; night: number }): void {
    if (!this.swarms.length) return
    const dt = Math.min(0.1, inputProps.dt),
      t = inputProps.t,
      night = inputProps.night
    this.focus.copy(inputProps.focus)
    const first = !this.started
    this.started = true
    for (const sw of this.swarms) {
      const k = sw.kind
      const seen = k.when === "day" ? 1 - night : k.when === "night" ? night : 1
      sw.material.uniforms.opacity.value = k.alpha * Math.min(1, seen * 1.5)
      sw.material.uniforms.tint.value.copy(view.tint)
      sw.points.visible = seen > 0.02
      if (first) for (let i = 0; i < k.count; i++) this.place(sw, i, true)
      if (!sw.points.visible) continue
      this.step(sw, dt, t)
      const geo = sw.points.geometry
      geo.attributes.position.needsUpdate = true
      geo.attributes.size.needsUpdate = true
      geo.attributes.alpha.needsUpdate = true
    }
  }

  private step(sw: Swarm, dt: number, t: number): void {
    const k = sw.kind,
      st = sw.state,
      p = sw.pos
    const wind = k.wind ?? [0, 0]
    if (k.motion === "flock") return this.stepFlock(sw, dt, t)
    for (let i = 0; i < k.count; i++) {
      const o = i * S,
        ph = st[o + 3],
        sp = st[o + 4]
      if (st[o + 5] < 0) {
        // waiting for water to come into view
        st[o + 5] += dt * 0.5
        if (st[o + 5] >= 0) this.place(sw, i, false)
        continue
      }
      // out of the box round the focus: take it away and bring it back in somewhere else
      if (Math.abs(st[o] - this.focus.x) > HALF || Math.abs(st[o + 1] - this.focus.z) > HALF) {
        this.place(sw, i, false)
        continue
      }
      if (k.motion === "flutter") {
        // the butterfly wanders about a spot that itself wanders, rising and dipping, wings beating
        st[o] += Math.sin(t * 0.21 + ph * 3) * 0.35 * dt * sp
        st[o + 1] += Math.cos(t * 0.17 + ph * 2) * 0.35 * dt * sp
        const x = st[o] + Math.sin(t * 1.3 * sp + ph) * 0.7 + Math.sin(t * 2.9 + ph * 2) * 0.2
        const z = st[o + 1] + Math.cos(t * 1.1 * sp + ph) * 0.6 + Math.cos(t * 3.3 + ph * 2) * 0.2
        p[i * 3] = x
        p[i * 3 + 2] = z
        p[i * 3 + 1] = Math.max(groundH(x, z), WATER_Y) + st[o + 2] + Math.sin(t * 2.3 + ph) * 0.18 + Math.abs(Math.sin(t * 9 + ph)) * 0.06
        sw.size[i] = Math.sin(t * 17 * sp + ph) > -0.2 ? k.size : 1
        sw.alpha[i] = 1
      } else if (k.motion === "dart") {
        // a dragonfly: still in the air, then a dart to a new place over the same water
        st[o + 5] -= dt
        if (st[o + 5] <= 0) {
          const a = Math.random() * Math.PI * 2,
            d = 0.4 + Math.random() * 1.2
          const tx = st[o] + Math.cos(a) * d,
            tz = st[o + 1] + Math.sin(a) * d
          if (groundH(tx, tz) < WATER_Y - 0.02) {
            st[o + 6] = tx
            st[o + 7] = tz
          }
          st[o + 5] = 0.5 + Math.random() * 2
        }
        const f = Math.min(1, dt * 9)
        p[i * 3] += (st[o + 6] - p[i * 3]) * f
        p[i * 3 + 2] += (st[o + 7] - p[i * 3 + 2]) * f
        p[i * 3 + 1] = WATER_Y + st[o + 2] + Math.sin(t * 5 + ph) * 0.03
        sw.alpha[i] = 1
      } else if (k.motion === "fall") {
        // a leaf comes down slowly, swinging from side to side, flat then edge-on
        p[i * 3 + 1] -= 0.35 * sp * dt
        p[i * 3] += (Math.sin(t * 1.9 * sp + ph) * 0.6 + wind[0]) * dt
        p[i * 3 + 2] += (Math.cos(t * 1.5 * sp + ph) * 0.4 + wind[1]) * dt
        st[o] = p[i * 3]
        st[o + 1] = p[i * 3 + 2]
        sw.size[i] = Math.sin(t * 6 * sp + ph) > 0 ? k.size : 1
        const g = groundH(p[i * 3], p[i * 3 + 2])
        // a moment lying on the ground, then gone
        sw.alpha[i] = p[i * 3 + 1] > g ? 1 : Math.max(0, 1 + (p[i * 3 + 1] - g) * 3)
        if (p[i * 3 + 1] < g - 0.35) this.place(sw, i, false)
      } else if (k.motion === "drift") {
        // carried on the wind, lifting and dropping a little; mist fades in and out where it lies
        p[i * 3] += wind[0] * sp * dt
        p[i * 3 + 2] += wind[1] * sp * dt + Math.sin(t * 0.7 + ph) * 0.05 * dt
        st[o] = p[i * 3]
        st[o + 1] = p[i * 3 + 2]
        const g = Math.max(groundH(p[i * 3], p[i * 3 + 2]), k.water ? WATER_Y : -99)
        p[i * 3 + 1] = g + st[o + 2] + Math.sin(t * 1.3 * sp + ph) * 0.12 * (k.y[1] - k.y[0] + 0.2)
        if (k.water) {
          st[o + 5] -= dt
          const life = st[o + 5]
          sw.alpha[i] = Math.max(0, Math.min(1, life / 2, (14 - life) / 3))
          if (life <= 0) this.place(sw, i, false)
        } else sw.alpha[i] = 1
      } else if (k.motion === "glint") {
        // a crystal in the crust catching the light, then not
        const s = Math.sin(t * 0.9 * sp + ph * 7)
        sw.alpha[i] = s > 0.93 ? 1 : 0
        sw.size[i] = s > 0.985 ? k.size + 1 : k.size
        p[i * 3 + 1] = groundH(st[o], st[o + 1]) + st[o + 2]
      }
    }
  }

  /** The birds fly as one flock in a loose V behind the first, beating their wings and gliding. */
  private stepFlock(sw: Swarm, dt: number, t: number): void {
    const k = sw.kind,
      st = sw.state,
      p = sw.pos
    const wind = k.wind ?? [1, 0]
    const len = Math.hypot(wind[0], wind[1]) || 1
    // the flock is placed and timed by its first bird; the rest keep their places behind it
    if (st[5] > 0) {
      st[5] -= dt
      sw.alpha.fill(0)
      return
    }
    st[0] += wind[0] * dt
    st[1] += wind[1] * dt
    if (Math.hypot(st[0] - this.focus.x, st[1] - this.focus.z) > HALF * 1.5) return this.place(sw, 0, false)
    const lx = st[0],
      lz = st[1]
    const fx = wind[0] / len,
      fz = wind[1] / len
    for (let j = 0; j < k.count; j++) {
      const rank = Math.ceil(j / 2),
        side = j % 2 ? 1 : -1
      const back = rank * 0.45,
        across = rank * 0.38 * side + Math.sin(t * 0.8 + j) * 0.06
      p[j * 3] = lx - fx * back - fz * across
      p[j * 3 + 2] = lz - fz * back + fx * across
      p[j * 3 + 1] = this.focus.y + st[2] + Math.sin(t * 0.6 + j * 0.7) * 0.1
      const flapping = Math.sin(t * 0.45 + st[3]) > -0.3
      sw.size[j] = flapping && Math.sin(t * 11 + j * 1.3) > 0 ? k.size + 1 : k.size
      sw.alpha[j] = 1
    }
  }

  dispose(): void {
    for (const sw of this.swarms) {
      sw.points.geometry.dispose()
      sw.material.dispose()
    }
  }
}
