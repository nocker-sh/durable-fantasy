import type { Ref } from "#/dev/sheets/schema"

export const ref = (sheet: string, id: string | undefined | null, as: string): Ref[] => (id ? [{ sheet, id, as }] : [])
