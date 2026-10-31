import { smooth } from "#/lib/engine/smooth"
export const hill = (x: number, z: number, cx: number, cz: number, r: number, flat: number, top: number) => top * smooth(r, flat, Math.hypot(x - cx, z - cz))
