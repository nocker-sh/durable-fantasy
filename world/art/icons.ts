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
const cache = new Map<ItemIcon, string>()

/** An item's icon; a maker may bottle or serve it their own way (core/makers.ts). */
export function iconUrl(id: ItemId, by?: string): string {
  const icon = traitOf(id, by)?.icon ?? ITEMS[id].icon
  let url = cache.get(icon)
  if (!url) {
    url = toUrl(enlarge(crop(draw(icon), 1), 32))
    cache.set(icon, url)
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

function draw(icon: ItemIcon): PixBuf {
  switch (icon) {
    case "dagger":
      return blade(9, 2, RAMPS.leather)
    case "sword":
      return blade(14, 3, RAMPS.leatherR)
    case "spear":
      return polearm("spear")
    case "axe":
      return polearm("axe")
    case "mace":
      return polearm("mace")
    default:
      if (icon in ITEM_SPRITES) return ITEM_SPRITES[icon]
      if (icon in SPRITES) return SPRITES[icon as SpriteName]
      return goodIcon(icon, SIZE)
  }
}

/** A diagonal blade from the lower left to the upper right with a crossguard and grip. */
function blade(length: number, guard: number, grip: RGB[]): PixBuf {
  const b = new PixBuf(SIZE, SIZE)
  const iron = RAMPS.iron,
    gold = RAMPS.gold
  const x0 = 6,
    y0 = 17
  for (let k = 0; k < length; k++) {
    const x = x0 + 2 + k,
      y = y0 - 2 - k
    b.set(x, y, iron[4])
    b.set(x + 1, y, iron[3])
    b.set(x, y + 1, iron[2])
  }
  b.set(x0 + 2 + length, y0 - 2 - length, iron[4])
  for (let k = -guard; k <= guard; k++) b.set(x0 + 1 + k, y0 - 1 + k, k === 0 ? gold[3] : gold[2])
  for (let k = 0; k < 3; k++) b.set(x0 - k, y0 + k, grip[2 + (k & 1)])
  b.set(x0 - 3, y0 + 3, gold[3])
  b.outline(OUTLINE)
  return b
}

/** A long wooden haft with a head: spear point, axe blade or mace. */
function polearm(kind: "spear" | "axe" | "mace"): PixBuf {
  const b = new PixBuf(SIZE, SIZE)
  const wood = RAMPS.wood,
    iron = RAMPS.iron
  const reach = kind === "spear" ? 17 : 13
  for (let k = 0; k < reach; k++) {
    const x = 3 + k,
      y = 20 - k
    b.set(x, y, wood[3])
    b.set(x + 1, y, wood[2])
  }
  const hx = 3 + reach,
    hy = 20 - reach
  if (kind === "spear") {
    for (let k = 0; k < 4; k++) {
      b.set(hx + k, hy - k, iron[4])
      b.set(hx + k + 1, hy - k, iron[3])
    }
    b.set(hx - 1, hy + 1, iron[2])
    b.set(hx + 1, hy + 1, iron[2])
  } else if (kind === "axe") {
    for (let y = -4; y <= 3; y++) for (let x = 0; x <= 4 - Math.abs(y) / 2; x++) b.set(hx + x - 3, hy + y - 1 - x, x > 3 - Math.abs(y) / 2 ? iron[4] : iron[2 + ((x + y) & 1)])
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
