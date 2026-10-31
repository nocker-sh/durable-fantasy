import type { SceneLight } from "#/world/scene/runtime/scene-lighting-types"

/** 昼・夕・夜の色と強度。時刻の混合は get-scene-light.ts が行う。 */
export const SCENE_LIGHT_PALETTES = [
  { sun: 0xfff2d8, sunIntensity: 2.6, hemi: 0xfff6e8, groundColor: 0x585068, hemisphereIntensity: 1.5, sky: 0x9ec4d8, tint: 0xffffff, glow: 0, night: 0, azimuth: 0.9, elevation: 1.0 },
  { sun: 0xffb070, sunIntensity: 2.2, hemi: 0xffd0a8, groundColor: 0x4a3a58, hemisphereIntensity: 1.1, sky: 0xe8a878, tint: 0xf0c8a0, glow: 0.7, night: 0.35, azimuth: 2.2, elevation: 0.42 },
  { sun: 0x7088c0, sunIntensity: 0.7, hemi: 0x6878b0, groundColor: 0x22203a, hemisphereIntensity: 0.8, sky: 0x1a2038, tint: 0x6a74a0, glow: 1.6, night: 1, azimuth: 2.8, elevation: 0.9 },
] satisfies ReadonlyArray<SceneLight>
