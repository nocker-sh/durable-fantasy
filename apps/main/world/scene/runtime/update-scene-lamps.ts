import { lampLit } from "#/world/town/lamp-lit"
import type { lamps } from "#/world/scene/construction/registry"

/** 衛兵が通る順の番号で点灯し、炎の揺れだけをフレームの時刻で動かす。 */
export function updateSceneLamps(lampOrder: Readonly<typeof lamps>, minute: number, time: number): void {
  lampOrder.forEach((lamp, index) => {
    const isOn = lampLit(index, minute)
    const flicker = 0.85 + Math.sin(time * 11 + lamp.x) * 0.08
    lamp.light.intensity = isOn ? 1.9 * flicker : 0
    lamp.glow.emissiveIntensity = isOn ? 1.6 : 0
  })
}
