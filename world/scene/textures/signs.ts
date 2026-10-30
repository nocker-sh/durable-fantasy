import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import { pick } from "#/world/scene/pick"
import { RAMPS } from "#/world/scene/pix"
import { type RGB } from "#/lib/graphics/pixel-types"
import { hexToRgb as hex } from "#/lib/graphics/hex-to-rgb"

// ---------------------------------------------------------------- small icons
export function signTex(kind: string): PixBuf {
  const b = new PixBuf(24, 18)
  b.fill((x, y) => {
    const edge = x === 0 || y === 0 || x === 23 || y === 17
    return pick({ ramp: "wood", b: edge ? 0.25 : 0.62 + (y % 4 === 0 ? -0.15 : 0), x: x, y: y, dither: 0.3 })
  })
  const g = RAMPS.gold
  const ink = (x: number, y: number, c: RGB) => b.set({ x: x, y: y, color: c })
  if (kind === "bread") {
    for (let y = 6; y < 13; y++)
      for (let x = 5; x < 19; x++) {
        if (Math.hypot((x - 12) / 7, (y - 9.5) / 3.6) > 1) continue
        const l = 0.75 - ((y - 6) / 7) * 0.4 + ((x - 4) % 4 === 0 && y < 9 ? -0.35 : 0)
        ink(x, y, pick({ ramp: "cMustard", b: l, x: x, y: y, dither: 0.3 }))
      }
  } else if (kind === "anvil") {
    const I = RAMPS.iron
    for (let x = 5; x < 19; x++) ink(x, 6, I[3])
    for (let x = 4; x < 19; x++) ink(x, 7, I[2])
    for (let x = 8; x < 16; x++) ink(x, 8, I[2])
    for (let y = 9; y < 12; y++) for (let x = 10; x < 14; x++) ink(x, y, I[1])
    for (let x = 7; x < 17; x++) ink(x, 12, I[1])
  } else if (kind === "mug") {
    for (let y = 5; y < 14; y++) for (let x = 8; x < 15; x++) ink(x, y, y < 7 ? RAMPS.cLinen[4] : g[x < 10 ? 3 : 2])
    for (let y = 7; y < 12; y++) {
      ink(15, y, g[1])
      ink(17, y, g[1])
    }
    ink(16, 7, g[1])
    ink(16, 11, g[1])
  } else if (kind === "cross") {
    for (let y = 3; y < 15; y++) {
      ink(11, y, g[3])
      ink(12, y, g[2])
    }
    for (let x = 7; x < 17; x++) {
      ink(x, 6, g[3])
      ink(x, 7, g[2])
    }
  } else if (kind === "potion") {
    // a round flask of red medicine
    for (let y = 4; y < 7; y++) {
      ink(11, y, RAMPS.glass[3])
      ink(12, y, RAMPS.glass[2])
    }
    for (let y = 7; y < 15; y++) for (let x = 7; x < 17; x++) if (Math.hypot(x - 11.5, y - 10.5) < 4.2) ink(x, y, pick({ ramp: "cRed", b: 0.8 - (y - 7) / 10 - (x - 7) / 30, x: x, y: y, dither: 0.3 }))
    ink(10, 8, RAMPS.cLinen[4])
  } else if (kind === "crystal") {
    const c: RGB[] = ["#3a6a88", "#8fd0e0", "#e8ffff"].map(hex)
    for (let y = 3; y < 15; y++) {
      const w = y < 8 ? (y - 3) * 0.8 : (15 - y) * 0.55
      for (let x = Math.round(12 - w); x <= Math.round(12 + w); x++) ink(x, y, x < 12 ? c[2] : x === 12 ? c[1] : c[0])
    }
  } else if (kind === "needle") {
    // scissors
    for (let k = 0; k < 9; k++) {
      ink(6 + k, 4 + k, RAMPS.iron[3])
      ink(17 - k, 4 + k, RAMPS.iron[2])
    }
    for (const cx of [7, 16]) for (let a = 0; a < 12; a++) ink(Math.round(cx + Math.cos(a / 2) * 2), Math.round(14 + Math.sin(a / 2) * 1.6), g[2])
  } else if (kind === "shield") {
    for (let y = 3; y < 15; y++) {
      const w = y < 10 ? 6 : 6 - (y - 9) * 1.2
      for (let x = Math.round(12 - w); x < Math.round(12 + w); x++) ink(x, y, pick({ ramp: x < 12 ? "cRed" : "cBlue", b: 0.6, x: x, y: y, dither: 0.2 }))
    }
    for (let y = 3; y < 15; y++) ink(12, y, g[3])
  } else if (kind === "bow") {
    for (let y = 3; y < 15; y++) {
      ink(Math.round(9 + Math.sin(((y - 3) / 12) * Math.PI) * 5), y, RAMPS.wood[3])
      ink(9, y, RAMPS.cLinen[4])
    }
    for (let x = 5; x < 19; x++) ink(x, 9, RAMPS.wood[2])
    ink(19, 8, RAMPS.iron[3])
    ink(19, 9, RAMPS.iron[3])
    ink(20, 9, RAMPS.iron[3])
    ink(19, 10, RAMPS.iron[3])
  } else if (kind === "hide") {
    for (let y = 4; y < 14; y++)
      for (let x = 6; x < 18; x++)
        if (Math.hypot((x - 11.5) / 6, (y - 9) / 5) < 1 + Math.sin(x + y) * 0.08) ink(x, y, pick({ ramp: "leather", b: 0.55 + Math.sin(x * 1.3) * 0.08, x: x, y: y, dither: 0.3 }))
  } else if (kind === "scale") {
    // balance scales for the buyer
    for (let y = 4; y < 15; y++) ink(12, y, g[2])
    for (let x = 5; x < 20; x++) ink(x, 5, g[3])
    for (const cx of [6, 18]) {
      for (let y = 6; y < 10; y++) ink(cx, y, g[1])
      for (let x = cx - 2; x <= cx + 2; x++) ink(x, 10, g[2])
    }
    for (let x = 9; x < 16; x++) ink(x, 15, g[2])
  } else if (kind === "bag") {
    for (let y = 6; y < 15; y++) for (let x = 6; x < 18; x++) if (Math.hypot((x - 11.5) / 6, (y - 10.5) / 4.6) < 1) ink(x, y, pick({ ramp: "leather", b: 0.7 - (y - 6) / 14, x: x, y: y, dither: 0.3 }))
    for (let x = 9; x < 15; x++) ink(x, 5, RAMPS.leather[1])
    ink(11, 4, g[3])
    ink(12, 4, g[3])
  } else if (kind === "key") {
    for (let a = 0; a < 16; a++) ink(Math.round(8 + Math.cos(a / 2.5) * 2.5), Math.round(9 + Math.sin(a / 2.5) * 2.5), g[3])
    for (let x = 11; x < 19; x++) ink(x, 9, g[2])
    ink(17, 10, g[2])
    ink(17, 11, g[2])
    ink(15, 10, g[2])
  }
  return b
}
