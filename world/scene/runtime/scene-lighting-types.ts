import type { Color } from "three"

export type SceneLight = Readonly<{
  sun: number
  sunIntensity: number
  hemi: number
  groundColor: number
  hemisphereIntensity: number
  sky: number
  tint: number
  glow: number
  night: number
  azimuth: number
  elevation: number
}>
export type SceneWaterUniforms = { sky: { value: Color }; t: { value: number } }
