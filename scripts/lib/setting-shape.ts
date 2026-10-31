import { stairSectionsSchema } from "#/scripts/lib/stair-sections-schema"
import { roomWorkUseSchema } from "#/scripts/lib/room-work-use-schema"
import { entryApproachSchema } from "#/scripts/lib/entry-approach-schema"
import { entryStepsSchema } from "#/scripts/lib/entry-steps-schema"
import { foundationSchema } from "#/scripts/lib/foundation-schema"
import { kitchenWaterCycleSchema } from "#/scripts/lib/kitchen-water-cycle-schema"
import { stockLockSchema } from "#/scripts/lib/stock-lock-schema"
import { stockLockSiteSchema } from "#/scripts/lib/stock-lock-site-schema"
import { mapRoadPlanSchema } from "#/scripts/lib/map-road-plan-schema"
import { parkedCartDepartureSchema } from "#/scripts/lib/parked-cart-departure-schema"
import { dishwaterCaptureSchema } from "#/scripts/lib/dishwater-capture-schema"
import { doorLeafGeometrySchema } from "#/scripts/lib/door-leaf-geometry-schema"
import { openDoorPassagesSchema } from "#/scripts/lib/open-door-passages-schema"
import { townDistrictPlanSchema } from "#/scripts/lib/town-district-plan-schema"
import { residentProposalSchema } from "#/scripts/lib/resident-proposal-schema"
import { districtReservationSchema } from "#/scripts/lib/district-reservation-schema"
import { buildingDoorInventorySchema } from "#/scripts/lib/building-door-inventory-schema"
import { woolPreparationSchema } from "#/scripts/lib/wool-preparation-schema"
import { textileWoolLotsSchema } from "#/scripts/lib/textile-wool-lots-schema"
import { hotWaterServiceSchema } from "#/scripts/lib/hot-water-service-schema"
import { sleepingMaterialsSchema } from "#/scripts/lib/sleeping-materials-schema"
import { textileOrdersSchema } from "#/scripts/lib/textile-orders-schema"
import { personalStorageSchema } from "#/scripts/lib/personal-storage-schema"
import { floorLevelsSchema } from "#/scripts/lib/floor-levels-schema"
import { cookingTopSchema } from "#/scripts/lib/cooking-top-schema"
import { waterVesselSupportSchema } from "#/scripts/lib/water-vessel-support-schema"
import { waterVesselDesignSchema } from "#/scripts/lib/water-vessel-design-schema"
import { potableWaterSupplySchema, potableWaterCollectionSchema } from "#/scripts/lib/potable-water-supply-schema"
import { householdMealSchema } from "#/scripts/lib/household-meal-schema"
import { ashReceivingSchema } from "#/scripts/lib/ash-receiving-schema"
import { SETTING_PREFIXES } from "#/scripts/lib/setting-index"
import { z } from "zod"
const text = z.string().min(1),
  integer = z.number().int().nonnegative(),
  positive = z.number().positive()
const cell = z.tuple([integer, integer]),
  point = z.tuple([z.number(), z.number()])
