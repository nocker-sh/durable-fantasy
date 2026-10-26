// Pixel icons for items, drawn once and kept as data URLs for <img>.
import { ITEMS, type ItemIcon, type ItemId } from "../core/items.ts"
import { traitOf } from "../core/makers.ts"
import { goodIcon } from "../scene/goods.ts"
import { OUTLINE, PixBuf, RAMPS, type RGB } from "../scene/pix.ts"
import { FH, FW, type Look } from "../scene/figure.ts"
import { spriteFrame } from "../scene/sprite-pool.ts"
import { SPRITES, silhouette, type SpriteName } from "./pixel-art.ts"
import { ITEM_SPRITES } from "./item-art.ts"

const SIZE = 24
const cache = new Map<string, string>()

/** An item's icon; a maker may bottle or serve it their own way (core/makers.ts). */
export function iconUrl(id: ItemId, by?: string): string {
  const icon = traitOf(id, by)?.icon ?? ITEMS[id].icon
  const metal = ITEMS[id].metal ?? "iron"
  const key = `${icon}|${metal}`
  let url = cache.get(key)
  if (!url) {
    url = toUrl(enlarge(crop(draw(icon, RAMPS[metal]), 1), 32))
    cache.set(key, url)
  }
  return url
}

const uiCache = new Map<string, string>()

/** A screen icon (menu buttons, HP, coins…), enlarged by a whole factor to at most `size` px. */
export function uiIconUrl(name: SpriteName, size = 32, empty = false): string {
  const key = `${name}|${size}|${empty}`
  let url = uiCache.get(key)
  if (!url) {
    const b = SPRITES[name]
    url = toUrl(enlarge(empty ? silhouette(b) : b, size))
    uiCache.set(key, url)
  }
  return url
}

/** The character standing and facing the viewer, cropped to the figure; drawn by a sprite worker. */
export function portraitUrl(look: Look, ready: (url: string) => void) {
  const shown = { ...look, hat: look.hat === "helm" || look.hat === "greathelm" ? look.hat : undefined }
  const done = (bitmap: ImageBitmap) => {
    const canvas = new OffscreenCanvas(FW, FH)
    const ctx = canvas.getContext("2d")!
    ctx.drawImage(bitmap, 0, 0)
    const frame = new PixBuf(FW, FH)
    frame.data.set(ctx.getImageData(0, 0, FW, FH).data)
    ready(toUrl(crop(frame, 1)))
  }
  const data = spriteFrame(shown, null, "idle", 0, 0, 900, done)
  if (data) done(data)
}

/** Scale up by the largest whole factor that keeps it within `limit` pixels. */
function enlarge(b: PixBuf, limit: number): PixBuf {
  const k = Math.max(1, Math.floor(limit / Math.max(b.w, b.h)))
  if (k === 1) return b
  const out = new PixBuf(b.w * k, b.h * k)
  for (let y = 0; y < out.h; y++)
    for (let x = 0; x < out.w; x++) {
      const sx = Math.floor(x / k),
        sy = Math.floor(y / k)
      if (b.alpha(sx, sy)) out.set(x, y, b.get(sx, sy), b.alpha(sx, sy))
    }
  return out
}

function crop(b: PixBuf, margin: number): PixBuf {
  let x0 = b.w,
    y0 = b.h,
    x1 = -1,
    y1 = -1
  for (let y = 0; y < b.h; y++)
    for (let x = 0; x < b.w; x++) {
      if (!b.alpha(x, y)) continue
      x0 = Math.min(x0, x)
      x1 = Math.max(x1, x)
      y0 = Math.min(y0, y)
      y1 = Math.max(y1, y)
    }
  if (x1 < 0) return b
  const out = new PixBuf(x1 - x0 + 1 + margin * 2, y1 - y0 + 1 + margin * 2)
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (b.alpha(x, y)) out.set(x - x0 + margin, y - y0 + margin, b.get(x, y), b.alpha(x, y))
  return out
}

function draw(icon: ItemIcon, metal: RGB[]): PixBuf {
  switch (icon) {
    case "dagger":
      return blade(9, 2, RAMPS.leather, metal)
    case "knife":
      return blade(7, 1, RAMPS.leatherD, metal, 2)
    case "sword":
      return blade(14, 3, RAMPS.leatherR, metal)
    case "longsword":
      return blade(16, 3, RAMPS.leatherK, metal, 1, 5)
    case "greatsword":
      return blade(18, 4, RAMPS.leatherR, metal, 2, 6)
    case "machete":
      return machete(metal)
    case "spear":
    case "axe":
    case "mace":
    case "warhammer":
    case "flail":
    case "halberd":
      return polearm(icon, metal)
    default:
      if (icon in ITEM_SPRITES) return ITEM_SPRITES[icon]
      if (icon in SPRITES) return SPRITES[icon as SpriteName]
      return goodIcon(icon, SIZE)
  }
}

