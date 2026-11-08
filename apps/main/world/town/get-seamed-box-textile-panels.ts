type Props = Readonly<{ size: readonly [number, number, number]; seamAllowance: number }>

/** Six flat faces preserve the filled envelope; seam stock is extra cloth, not a certificate of stuffing or seam construction. */
export function getSeamedBoxTextilePanels(props: Props) {
  if (!props.size.every((value) => Number.isFinite(value) && value > 0) || !Number.isFinite(props.seamAllowance) || props.seamAllowance <= 0) return new Error("Invalid seamed textile dimensions")
  const faces = [
    { face: "top", dimensions: [props.size[0], props.size[2]] },
    { face: "bottom", dimensions: [props.size[0], props.size[2]] },
    { face: "north", dimensions: [props.size[0], props.size[1]] },
    { face: "south", dimensions: [props.size[0], props.size[1]] },
    { face: "west", dimensions: [props.size[2], props.size[1]] },
    { face: "east", dimensions: [props.size[2], props.size[1]] },
  ]
  const panels = faces.map((face) => ({ face: face.face, size: [face.dimensions[0] + 2 * props.seamAllowance, face.dimensions[1] + 2 * props.seamAllowance] satisfies readonly [number, number] }))
  if (panels.some((panel, index) => panel.size.some((value, axis) => !Number.isFinite(value) || value <= faces[index].dimensions[axis]))) return new Error("Unbounded or lost textile seam allowance")

  return panels
}
