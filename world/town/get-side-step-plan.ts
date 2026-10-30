import { getCarryStepDirection } from "#/world/town/get-carry-step-direction"
type Props = { from: readonly [number, number]; to: readonly [number, number]; turn: number; maxStride: number }
export type SideStepPlan = Readonly<{ from: readonly [number, number]; to: readonly [number, number]; direction: "left" | "right"; cycles: number; stride: number }>
/** Distribute the distance across complete cycles, avoiding a partial final step or a tiny leftover shuffle. */
export function getSideStepPlan(props: Props): SideStepPlan | Error {
  const direction = getCarryStepDirection(props)
  if (direction instanceof Error) return direction
  if (direction !== "side_left" && direction !== "side_right") return new Error("Side-step plan needs lateral movement")
  if (!Number.isFinite(props.maxStride) || props.maxStride <= 0) return new Error("Invalid maximum side-step stride")
  const distance = Math.hypot(props.to[0] - props.from[0], props.to[1] - props.from[1]),
    minimumCycles = Math.ceil(distance / props.maxStride)
  const cycles = distance / minimumCycles > props.maxStride ? minimumCycles + 1 : minimumCycles
  if (!Number.isFinite(distance) || !Number.isSafeInteger(cycles) || cycles < 1 || cycles > 65536) return new Error("Side-step plan exceeds its cycle budget")
  return { from: [...props.from], to: [...props.to], direction: direction === "side_left" ? "left" : "right", cycles, stride: distance / cycles }
}
