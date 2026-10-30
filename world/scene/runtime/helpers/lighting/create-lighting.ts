import * as THREE from "three"
import { N } from "#/world/scene/world"
import { litSprites } from "#/world/scene/gfx"
import { glowMats, fireLights, houseGlows, houseShutters, lamps } from "#/world/scene/construction/registry"
import { daylight } from "#/world/core/daylight"
import { dusk } from "#/world/core/dusk"
import { lampLit } from "#/world/town/lamp-lit"
import { shuttersShut } from "#/world/town/shutters-shut"
import { windowsLit } from "#/world/town/windows-lit"
import { roomInUse } from "#/world/town/room-in-use"
import { HOUSES } from "#/world/town/houses"
import { view } from "#/world/scene/actors"
import type { SceneDefinition } from "#/world/scene/runtime/definitions"
import type { SceneEnvironment } from "#/world/scene/runtime/lighting"

type Props = {
  scene: THREE.Scene
  world: SceneDefinition
  wm: THREE.ShaderMaterial
  applySchedule: (min: number) => void
  environment: SceneEnvironment
}

export function createLighting(props: Props) {
  const hemiSource = props.environment,
    hemi = hemiSource.hemi,
    sun = hemiSource.sun,
    puffs = hemiSource.puffs,
    smoke = hemiSource.smoke
  const TOD = [
    { sun: 0xfff2d8, si: 2.6, hemi: 0xfff6e8, hg: 0x585068, hi: 1.5, sky: 0x9ec4d8, tint: 0xffffff, glow: 0, night: 0, az: 0.9, el: 1.0 },
    { sun: 0xffb070, si: 2.2, hemi: 0xffd0a8, hg: 0x4a3a58, hi: 1.1, sky: 0xe8a878, tint: 0xf0c8a0, glow: 0.7, night: 0.35, az: 2.2, el: 0.42 },
    { sun: 0x7088c0, si: 0.7, hemi: 0x6878b0, hg: 0x22203a, hi: 0.8, sky: 0x1a2038, tint: 0x6a74a0, glow: 1.6, night: 1, az: 2.8, el: 0.9 },
  ]
  // the light follows the clock (game-system.md §7.5): night, day and dusk blended by the hour
  const mixT = (a: (typeof TOD)[number], b: (typeof TOD)[number], t: number) => {
    const c = (x: number, y: number) => new THREE.Color(x).lerp(new THREE.Color(y), t).getHex()
    const n = (x: number, y: number) => x + (y - x) * t
    return {
      sun: c(a.sun, b.sun),
      si: n(a.si, b.si),
      hemi: c(a.hemi, b.hemi),
      hg: c(a.hg, b.hg),
      hi: n(a.hi, b.hi),
      sky: c(a.sky, b.sky),
      tint: c(a.tint, b.tint),
      glow: n(a.glow, b.glow),
      night: n(a.night, b.night),
      az: n(a.az, b.az),
      el: n(a.el, b.el),
    }
  }
  type Light = ReturnType<typeof mixT>
  const asLight = (t: (typeof TOD)[number]): Light => mixT(t, t, 0)
  const clockMin = { value: 12 * 60 }
  const light: { value: Light } = { value: asLight(TOD[0]) }
  // lamps in the order the guard walks: along the street from one end
  const lampOrder = [...lamps].sort((p, q) => p.x + p.z * 0.3 - (q.x + q.z * 0.3))
  const houseOf = new Map(HOUSES.map((h) => [h.id, h]))
  const activeRoomLights = new Set<THREE.PointLight>()
  function setClock(min: number) {
    clockMin.value = ((min % 1440) + 1440) % 1440
    const d = daylight(clockMin.value),
      r = dusk(clockMin.value)
    const T = (light.value = mixT(mixT(TOD[2], TOD[0], d), TOD[1], r * 0.85))
    sun.color.set(T.sun)
    sun.intensity = T.si
    hemi.color.set(T.hemi)
    hemi.groundColor.set(T.hg)
    hemi.intensity = T.hi
    props.scene.background = new THREE.Color(props.world.indoor ? 0x0c0a10 : T.sky)
    const fog = props.world.layout.fog
    props.scene.fog = props.world.indoor ? null : fog ? new THREE.Fog(new THREE.Color(fog.color).lerp(new THREE.Color(T.sky), 0.35 + (1 - d) * 0.5), fog.near, fog.far) : new THREE.Fog(T.sky, 30, 60)
    if (fog && !props.world.indoor) props.scene.background = (props.scene.fog as THREE.Fog).color.clone()
    if (props.world.indoor) {
      // under a roof: the sun only through the windows, the lamp and hearth do the rest
      sun.intensity = T.si * 0.25
      sun.color.set(0xffe8c8)
      hemi.color.set(0xffe2c0)
      hemi.groundColor.set(0x3a2c28)
      hemi.intensity = 0.75 + T.hi * 0.15
      glowMats.forEach((m) => (m.emissiveIntensity = 0.15 + d * 0.9)) // the windows show the light outside
    } else glowMats.forEach((m) => (m.emissiveIntensity = T.glow))
    props.applySchedule(clockMin.value)
    activeRoomLights.clear()
    const usedRooms = new Map<string, boolean>()
    for (const fixture of fireLights)
      if (fixture.room) {
        const houseSource = fixture.room,
          house = houseSource.house,
          floor = houseSource.floor,
          key = `${house}/${floor}`,
          h = houseOf.get(house)
        if (!usedRooms.has(key)) usedRooms.set(key, !!h && roomInUse(h, floor, clockMin.value))
        const active = usedRooms.get(key)!
        if (active) activeRoomLights.add(fixture.light)
        if (fixture.glow) fixture.glow.emissiveIntensity = active ? 1.2 : 0
      }
    // each house's windows by its own hours
    for (const g of houseGlows) {
      const h = houseOf.get(g.house)
      g.mat.emissiveIntensity = h && windowsLit(h, clockMin.value, g.floor) ? 0.9 + (1 - d) * 0.7 : 0
    }
    // and shuts its shutters while it sleeps by day
    const shut = new Map<string, boolean>()
    for (const s of houseShutters) {
      const k = { value: shut.get(s.house) }
      if (k.value === undefined) {
        const h = houseOf.get(s.house)
        shut.set(s.house, (k.value = !!h && shuttersShut(h, clockMin.value)))
      }
      s.mat.map = k.value ? s.shut : s.open
    }
    view.tint.set(T.tint)
    for (const m of litSprites) m.color.copy(view.tint)
    sun.position.set(N / 2 + Math.cos(T.az) * 30 * Math.cos(T.el), Math.sin(T.el) * 30, N / 2 + Math.sin(T.az) * 30 * Math.cos(T.el))
    ;(props.wm.uniforms.sky.value as THREE.Color).set(T.sky).lerp(new THREE.Color(0xffffff), 0.35)
  }
  /** The three fixed looks the debug panel offers: noon, dusk, night. */
  function setTod(k: number) {
    setClock([12 * 60, 16 * 60 + 45, 22 * 60][((k % 3) + 3) % 3])
  }
  setClock(clockMin.value)
  function animate(dt: number, t: number) {
    fireLights.forEach((f) => {
      const flick = 0.75 + Math.sin(t * 13 + f.seed) * 0.12 + Math.sin(t * 29 + f.seed * 3) * 0.08
      f.light.intensity = f.room && !activeRoomLights.has(f.light) ? 0 : f.base > 0 ? f.base * flick : -f.base * light.value.night * flick
    })
    lampOrder.forEach((l, i) => {
      const on = lampLit(i, clockMin.value)
      const flick = 0.85 + Math.sin(t * 11 + l.x) * 0.08
      l.light.intensity = on ? 1.9 * flick : 0
      l.glow.emissiveIntensity = on ? 1.6 : 0
    })
    puffs.forEach((p, index) => {
      p.age += dt
      if (p.age > p.life) p.age -= p.life
      const k = p.age / p.life
      smoke.set({
        index: index,
        x: p.o.x + k * k * 1.6 * p.vx * 6 + Math.sin(p.age * 2 + p.o.x) * 0.08,
        y: p.o.y + k * 2.6,
        z: p.o.z - k * k * 0.6,
        size: 0.18 + k * 0.5,
        opacity: (1 - k) * 0.5 * Math.min(1, k * 8),
      })
    })
    props.wm.uniforms.t.value = t
  }
  return {
    setClock,
    setTod,
    animate,
    get minutes() {
      return clockMin.value
    },
  }
}
