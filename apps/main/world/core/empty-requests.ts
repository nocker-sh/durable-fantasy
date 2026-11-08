import type { OrderRequests } from "#/world/core/exchange-order-types"
export function emptyRequests(): OrderRequests {
  return { serial: 0, jobs: {} }
}
