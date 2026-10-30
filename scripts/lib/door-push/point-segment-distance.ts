export const pointSegmentDistance = (point: number[], end: number[]) => {
  const lengthSquared = end[0] ** 2 + end[1] ** 2
  const t = Math.max(0, Math.min(1, (point[0] * end[0] + point[1] * end[1]) / lengthSquared))
  return Math.hypot(point[0] - t * end[0], point[1] - t * end[1])
}
