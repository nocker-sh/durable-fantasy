import { z } from "zod"

const text = z.string().trim().min(1)
export const roomWorkUseSchema = z
  .object({
    resident: text,
    routine_source: z.object({ file: z.literal("world/town/routines.ts"), key: text, doing: text }),
    furniture: text,
    seat_symbol: text,
    mode: text,
    storage_room: text,
    storage_symbol: text,
    status: z.enum(["proposed", "designed"]),
    pending: z.array(text),
    kit: z.object({ owner: text, proposed_box_maker: text, proposed_needle_maker: text, thread_source: text, storage_compartment: text }),
  })
  .refine((use) => (use.status === "designed" ? use.pending.length === 0 : use.pending.length > 0), "Work status disagrees with pending design")
