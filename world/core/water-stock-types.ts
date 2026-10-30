export type WaterPurpose = "drinking" | "cooking"
export type WaterStock = Readonly<{
  limitMl: number
  initialMl: number
  volumeMl: number
  receivedMl: number
  usedMl: Readonly<Record<WaterPurpose, number>>
  discardedMl: number
  phase: "stored" | "outbound" | "at_source" | "inbound" | "maintenance"
}>
export type WaterVesselMovement = Readonly<{ type: "leave_for_source" | "arrive_at_source" | "leave_source" | "return_home" | "begin_maintenance" | "end_maintenance" }>
export type WaterWithdrawal = Readonly<{ type: "use"; purpose: WaterPurpose; amountMl: number }> | Readonly<{ type: "discard"; amountMl: number }>
export type WaterStockCommand = WaterVesselMovement | WaterWithdrawal | Readonly<{ type: "fill"; amountMl: number }>
