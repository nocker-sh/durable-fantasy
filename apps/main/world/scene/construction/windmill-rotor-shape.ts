type BoxPart = Readonly<{ size: readonly [number, number, number]; centre: readonly [number, number, number] }>
type PlanePart = Readonly<{ size: readonly [number, number]; centre: readonly [number, number, number] }>

/** Renderer units, relative to the tower base; authoring converts them with the shared metre scale. */
export const WINDMILL_ROTOR_SHAPE: Readonly<{
  hub: readonly [number, number, number]
  beam: BoxPart
  sail: PlanePart
  arms: number
  angularSpeed: number
}> = {
  hub: [0, 4.3, 1.15],
  beam: { size: [0.08, 3.2, 0.06], centre: [0, 1.6, 0] },
  sail: { size: [0.7, 2.5], centre: [0.4, 1.9, 0.02] },
  arms: 4,
  angularSpeed: 0.5,
}
