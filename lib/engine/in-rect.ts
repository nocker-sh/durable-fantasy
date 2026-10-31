type Props = {
  x: number
  z: number
  r: { x0: number; z0: number; x1: number; z1: number }
  pad?: number
}

export const inRect = (props: Props) => {
  const pad = props.pad === undefined ? 0 : props.pad
  return props.x >= props.r.x0 - pad && props.x < props.r.x1 + pad && props.z >= props.r.z0 - pad && props.z < props.r.z1 + pad
}
