type Props = Readonly<{ delay: number; struck?: number; now: number }>

export function isAttackCoolingDown(props: Props): boolean {
  return props.struck !== undefined && props.now - props.struck < props.delay * 0.85
}
