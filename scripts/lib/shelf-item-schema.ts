import { z } from "zod"

const text = z.string().refine((value) => value.trim().length > 0)
const number = z.number()
const retrieval = z
  .object({
    withdraw_m: number,
    body_radius_m: number,
    body_across_m: number,
    body_start_m: number,
    body_end_m: number,
    space_index: number,
  })
  .transform((shape) => ({
    withdraw: shape.withdraw_m,
    bodyRadius: shape.body_radius_m,
    bodyAcross: shape.body_across_m,
    bodyStart: shape.body_start_m,
    bodyEnd: shape.body_end_m,
    space: shape.space_index,
  }))
const lidHandle = z
  .object({ span_m: number, depth_m: number, height_m: number, thickness_m: number })
  .transform((shape) => ({ span: shape.span_m, depth: shape.depth_m, height: shape.height_m, thickness: shape.thickness_m }))
const tool = z.object({ handle_width_m: number, blade_length_m: number }).transform((shape) => ({ handleWidth: shape.handle_width_m, bladeLength: shape.blade_length_m }))

/** Validate the authored units before converting to the shared storage geometry contract. */
export const shelfItemSchema = z
  .object({
    id: text,
    name: text,
    owner: text,
    source: text,
    kind: z.enum(["papers", "box", "linen", "tool"]),
    board: number,
    across_m: number,
    from_back_m: number,
    width_m: number,
    height_m: number,
    depth_m: number,
    box_material: z.enum(["wood", "iron"]).optional(),
    wall_thickness_m: number.optional(),
    lid_thickness_m: number.optional(),
    lid_lift_m: number.optional(),
    lid_handle: lidHandle.optional(),
    tool: tool.optional(),
    retrieval: retrieval.optional(),
  })
  .superRefine((shape, context) => {
    if (shape.kind !== "box" && [shape.wall_thickness_m, shape.lid_thickness_m, shape.lid_lift_m, shape.lid_handle].some((value) => value !== undefined))
      context.addIssue({ code: "custom", message: "Box properties need box contents" })
    if (shape.kind !== "box" && shape.box_material !== undefined) context.addIssue({ code: "custom", path: ["box_material"], message: "Box material needs box contents" })
    if ((shape.kind === "tool") !== (shape.tool !== undefined)) context.addIssue({ code: "custom", path: ["tool"], message: "Tool shape needs tool contents" })
  })
  .transform((shape) => ({
    id: shape.id,
    kind: shape.kind,
    boxMaterial: shape.box_material,
    wall: shape.wall_thickness_m,
    lid: shape.lid_thickness_m,
    lidHandle: shape.lid_handle,
    lidLift: shape.lid_lift_m,
    tool: shape.tool,
    retrieval: shape.retrieval,
    board: shape.board,
    across: shape.across_m,
    fromBack: shape.from_back_m,
    width: shape.width_m,
    height: shape.height_m,
    depth: shape.depth_m,
  }))
