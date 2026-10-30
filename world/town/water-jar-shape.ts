type Profile = ReadonlyArray<readonly [number, number]>

/** Radius and height relative to the footprint's shorter side; the open cavity and seated lid share the rim elevation. */
export const WATER_JAR_SHAPE: ReadonlyArray<Readonly<{ name: "body" | "lid"; profile: Profile }>> = [
  {
    name: "body",
    profile: [
      [0, 0],
      [0.28, 0],
      [0.31, 0.04],
      [0.43, 0.18],
      [0.47, 0.5],
      [0.42, 0.8],
      [0.32, 1],
      [0.32, 1.06],
      [0.28, 1.06],
      [0.28, 1],
      [0.38, 0.79],
      [0.43, 0.5],
      [0.39, 0.2],
      [0.28, 0.08],
      [0, 0.08],
      [0, 0],
    ],
  },
  {
    name: "lid",
    profile: [
      [0, 1.06],
      [0.35, 1.06],
      [0.35, 1.1],
      [0.1, 1.13],
      [0.07, 1.13],
      [0.07, 1.21],
      [0, 1.21],
      [0, 1.06],
    ],
  },
]
