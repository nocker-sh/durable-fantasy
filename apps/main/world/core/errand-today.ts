import { getErrandRequests } from "#/world/core/get-errand-requests"
import type { Errand } from "#/world/core/errand-types"

/** 指定の日に、その住民が出している依頼を返す。 */
export function errandToday(from: string, day: string): Errand | undefined {
  return getErrandRequests(day).get(from)
}