/** A diagonal blade from the lower left to the upper right with a crossguard and grip; `width` 2 is a broad blade. */
function blade(length: number, guard: number, grip: RGB[], iron = RAMPS.iron, width = 1, gripLen = 3): PixBuf {
  const b = new PixBuf(SIZE + 8, SIZE + 8)
  const gold = RAMPS.gold
  const x0 = 4 + gripLen * 0.5,
    y0 = b.h - 6 - gripLen * 0.5
  const ox = Math.round(x0),
    oy = Math.round(y0)
  for (let k = 0; k < length; k++) {
    const x = ox + 2 + k,
      y = oy - 2 - k
    b.set(x, y, iron[4])
    b.set(x + 1, y, iron[3])
    b.set(x, y + 1, iron[2])
    if (width > 1 && k < length - 2) {
      b.set(x + 1, y + 1, iron[3])
      b.set(x + 2, y + 1, iron[1])
    }
  }
  b.set(ox + 2 + length, oy - 2 - length, iron[4])
  for (let k = -guard; k <= guard; k++) b.set(ox + 1 + k, oy - 1 + k, k === 0 ? gold[3] : gold[2])
  for (let k = 0; k < gripLen; k++) b.set(ox - k, oy + k, grip[2 + (k & 1)])
  b.set(ox - gripLen, oy + gripLen, gold[3])
  b.outline(OUTLINE)
  return b
}

/** A broad single-edged blade, its back straight and its edge swelling to a squared tip. */
function machete(iron: RGB[]): PixBuf {
  const b = new PixBuf(SIZE, SIZE)
  const wood = RAMPS.wood
  for (let k = 0; k < 4; k++) b.set(4 + k, 19 - k, wood[2 + (k & 1)])
  for (let k = 0; k < 11; k++) {
    const x = 8 + k,
      y = 15 - k
    const w = 1 + Math.min(2, Math.floor(k / 3))
    for (let t = 0; t <= w; t++) {
      b.set(x + t, y + t, t === w ? iron[4] : t === 0 ? iron[2] : iron[3])
      b.set(x + t + 1, y + t, t === w ? iron[4] : iron[3])
    }
  }
  b.outline(OUTLINE)
  return b
}

/** A long wooden haft with a head: spear point, axe blade, mace, hammer, flail or halberd. */
function polearm(kind: "spear" | "axe" | "mace" | "warhammer" | "flail" | "halberd", iron: RGB[]): PixBuf {
  const b = new PixBuf(SIZE, SIZE)
  const wood = RAMPS.wood
  const reach = kind === "spear" || kind === "halberd" ? 17 : kind === "flail" ? 11 : 13
  for (let k = 0; k < reach; k++) {
    const x = 3 + k,
      y = 20 - k
    b.set(x, y, wood[3])
    b.set(x + 1, y, wood[2])
  }
  const hx = 3 + reach,
    hy = 20 - reach
  if (kind === "spear" || kind === "halberd") {
    for (let k = 0; k < 4; k++) {
      b.set(hx + k, hy - k, iron[4])
      b.set(hx + k + 1, hy - k, iron[3])
    }
    b.set(hx - 1, hy + 1, iron[2])
    b.set(hx + 1, hy + 1, iron[2])
    if (kind === "halberd") {
      // an axe blade below the point on one side, a hook on the other
      for (let y = 0; y <= 4; y++) for (let x = 0; x <= 3 - Math.abs(y - 2) / 2; x++) b.set(hx - 4 - x + y, hy + 2 + y + x, x > 2 - Math.abs(y - 2) / 2 ? iron[4] : iron[2 + ((x + y) & 1)])
      b.set(hx + 1, hy + 3, iron[3])
      b.set(hx + 2, hy + 3, iron[2])
    }
  } else if (kind === "axe") {
    for (let y = -4; y <= 3; y++) for (let x = 0; x <= 4 - Math.abs(y) / 2; x++) b.set(hx + x - 3, hy + y - 1 - x, x > 3 - Math.abs(y) / 2 ? iron[4] : iron[2 + ((x + y) & 1)])
  } else if (kind === "warhammer") {
    // a square head across the haft, a short spike behind
    for (let t = -3; t <= 3; t++)
      for (let w = -1; w <= 1; w++) {
        const x = hx + t + w,
          y = hy + t - w
        b.set(x, y, iron[w === -1 ? 4 : w === 0 ? 3 : 2])
      }
    b.set(hx - 4, hy - 4, iron[3])
  } else if (kind === "flail") {
    // a short chain, then a striking bar swinging free
    b.set(hx + 1, hy - 1, iron[3])
    b.set(hx + 2, hy - 1, iron[2])
    b.set(hx + 3, hy - 2, iron[3])
    for (let k = 0; k < 6; k++) {
      b.set(hx + 4 + k, hy - 2 + Math.floor(k / 2), iron[4])
      b.set(hx + 4 + k, hy - 1 + Math.floor(k / 2), iron[2])
    }
  } else {
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) if (x * x + y * y <= 10) b.set(hx + x, hy + y, iron[Math.max(0, Math.min(4, 3 - Math.round((x + y) / 2)))])
    for (const [x, y] of [
      [0, -4],
      [4, 0],
      [0, 4],
      [-4, 0],
    ])
      b.set(hx + x, hy + y, iron[3])
  }
  b.outline(OUTLINE)
  return b
}

function toUrl(b: PixBuf): string {
  const canvas = document.createElement("canvas")
  canvas.width = b.w
  canvas.height = b.h
  canvas.getContext("2d")!.putImageData(new ImageData(b.data, b.w, b.h), 0, 0)
  return canvas.toDataURL()
}
