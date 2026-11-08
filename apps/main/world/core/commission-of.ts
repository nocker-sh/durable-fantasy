import { COMMISSIONS } from "#/world/core/commissions"
export function commissionOf(id: string) {
  return COMMISSIONS.find((commission) => commission.id === id)
}
