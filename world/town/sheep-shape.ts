type Box = Readonly<{ dimensions: readonly [number, number, number]; position: readonly [number, number, number]; color: number }>

/** Native scene units, before the animal's spawn scale; construction order and every eye and hoof are retained. */
export const SHEEP_SHAPE: Readonly<{
  wool: Readonly<{ radius: number; detail: number; scale: readonly [number, number, number]; position: readonly [number, number, number] }>
  boxes: ReadonlyArray<Box>
}> = {
  wool: { radius: 0.34, detail: 1, scale: [1, 0.85, 1.35], position: [0, 0.45, 0] },
  boxes: [
    { dimensions: [0.18, 0.22, 0.26], position: [0, 0.55, 0.48], color: 0x2e2830 },
    { dimensions: [0.03, 0.03, 0.02], position: [-0.06, 0.6, 0.61], color: 0xe8e0c8 },
    { dimensions: [0.03, 0.03, 0.02], position: [0.06, 0.6, 0.61], color: 0xe8e0c8 },
    { dimensions: [0.06, 0.26, 0.06], position: [-0.13, 0.13, -0.22], color: 0x2e2830 },
    { dimensions: [0.06, 0.26, 0.06], position: [0.13, 0.13, -0.22], color: 0x2e2830 },
    { dimensions: [0.06, 0.26, 0.06], position: [-0.13, 0.13, 0.22], color: 0x2e2830 },
    { dimensions: [0.06, 0.26, 0.06], position: [0.13, 0.13, 0.22], color: 0x2e2830 },
  ],
}
