type Box = Readonly<{ name: string; material: "wood" | "woodV" | "woodDark" | "iron"; bounds: readonly [number, number, number, number, number, number] }>

/** A unit-width empty cart. North is the shaft end; the axle, bearers and parking legs connect to the bed and shafts. */
export const PARKED_CART_SHAPE: Readonly<{
  width: number
  length: number
  boxes: ReadonlyArray<Box>
  wheel: Readonly<{
    x: number
    y: number
    z: number
    radius: number
    rim: number
    hubRadius: number
    hubWidth: number
    spokeThickness: number
    spokeLength: number
    spokeRadius: number
    spokes: number
  }>
}> = {
  width: 1,
  length: 1.9,
  boxes: [
    { name: "bed", material: "wood", bounds: [-0.36, 0.47, -0.3, 0.36, 0.55, 0.8] },
    { name: "side-left", material: "woodV", bounds: [-0.36, 0.55, -0.3, -0.32, 0.84, 0.8] },
    { name: "side-right", material: "woodV", bounds: [0.32, 0.55, -0.3, 0.36, 0.84, 0.8] },
    { name: "front-board", material: "woodV", bounds: [-0.36, 0.55, -0.3, 0.36, 0.84, -0.26] },
    { name: "rear-board", material: "woodV", bounds: [-0.36, 0.55, 0.76, 0.36, 0.84, 0.8] },
    { name: "shaft-left", material: "woodDark", bounds: [-0.24, 0.44, -0.95, -0.18, 0.5, 0.52] },
    { name: "shaft-right", material: "woodDark", bounds: [0.18, 0.44, -0.95, 0.24, 0.5, 0.52] },
    { name: "leg-left", material: "woodDark", bounds: [-0.24, 0, -0.48, -0.18, 0.47, -0.42] },
    { name: "leg-right", material: "woodDark", bounds: [0.18, 0, -0.48, 0.24, 0.47, -0.42] },
    { name: "bearer-left", material: "woodDark", bounds: [-0.29, 0.285, 0.38, -0.19, 0.5, 0.52] },
    { name: "bearer-right", material: "woodDark", bounds: [0.19, 0.285, 0.38, 0.29, 0.5, 0.52] },
    { name: "axle", material: "iron", bounds: [-0.48, 0.285, 0.415, 0.48, 0.355, 0.485] },
  ],
  wheel: { x: 0.43, y: 0.32, z: 0.45, radius: 0.32, rim: 0.035, hubRadius: 0.075, hubWidth: 0.1, spokeThickness: 0.035, spokeLength: 0.22, spokeRadius: 0.16, spokes: 8 },
}
