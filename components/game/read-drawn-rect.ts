type Props = Readonly<{
  canvas: Readonly<{ width: number; height: number; clientWidth: number; clientHeight: number }>
  element: Readonly<{ offsetLeft: number; offsetTop: number; offsetWidth: number; offsetHeight: number }>
}>

/** CSS が決めた子の位置と大きさを、canvas の画素へ直す。 */
export function readDrawnRect(props: Props) {
  const scaleX = props.canvas.clientWidth > 0 ? props.canvas.width / props.canvas.clientWidth : 1
  const scaleY = props.canvas.clientHeight > 0 ? props.canvas.height / props.canvas.clientHeight : 1
  return {
    x: props.element.offsetLeft * scaleX,
    y: props.element.offsetTop * scaleY,
    width: props.element.offsetWidth * scaleX,
    height: props.element.offsetHeight * scaleY,
  }
}
