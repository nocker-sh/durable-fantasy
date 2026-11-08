import { getStockLockGateSides } from "#/world/town/get-stock-lock-gate-sides"
import type { StockLockState, StockLockEvent } from "#/world/town/stock-lock-schemas"
type Props = Readonly<{ state: Readonly<StockLockState>; event: Extract<StockLockEvent, { kind: "gate" }> }>

/** An opening push and a backing-out close cross the gate during its rotation; pulling keeps the operator on the inward side. */
export function withStockLockGateMotion(props: Props): StockLockState | Error {
  const next = { ...structuredClone(props.state) },
    event = props.event,
    motion = event.motion
  if (!motion) return next
  const sides = getStockLockGateSides(event.gate)
  if (((motion === "push_open" || motion === "pull_open") && event.action !== "open") || ((motion === "pull_close" || motion === "back_out_close") && event.action !== "close"))
    return new Error("Stock gate motion disagrees with its action")
  if (motion === "push_open") {
    if (next.operator !== sides.outward) return new Error("Push must start on the outward gate side")
    next.operator = sides.inward
    return next
  }
  if (next.operator !== sides.inward) return new Error("Pulling or backing out must start on the inward gate side")
  if (motion === "back_out_close") next.operator = sides.outward

  return next
}
