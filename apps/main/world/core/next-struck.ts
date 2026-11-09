type Props = Readonly<{ delay: number; struck?: number; now: number }>

/**
 * The beat a blow is counted at. A blow let in early (is-attack-cooling-down.ts forgives network
 * jitter) is counted at the full interval after the last one, so the allowance never adds up into
 * faster swinging; a late blow starts the beat afresh.
 */
export function nextStruck(props: Props): number {
  return props.struck === undefined ? props.now : Math.max(props.now, props.struck + props.delay)
}
