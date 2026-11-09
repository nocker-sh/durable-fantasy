import type { ExchangeClaims } from "#/world/core/exchange-claim-types"
export function emptyClaims(): ExchangeClaims {
  return { claimSerial: 0, claims: {} }
}
