/** A spread of 0..1 from a house, the same every time. */
export const windowSpread = (seed: number, salt: number) => {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453
  return x - Math.floor(x)
}
