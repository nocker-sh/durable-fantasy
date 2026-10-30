import type { StockLockState } from "#/world/town/stock-lock-schemas"

/** Both gates face towards the pasture; the vestibule is the shared inward/outward side between them. */
export function getStockLockGateSides(gate: "outer" | "inner"): Readonly<{ outward: StockLockState["operator"]; inward: StockLockState["operator"] }> {
  if (gate === "outer") return { outward: "outside", inward: "vestibule" }

  return { outward: "vestibule", inward: "pasture" }
}
