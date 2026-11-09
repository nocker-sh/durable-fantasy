type Props = {
  diameter: number
  height: number
  innerDiameter: number
  usableDepth: number
  base: number
  lid: number
  knobHeight: number
  knobRadius: number
  handles: { gap: number; openingHeight: number; radius: number; centreHeight: number }
}

/** A hollow cylinder closes with a seated lid; both loops join the wall without entering the water cavity. */
export function getWaterVesselProfile(props: Props) {
  if (
    ![props.diameter, props.height, props.innerDiameter, props.usableDepth, props.base, props.lid, props.knobHeight, props.knobRadius, ...Object.values(props.handles)].every(
      (value) => Number.isFinite(value) && value > 0,
    )
  )
    return new Error("Invalid water vessel construction")
  const radius = props.diameter / 2,
    innerRadius = props.innerDiameter / 2,
    wall = radius - innerRadius
  const lidTop = props.height - props.knobHeight,
    rim = lidTop - props.lid,
    span = props.handles.openingHeight / 2 + props.handles.radius
  if (wall <= 0 || props.knobRadius >= radius || Math.abs(props.base + props.usableDepth - rim) > 1e-9) return new Error("Water vessel cavity, base and lid do not fit")
  if (props.handles.radius >= innerRadius || props.handles.centreHeight - span - props.handles.radius <= props.base || props.handles.centreHeight + span + props.handles.radius >= rim)
    return new Error("Water vessel handles cross its base or lid")
  const outerBar = radius + props.handles.gap + props.handles.radius,
    root = innerRadius + props.handles.radius
  if (root >= outerBar || ![outerBar, root, rim, lidTop].every(Number.isFinite)) return new Error("Invalid water vessel handle span")

  const capacityLitres = Math.PI * innerRadius * innerRadius * props.usableDepth * 1000
  if (!Number.isFinite(capacityLitres) || capacityLitres <= 0) return new Error("Unbounded water vessel cavity")

  return {
    radius,
    innerRadius,
    rim,
    lidTop,
    base: props.base,
    height: props.height,
    knobRadius: props.knobRadius,
    handle: { outerBar, root, span, radius: props.handles.radius, height: props.handles.centreHeight },
    halfWidth: outerBar + props.handles.radius,
    capacityLitres,
  }
}
