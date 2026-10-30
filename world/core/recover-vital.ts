import { REGEN_MS } from "#/world/core/player-rules"

type Props = { value: number; at: number; maximum: number; perTick: number; sitting: boolean; focus: boolean; focusAt: number; focusUntil: number; now: number }

/** 回復時刻の境界と食事の有効区間を、HP と SP で同じ規則から数える。 */
export function recoverVital(props: Props): [number, number] {
  if (!props.at || props.value >= props.maximum) return [Math.min(props.value, props.maximum), props.now]
  const ticks = Math.floor(Math.max(0, props.now - props.at) / REGEN_MS)
  if (!ticks) return [props.value, props.at]
  const first = Math.max(1, Math.floor((props.focusAt - props.at) / REGEN_MS) + 1)
  const last = Math.min(ticks, Math.ceil((props.focusUntil - props.at) / REGEN_MS) - 1)
  const extra = props.focus ? Math.max(0, last - first + 1) : 0
  const next = Math.min(props.maximum, props.value + ticks * props.perTick * (props.sitting ? 2 : 1) + extra)

  return [next, next >= props.maximum ? props.now : props.at + ticks * REGEN_MS]
}
