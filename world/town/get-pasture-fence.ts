type Props = Readonly<{ x0: number; z0: number; x1: number; z1: number }>

/** The native pasture and its inspection share the same west opening; a permanent gap is not a latched livestock gate. */
export function getPastureFence(bounds: Props) {
  const points: [number, number][] = [
    [bounds.x0, bounds.z0],
    [bounds.x1, bounds.z0],
    [bounds.x1, bounds.z1],
    [bounds.x0, bounds.z1],
    [bounds.x0, bounds.z0],
  ]
  const gaps: [number, number][] = [[bounds.x0, bounds.z0 + 0.7]]

  return { points, gaps, height: 0.75, outside: [bounds.x0 - 0.5, bounds.z0 + 0.7] satisfies [number, number] }
}