const footprint = z.tuple([integer, integer, z.number().int().positive(), z.number().int().positive()])
const references = z.array(text)
const wasteStream = z.enum(["excreta", "greywater", "treated_residue", "treated_water"])
const transportContainer = z.object({
  shape: z.literal("cylinder"),
  id: text,
  stream: z.union([wasteStream, z.literal("potable_water")]),
  material: text,
  lidded: z.literal(true),
  outer_diameter_m: positive,
  outer_height_m: positive,
  inner_diameter_m: positive,
  usable_depth_m: positive,
  capacity_l: positive,
  empty_mass_kg: positive,
})
const doorPush = z.object({ body_radius_m: positive, poses: z.array(z.object({ angle_deg: z.number().min(0).max(90), body_m: point })).min(2) })
const doorOperation = z.object({
  body_radius_m: positive,
  orbit_radius_m: positive,
  start_deg: z.number().min(0).max(90),
  end_deg: z.number().min(0).max(90),
  waits_for: z.array(z.object({ furniture: z.string().length(1), space_index: integer, reason: text })).optional(),
})
const connection = z.object({
  kind: z.enum(["door", "opening", "stair"]).optional(),
  target: text,
  door: cell.optional(),
  target_door: cell.optional(),
  width_cells: z.number().int().positive().optional(),
  furniture: text.optional(),
  target_furniture: text.optional(),
  access: cell.optional(),
  target_access: cell.optional(),
})
/** Validate provided structures without stripping unknown authoring metadata or inventing defaults. */
const structure = z.object({
  runtime_layout_omissions: z.object({ source: text, rooms: z.array(z.object({ floor: integer, name: text })) }).optional(),
  runtime_graphics_omissions: z.object({ source: text, pieces: z.array(z.object({ floor: integer, name: text })) }).optional(),
  kind: z.enum(Object.keys(SETTING_PREFIXES)),
  grid: z
    .object({ cell_m: positive, rows: z.array(z.string().min(1)).min(1) })
    .nullable()
    .optional(),
  windows: z
    .array(
      z.object({
        id: text,
        side: z.enum(["n", "e", "s", "w"]),
        offset_m: positive,
        width_m: positive,
        sill_m: positive,
        height_m: positive,
        frame_m: positive,
        owner: text,
        source: text,
        maintainers: references.min(1),
      }),
    )
    .optional(),
  record_places: z.array(z.object({ resident: text, furniture: text, access_index: integer })).optional(),
  details: z
    .array(
      z.object({
        name: text,
        on: z.enum(["卓", "炉", "戸口", "壁", "床"]),
        support: text.optional(),
        rect_m: z.tuple([z.number().nonnegative(), z.number().nonnegative(), positive, positive]),
        wall_mount: z.object({ side: z.enum(["n", "e", "s", "w"]), bottom_m: positive, height_m: positive }).optional(),
        owner: text,
        source: text,
        maintainers: references.min(1),
      }),
    )
    .optional(),
  lamps: z.array(z.object({ id: text, position_m: point, bottom_m: positive, top_m: positive, diameter_m: positive, owner: text, source: text, maintainers: references.min(1), use: text })).optional(),
  entry_opening_height_m: positive.optional(),
  origin: cell.optional(),
  floor: integer.optional(),
  entry_steps: z.array(entryStepsSchema).optional(),
  foundation: foundationSchema.optional(),
  flues: z
    .array(
      z.object({
        lower_room: text,
        hearth: z.string().length(1),
        upper_room: text,
        shaft: z.string().length(1),
        furniture_clearance_m: positive,
        wall_thickness_m: positive,
        floor_collar_m: positive,
        floor_support: z.object({ depth_m: positive, steps: z.number().int().positive() }),
        outlet_above_ridge_m: positive,
      }),
    )
    .optional(),
  floor_levels: floorLevelsSchema.optional(),
  roof_section: z.object({ ridge_axis: z.enum(["x", "y"]), eave_underside_m: z.number(), ridge_underside_m: z.number(), overhang_m: z.number().nonnegative(), material: text }).optional(),
  stair_sections: stairSectionsSchema.optional(),
  parallel_use: z.array(z.object({ activity: text, operations: z.array(z.object({ resident: text, furniture: z.string().length(1), space_index: integer })).min(2) })).optional(),
  guest_sleeping_places: z.array(z.object({ id: text, label: text, grid_symbol: z.string().length(1).nullable(), luggage_id: text, luggage_symbol: z.string().length(1).nullable() })).optional(),
  furniture: z
    .array(
      z.object({
        hearth_maintenance: z
          .object({
            ash_receiver: z
              .object({
                storage: z.object({ furniture: z.string().length(1), item: text }),
                lid_rest: z.object({ box_support: z.literal("floor"), furniture: z.string().length(1), position_m: point }),
                receiving: ashReceivingSchema,
                capacity_l: positive,
                cold_only: z.literal(true),
                status: z.literal("unverified"),
                door_approach: z.object({ target: text, body_radius_m: positive, carry_bottom_m: positive, poses: z.array(z.object({ body_m: point, turn: z.number().int().min(0).max(3) })).min(2) }),
              })
              .optional(),
            work_pose_candidate: z
              .object({
                off_hand: z.object({ palm_m: z.tuple([z.number(), z.number(), z.number()]), pole: z.tuple([z.number(), z.number(), z.number()]) }).optional(),
                kneeling: z.object({ pelvis_drop_m: positive, knee: z.enum(["l", "r"]) }).optional(),
                shoe_contacts: z
                  .array(z.enum(["shoe_l", "shoe_r"]))
                  .min(1)
                  .optional(),
                stroke_motion: z.literal("fixed_support").optional(),
                stroke_clearance: z.literal("unverified").optional(),
                animation: z.literal("scrub"),
                frame: integer,
                body_m: point,
                facing: z.enum(["n", "s", "e", "w"]),
                hand: z.enum(["l", "r"]),
                pole: z.tuple([z.number(), z.number(), z.number()]),
              })
              .optional(),
            handoff: z
              .object({
                stage_area: footprint,
                grip_from_blade_m: positive,
                staging_body_m: point,
                steps: z
                  .array(z.object({ grip_m: z.tuple([z.number(), z.number(), z.number()]), body_m: point, orientation: z.enum(["carry_vertical", "work_vertical", "work_horizontal", "work_sloped"]) }))
                  .min(2),
              })
              .optional(),
            carry: z.object({ posture: z.literal("upright"), return: z.literal("reverse"), poses: z.array(z.object({ body_m: point, turn: z.number().int().min(0).max(3) })).min(2) }).optional(),
            grip_height_m: positive,
            operator: text,
            space_index: integer,
            body_m: point,
            grip_m: point,
            body_radius_m: positive,
            state: z.literal("cold_empty"),
            tool: z.object({
              name: text,
              owner: text,
              source: text,
              maintainers: references.min(1),
              length_m: positive,
              blade_width_m: positive,
              blade_thickness_m: positive,
              storage_status: z.literal("unverified"),
              storage: z.object({ furniture: z.string().length(1), item: text }).optional(),
            }),
          })
          .optional(),
        wall_mount: z.object({ side: z.enum(["n", "e", "s", "w"]), bottom_m: positive, height_m: positive }).optional(),
        runtime_kind: text.optional(),
        runtime_solid: z.boolean().optional(),
        symbol: z.string().length(1),
        name: text,
        owner: text,
        source: text,
        maintainers: references.optional(),
        rect: footprint,
        access: z.array(cell).min(1),
        role: text.optional(),
        cooking_top: cookingTopSchema.optional(),
        potable_vessel_support: waterVesselSupportSchema.optional(),
        potable_vessel: waterVesselDesignSchema.optional(),
        transport_container: transportContainer.optional(),
        seat_symbols: references.optional(),
        owners: references.optional(),
        compartments: references.optional(),
        use_space: z
          .array(z.object({ activity: text, rect: footprint }))
          .min(1)
          .optional(),
      }),
    )
    .optional(),
  connections: z.array(connection).optional(),
  outdoor_journeys: z
    .array(
      z.object({
        map: text,
        activity: text,
        from: z.object({ document: text, room: text, door: cell }),
        to_facility: text,
        arrival: z.literal("washing-upper-landing"),
        width_m: positive,
        points_tiles: z.array(point).min(2),
        status: z.enum(["proposed", "designed"]),
      }),
    )
    .optional(),
  access_routes: z
    .array(
      z.object({ from: z.object({ document: text, room: text.optional(), door: cell }), door: cell, width_m: positive, points_tiles: z.array(point).min(2), status: z.enum(["proposed", "designed"]) }),
    )
    .optional(),
  hot_work: z
    .object({
      process: z.enum(["forge", "wax", "smoking", "metal_repair"]).optional(),
      handler: text,
      heat_sources: references.min(1),
      cooling: references.min(1),
      finished: references.min(1),
      fuel: references.min(1),
    })
    .optional(),
  animal_care: z
    .object({
      kind: z.literal("hen"),
      population_ids: references.min(1),
      keeper: text,
      roosts: references.min(1),
      nests: references.min(1),
      feed: text,
      water: text,
      bedding: text,
      waste: text,
      egg_collection: text,
      capacity_status: z.literal("unverified"),
    })
    .optional(),
  ground_storage: z
    .array(z.object({ furniture: z.string().length(1), contents: text, handler: text }))
    .min(1)
    .optional(),
  laundry_drying: z.object({ racks: z.array(z.object({ furniture: z.string().length(1), handler: text })).min(1), capacity_status: z.literal("unverified") }).optional(),
  meal_service: z.object({ mode: z.literal("staggered"), routine_source: text }).optional(),
  household_meal: householdMealSchema.optional(),
  cargo_routes: z.array(z.object({ activity: text, length_m: positive, width_m: positive, clearance_m: z.number().nonnegative(), points_m: z.array(point).min(2) })).optional(),
  door_leaves: z
    .array(
      doorLeafGeometrySchema.extend({
        vertical_clearance_m: z.object({ bottom: positive, top: positive }).optional(),
        operation: doorOperation.optional(),
        push_operation: doorPush.optional(),
        paired_sequence: z.object({ first: z.enum(["start", "end"]), start: doorOperation, end: doorOperation, transfer_points_m: z.array(point).min(2) }).optional(),
      }),
    )
    .optional(),
  open_door_passages: openDoorPassagesSchema.optional(),
  layout: z
    .object({ cell_m: positive, width: z.number().int().positive(), depth: z.number().int().positive(), floors: z.array(z.object({ floor: integer, rooms: references })).min(1) })
    .nullable()
    .optional(),
  ground_feature: z.object({ kind: z.literal("garden"), index: integer, source_rect_tiles: z.tuple([z.number(), z.number(), z.number(), z.number()]) }).optional(),
  site_plan: z
    .object({
      origin: point,
      rotation_quarters: z.number().int().min(0).max(3),
      status: z.enum(["proposed", "designed"]).optional(),
      unresolved: references.optional(),
      approaches: z.array(entryApproachSchema).optional(),
    })
    .optional(),
  site: z
    .object({
      map: text,
      place: text.optional(),
      rotation_quarters: z.number().int().min(0).max(3).optional(),
      status: z.enum(["proposed", "existing"]).optional(),
      occupied_rect_tiles: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
    })
    .optional(),
  bed_capacity: integer.optional(),
  guest_capacity: integer.optional(),
  sleeping_places: z
    .array(z.object({ id: text, resident: text, kind: text, grid_symbol: text.nullable().optional(), storage_symbol: text.nullable().optional(), storage_id: text.optional() }))
    .optional(),
  bedroom: text.optional(),
  bed_id: text.optional(),
  hot_water_service: hotWaterServiceSchema.optional(),
  sleeping_materials: sleepingMaterialsSchema.optional(),
  textile_wool_lots: textileWoolLotsSchema.optional(),
  kitchen_water_cycle: kitchenWaterCycleSchema.optional(),
  stock_lock: stockLockSchema.optional(),
  stock_lock_site: stockLockSiteSchema.optional(),
  road_plan: mapRoadPlanSchema.optional(),
  parked_cart_departure: parkedCartDepartureSchema.optional(),
  dishwater_capture: dishwaterCaptureSchema.optional(),
  wool_preparation: woolPreparationSchema.optional(),
  potable_water_supply: potableWaterSupplySchema.optional(),
  water_collection: potableWaterCollectionSchema.optional(),
  routine_source: z.object({ file: text, export: text, key: text }).optional(),
  work_uses: z.array(roomWorkUseSchema).optional(),
  appearance_source: z.object({ file: text, export: text, key: text }).optional(),
  runtime_station: text.optional(),
  storage_ids: references.optional(),
  workers: references.optional(),
  work_rooms: references.optional(),
  learning_rooms: references.optional(),
  classroom: z
    .object({
      teacher_places: z.array(z.object({ resident: text, at: cell })).optional(),
      teachers: references.min(1),
      routine_map: text,
      places: z.array(z.object({ resident: text, chair: z.string().length(1), table: z.string().length(1) })).min(1),
    })
    .optional(),
  sanitation_role: z.enum(["privy", "treatment", "nonfood_planting"]).optional(),
  owner_building: text.optional(),
  caretakers: references.optional(),
  accepts_streams: z.array(wasteStream).optional(),
  material_routes: z
    .array(
      z.object({
        stream: wasteStream,
        to: text,
        container_id: text,
        container_symbol: z.string().length(1).nullable(),
        carry_plan: z.object({ carrier: text, max_fill_l: positive }).optional(),
        status: z.enum(["proposed", "designed"]),
      }),
    )
    .optional(),
  private_for: references.min(1).optional(),
  handling_plan: z.object({ max_hand_load_kg: positive, status: z.enum(["proposed", "designed"]), basis: text }).optional(),
  personal_storage: personalStorageSchema.optional(),
  textile_orders: textileOrdersSchema.optional(),
  town_district_plan: townDistrictPlanSchema.optional(),
  resident_proposal: residentProposalSchema.optional(),
  proposed_district: text.optional(),
  district_reservation: districtReservationSchema.optional(),
  door_leaf_inventory: buildingDoorInventorySchema.optional(),
  maps: references.optional(),
  rooms: references.optional(),
  buildings: references.optional(),
  residents: references.optional(),
  monsters: references.optional(),
  habitats: references.optional(),
  facilities: references.optional(),
  bedroom_candidates: references.optional(),
  occupants: references.optional(),
  users: references.optional(),
  design_dependencies: references.optional(),
  ecology: z.object({ diet: text, water: text, rest: text, social: text, human_contact: text, reaction: text }).optional(),
  materials: z.array(z.object({ item: text, origin: text, users: references, use: text })).optional(),
})
export function assertSettingShape(metadata: unknown): void {
  const result = structure.safeParse(metadata)
  if (!result.success) throw Error(`Invalid settings structure: ${result.error.issues.map((issue) => issue.path.join(".") || "metadata").join(", ")}`)
}
