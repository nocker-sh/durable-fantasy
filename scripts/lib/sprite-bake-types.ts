import type { z } from "zod"
import type { spriteBakePlanSchema } from "#/scripts/lib/sprite-bake-plan-schema"
export type SpriteBakePlan = z.infer<typeof spriteBakePlanSchema>
export type SpriteBakeJob = Readonly<{ resident: number; anim: string; view: number }>

export type SpriteBakeLease = Readonly<{ token: string; release: () => void }>

export type SpriteBakeDrawInput = SpriteBakeJob & Readonly<{ rendererVersion: number; frame: readonly [number, number]; frames: number; residentName: string; lookKey: string }>
