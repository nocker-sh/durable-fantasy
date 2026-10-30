export function getSpriteStripFilename(resident: number, animation: string, view: number): string {
  return `${resident}-${animation}-${view}.webp`
}
