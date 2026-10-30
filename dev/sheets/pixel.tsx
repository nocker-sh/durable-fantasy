/** A pixel icon at a whole multiple of its size. */
export function Pixel(inputProps: { src: string; scale?: number; alt?: string }) {
  const src = inputProps.src
  const scaleValue = inputProps.scale
  const scale = scaleValue === undefined ? 1 : scaleValue
  const altValue = inputProps.alt
  const alt = altValue === undefined ? "" : altValue

  return <img src={src} alt={alt} style={{ imageRendering: "pixelated", zoom: scale }} />
}
