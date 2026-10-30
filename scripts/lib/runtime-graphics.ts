export type RuntimeOmission = { floor: number; name: string }

export type RuntimeGraphicsReport = { source: string; pieces: readonly RuntimeOmission[] }
