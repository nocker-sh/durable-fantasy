import { Color } from "three"
import type { SceneLight } from "#/world/scene/runtime/scene-lighting-types"

/** 色は描画器の色空間で、強度と方向は数値として同じ割合で混ぜる。 */
export function mixSceneLight(a: SceneLight, b: SceneLight, blend: number): SceneLight {
  const color = (x: number, y: number) => new Color(x).lerp(new Color(y), blend).getHex()
  const number = (x: number, y: number) => x + (y - x) * blend
  return {
    sun: color(a.sun, b.sun),
    sunIntensity: number(a.sunIntensity, b.sunIntensity),
    hemi: color(a.hemi, b.hemi),
    groundColor: color(a.groundColor, b.groundColor),
    hemisphereIntensity: number(a.hemisphereIntensity, b.hemisphereIntensity),
    sky: color(a.sky, b.sky),
    tint: color(a.tint, b.tint),
    glow: number(a.glow, b.glow),
    night: number(a.night, b.night),
    azimuth: number(a.azimuth, b.azimuth),
    elevation: number(a.elevation, b.elevation),
  }
}
