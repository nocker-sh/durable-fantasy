import type { ConeLocalRay as Props } from "./cone-ray-types"

/** 側面の二根を近い順に調べ、実際の高さと正の半径の範囲だけを描く。 */
export function getConeSideIntersection(ray: Props): number {
  const a = ray.directionX * ray.directionX + ray.directionY * ray.directionY - ray.slope * ray.slope * ray.directionZ * ray.directionZ
  const radius = ray.radius + ray.slope * ray.originZ
  const b = 2 * (ray.originX * ray.directionX + ray.originY * ray.directionY - radius * ray.slope * ray.directionZ)
  const c = ray.originX * ray.originX + ray.originY * ray.originY - radius * radius
  const discriminant = b * b - 4 * a * c
  if (!(discriminant >= 0 && Math.abs(a) > 1e-9)) return -1

  const squareRoot = Math.sqrt(discriminant)
  const first = (-b - squareRoot) / (2 * a)
  const second = (-b + squareRoot) / (2 * a)
  const roots = first > second ? [second, first] : [first, second]
  for (const distance of roots) {
    const height = ray.originZ + distance * ray.directionZ
    if (distance > 0 && height >= 0 && height <= ray.height && ray.radius + ray.slope * height > 0) return distance
  }
  return -1
}
