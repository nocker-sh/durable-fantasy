import type { ConeLocalRay as Props } from "./cone-ray-types"

export function getConeTopIntersection(ray: Props): number {
  if (!(Math.abs(ray.directionZ) > 1e-6)) return -1
  const distance = (ray.height - ray.originZ) / ray.directionZ
  const x = ray.originX + distance * ray.directionX
  const y = ray.originY + distance * ray.directionY
  if (distance > 0 && x * x + y * y <= ray.endRadius * ray.endRadius) return distance
  return -1
}
