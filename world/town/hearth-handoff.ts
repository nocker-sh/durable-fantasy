export type HandoffOrientation = "carry_vertical" | "work_vertical" | "work_horizontal" | "work_sloped"

export type HandoffPose = { grip_m: [number, number, number]; body_m: [number, number]; orientation: HandoffOrientation }

export type HearthHandoff = { stage_area: [number, number, number, number]; grip_from_blade_m: number; staging_body_m: [number, number]; steps: HandoffPose[] }
