// Which of the game's tables each /dev sheet shows (dev/sheets/registry.ts), and the exported constants
// that are not tables of things (names for codes, sizes, layouts). sources.test.ts fails when the
// game exports a new table that is in neither list, so nothing in the game goes unshown.
export const SOURCES: Record<string, readonly string[]> = {
  items: ["ITEMS", "ITEM_IDS", "ITEM_ICONS", "WEAPONS", "IRON_WEAPONS", "WEAPON_SHAPES", "REMADE_WEAPONS"],
  npcs: ["RESIDENTS", "RESIDENT_LOOKS", "PEOPLE", "ROUTINES"],
  households: ["HOUSEHOLDS"],
  houses: ["HOUSES", "INTERIORS", "INDOOR_WORLDS", "OUT_FRONT", "TRACES"],
  maps: ["MAPS", "OPEN_FIELDS", "TOWN_SPAWN"],
  shops: ["SHOPS"],
  batches: ["BATCHES"],
  makers: ["MAKERS"],
  recipes: ["RECIPES", "COOKING_RECIPES", "ALCHEMY_RECIPES", "CARPENTRY_RECIPES", "TAILORING_RECIPES", "SMITHING_RECIPES", "FORGED_WEAPON_RECIPES", "MILESTONES_RECIPES"],
  stations: ["STATIONS", "STATION_RULES", "EXCHANGE_BOARD"],
  commissions: ["COMMISSIONS"],
  errands: ["ERRANDS"],
  monsters: ["MONSTER_KINDS", "SPAWNS", "HARE_BODY_PARTS"],
  nodes: ["NODES", "LATER_SPOTS"],
  skills: ["SKILLS", "SKILL_IDS"],
  life: ["LIFE_SKILLS", "LIFE_MILESTONE_TEXT", "MILESTONES"],
  objects: ["PROPS", "SIZES", "THINGS", "THINGS_BY_HOUSEHOLD", "FURNISHINGS", "ON_WALLS"],
  world: ["WORLD", "GRID_SIZE", "WORLD_NODES", "LOCKED_CITIES"],
  icons: ["SPRITES"],
  "item-art": ["ITEM_SPRITES", "HIDE"],
  textures: ["SIGN_PAINTERS"],
  ramps: ["RAMPS"],
  parts: ["SEX", "AGE", "SKIN", "HAIR", "STYLES", "CLOTH", "HATS", "NECKS", "NECK_KINDS", "NECK_RAMPS", "FRINGES"],
  presets: ["PRESETS", "LOOKS", "DEFAULT_LOOK"],
  motions: ["MOTIONS", "CATEGORIES"],
  anims: ["ANIMS", "RESIDENT_ANIMS", "FRAMES", "ANIM_DUR"],
  lines: ["ALL_LINES", "LINES"],
  relations: ["RELATIONS", "APART"],
  events: [],
  messages: ["REASON_TEXT"],
  screens: [],
  flavor: ["FLAVOR"],
}

/** Exported constants that are not tables of things in the game. */
export const NOT_TABLES: readonly string[] = [
  // Server command dispatch, not a world data table.
  "HANDLERS",
  // names for codes, shown inside the sheets
  "GATHER_SKILL_NAME",
  "KIND_NAME",
  "RARITY_NAME",
  "SHOP_KIND_NAME",
  "SLOT_NAME",
  "METAL_NAME",
  "METAL_RULES", // Construction multipliers, not standalone item records.
  "METAL_TEXT", // Description fragments composed into the expanded weapon rows.
  "WOOD_NAME",
  "STAT_NAME",
  // fixed lists of codes and factors
  "NATIVE_ARM_SHAPE", // Shared drawing and contact coefficients, not placed world objects.
  "SHEEP_SHAPE", // Shared native sheep geometry; actual populations remain defined by townAnimalSpawns.
  "PARKED_CART_SHAPE", // Empty-cart geometry; the placed furniture is listed under objects and houses.
  "WATER_JAR_SHAPE", // Normalized ceramic geometry, not a table of placed objects.
  "WINDMILL_ROTOR_SHAPE", // Shared rotor dimensions; the placed mill belongs to the facility settings.
  "FURNITURE_KINDS", // Renderer identifiers; placed furniture is listed under objects and houses.
  "GATHER_SKILLS",
  "CRAFT_SKILLS",
  "GRADES",
  "QUALITIES",
  "QUALITY_EFFECT",
  "QUALITY_PRICE",
  "COMMISSION_QUALITIES", // Numeric traversal order, not commission records.
  "DEFAULT_COMMISSION_TIERS", // Fixed fallback probability factors, not authored commissions.
  "SLOTS",
  "METALS",
  "WOOD_IDS",
  "STATS",
  "FRIEND",
  "TIMES_OF_DAY",
  "DEFAULT_WINDOWS",
  "KEPT_ON_ESC",
  // how the scene lays out and draws
  "CRAFT",
  "GATE",
  "MARKET",
  "VILLAGE",
  "INDOOR",
  "FIELD_LAYOUTS",
  "FIELD_BUILDERS",
  "OFF",
  "OFF_LINE",
  "OFF_POINT",
  "OUTLINE",
  "DIRS",
  "FIG",
  "FIG_PPU",
  "GRID_N",
  "WN",
  "PROP_PLACE",
  "PROP_DIST",
  "STEP",
  "OPPOSITE",
  "EYE_DARK",
  "LAYOUTS",
  "OPEN_SIDES",
  "GROUND_PX",
  // Derived cache fingerprint, not a gameplay definition table.
  "GROUND_VERSION",
  // Fixed exterior configuration; its building has a dedicated settings document.
  "CHAPEL",
  // A single exterior layout, its derived interaction cell, and a geometric half-size.
  "CRAFT_YARD",
  "CRAFT_FORGE_PLACE",
  "FORGE_GROUND_HALF_SIZE",
  // Material instances and skeletal traversal order, not world-content records.
  "HEARTH_COAL",
  "INTERIOR_CLOTH",
  "BONE_ORDER",
  "LEG_BONES",
  // Decoration dispatch rules and geometric wall basis vectors, not placed world records.
  "BY_USE",
  "LYING",
  "SIDE",
  // Drawing basis vectors, palette choices and procedural pixel stamps.
  "OUT",
  "FR",
  "PARENT",
  "TUFTS",
  "SPRIGS",
  "ASH_LIGHT",
  // Derived terrain field size and the cached plaza elevation.
  "GN",
  "PLAZA_H",
  // Fixed interaction offsets used to derive the wells' standing cells.
  "WELL_PLACE_OFFSETS_TILES",
]
