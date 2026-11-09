import type { ItemIcon } from "#/world/core/items/icons"
import { goodIcon } from "#/world/scene/good-icon"
import { RAMPS } from "#/world/scene/pix"
import { PixelBuffer as PixBuf } from "#/lib/graphics/pixel-buffer"
import type { RGB } from "#/lib/graphics/pixel-types"
import { SPRITES } from "#/world/art/pixel-art"
import type { SpriteName } from "#/world/art/pixel-art"
import { ITEM_SPRITES } from "#/world/art/items/catalog"
import { SIZE } from "#/world/art/icon-rules"
import { blade } from "#/world/art/icons/blade"
import { machete } from "#/world/art/icons/machete"
import { polearm } from "#/world/art/icons/polearm"

export function draw(icon: ItemIcon, metal: RGB[]): PixBuf {
  switch (icon) {
    case "dagger":
      return blade({ length: 9, guard: 2, grip: RAMPS.leather, iron: metal })
    case "knife":
      return blade({ length: 7, guard: 1, grip: RAMPS.leatherD, iron: metal, width: 2 })
    case "sword":
      return blade({ length: 14, guard: 3, grip: RAMPS.leatherR, iron: metal })
    case "longsword":
      return blade({ length: 16, guard: 3, grip: RAMPS.leatherK, iron: metal, width: 1, gripLen: 5 })
    case "greatsword":
      return blade({ length: 18, guard: 4, grip: RAMPS.leatherR, iron: metal, width: 2, gripLen: 6 })
    case "estoc":
      return blade({ length: 17, guard: 2, grip: RAMPS.leatherK, iron: metal, width: 1, gripLen: 4 })
    case "falchion":
      return blade({ length: 11, guard: 2, grip: RAMPS.leatherD, iron: metal, width: 2 })
    case "machete":
      return machete(metal)
    case "spear":
    case "axe":
    case "mace":
    case "warhammer":
    case "flail":
    case "halberd":
    case "bill":
    case "pick":
      return polearm(icon, metal)
    default:
      if (icon in ITEM_SPRITES) return ITEM_SPRITES[icon]
      if (icon in SPRITES) return SPRITES[icon as SpriteName]
      return goodIcon(icon, SIZE)
  }
}
