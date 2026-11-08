import { weapon } from "#/world/core/items/weapon"
import { WEAPON_SHAPES } from "#/world/core/items/weapon-shapes"
import { REMADE_WEAPONS } from "#/world/core/items/remade-weapons"
import { isShapeId } from "#/world/core/items/is-shape-id"
import { ironWeaponId } from "#/world/core/items/iron-weapon-id"
import type { WeaponId } from "#/world/core/items/weapon-types"
import type { ItemDefinition } from "#/world/core/items/types"

/** Each authored shape-metal pair must exist; the type check detects a missing catalogue entry. */
export const WEAPONS = {
  "iron-knife": weapon("iron", WEAPON_SHAPES["knife"], WEAPON_SHAPES["knife"].text),
  "steel-knife": weapon("steel", WEAPON_SHAPES["knife"], WEAPON_SHAPES["knife"].text),
  "engine-knife": weapon("engine", WEAPON_SHAPES["knife"], WEAPON_SHAPES["knife"].text),
  "iron-machete": weapon("iron", WEAPON_SHAPES["machete"], WEAPON_SHAPES["machete"].text),
  "steel-machete": weapon("steel", WEAPON_SHAPES["machete"], WEAPON_SHAPES["machete"].text),
  "engine-machete": weapon("engine", WEAPON_SHAPES["machete"], WEAPON_SHAPES["machete"].text),
  "iron-longsword": weapon("iron", WEAPON_SHAPES["longsword"], WEAPON_SHAPES["longsword"].text),
  "steel-longsword": weapon("steel", WEAPON_SHAPES["longsword"], WEAPON_SHAPES["longsword"].text),
  "engine-longsword": weapon("engine", WEAPON_SHAPES["longsword"], WEAPON_SHAPES["longsword"].text),
  "iron-greatsword": weapon("iron", WEAPON_SHAPES["greatsword"], WEAPON_SHAPES["greatsword"].text),
  "steel-greatsword": weapon("steel", WEAPON_SHAPES["greatsword"], WEAPON_SHAPES["greatsword"].text),
  "engine-greatsword": weapon("engine", WEAPON_SHAPES["greatsword"], WEAPON_SHAPES["greatsword"].text),
  "iron-warhammer": weapon("iron", WEAPON_SHAPES["warhammer"], WEAPON_SHAPES["warhammer"].text),
  "steel-warhammer": weapon("steel", WEAPON_SHAPES["warhammer"], WEAPON_SHAPES["warhammer"].text),
  "engine-warhammer": weapon("engine", WEAPON_SHAPES["warhammer"], WEAPON_SHAPES["warhammer"].text),
  "iron-flail": weapon("iron", WEAPON_SHAPES["flail"], WEAPON_SHAPES["flail"].text),
  "steel-flail": weapon("steel", WEAPON_SHAPES["flail"], WEAPON_SHAPES["flail"].text),
  "engine-flail": weapon("engine", WEAPON_SHAPES["flail"], WEAPON_SHAPES["flail"].text),
  "iron-halberd": weapon("iron", WEAPON_SHAPES["halberd"], WEAPON_SHAPES["halberd"].text),
  "steel-halberd": weapon("steel", WEAPON_SHAPES["halberd"], WEAPON_SHAPES["halberd"].text),
  "engine-halberd": weapon("engine", WEAPON_SHAPES["halberd"], WEAPON_SHAPES["halberd"].text),
  "iron-estoc": weapon("iron", WEAPON_SHAPES["estoc"], WEAPON_SHAPES["estoc"].text),
  "steel-estoc": weapon("steel", WEAPON_SHAPES["estoc"], WEAPON_SHAPES["estoc"].text),
  "engine-estoc": weapon("engine", WEAPON_SHAPES["estoc"], WEAPON_SHAPES["estoc"].text),
  "iron-falchion": weapon("iron", WEAPON_SHAPES["falchion"], WEAPON_SHAPES["falchion"].text),
  "steel-falchion": weapon("steel", WEAPON_SHAPES["falchion"], WEAPON_SHAPES["falchion"].text),
  "engine-falchion": weapon("engine", WEAPON_SHAPES["falchion"], WEAPON_SHAPES["falchion"].text),
  "iron-bill": weapon("iron", WEAPON_SHAPES["bill"], WEAPON_SHAPES["bill"].text),
  "steel-bill": weapon("steel", WEAPON_SHAPES["bill"], WEAPON_SHAPES["bill"].text),
  "engine-bill": weapon("engine", WEAPON_SHAPES["bill"], WEAPON_SHAPES["bill"].text),
  "iron-pick": weapon("iron", WEAPON_SHAPES["pick"], WEAPON_SHAPES["pick"].text),
  "steel-pick": weapon("steel", WEAPON_SHAPES["pick"], WEAPON_SHAPES["pick"].text),
  "engine-pick": weapon("engine", WEAPON_SHAPES["pick"], WEAPON_SHAPES["pick"].text),
  "steel-dagger": weapon("steel", { name: REMADE_WEAPONS["dagger"].name, ...REMADE_WEAPONS["dagger"].base }, REMADE_WEAPONS["dagger"].text),
  "engine-dagger": weapon("engine", { name: REMADE_WEAPONS["dagger"].name, ...REMADE_WEAPONS["dagger"].base }, REMADE_WEAPONS["dagger"].text),
  "steel-hand-axe": weapon("steel", { name: REMADE_WEAPONS["hand-axe"].name, ...REMADE_WEAPONS["hand-axe"].base }, REMADE_WEAPONS["hand-axe"].text),
  "engine-hand-axe": weapon("engine", { name: REMADE_WEAPONS["hand-axe"].name, ...REMADE_WEAPONS["hand-axe"].base }, REMADE_WEAPONS["hand-axe"].text),
  "steel-battle-axe": weapon("steel", { name: REMADE_WEAPONS["battle-axe"].name, ...REMADE_WEAPONS["battle-axe"].base }, REMADE_WEAPONS["battle-axe"].text),
  "engine-battle-axe": weapon("engine", { name: REMADE_WEAPONS["battle-axe"].name, ...REMADE_WEAPONS["battle-axe"].base }, REMADE_WEAPONS["battle-axe"].text),
  "steel-spear": weapon("steel", { name: REMADE_WEAPONS["spear"].name, ...REMADE_WEAPONS["spear"].base }, REMADE_WEAPONS["spear"].text),
  "engine-spear": weapon("engine", { name: REMADE_WEAPONS["spear"].name, ...REMADE_WEAPONS["spear"].base }, REMADE_WEAPONS["spear"].text),
  "steel-mace": weapon("steel", { name: REMADE_WEAPONS["mace"].name, ...REMADE_WEAPONS["mace"].base }, REMADE_WEAPONS["mace"].text),
  "engine-mace": weapon("engine", { name: REMADE_WEAPONS["mace"].name, ...REMADE_WEAPONS["mace"].base }, REMADE_WEAPONS["mace"].text),
} satisfies Record<WeaponId, ItemDefinition>

export const IRON_WEAPONS = Object.keys(WEAPON_SHAPES).filter(isShapeId).map(ironWeaponId)
