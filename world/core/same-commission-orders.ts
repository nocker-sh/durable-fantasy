import type { Order } from "#/world/core/commission-types"

/** A queue slot is collectable only while the displayed queue still matches the stored orders. */
export function sameCommissionOrders(first: readonly Order[], second: readonly Order[]): boolean {
  return first.length === second.length && first.every((order, index) => order.commission === second[index].commission && order.readyAt === second[index].readyAt && order.q === second[index].q)
}
