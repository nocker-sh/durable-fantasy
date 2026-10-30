export type WindmillSurface = Readonly<{
  scope: "road_profile_blend"
  level_bounds: readonly [number, number, number, number]
  blend_bounds: readonly [number, number, number, number]
  start_x: number
  road_x: number
  elevation_m: number
  metres_per_tile: number
  blend_length_m: number
  maximum_longitudinal_grade: number
}>
