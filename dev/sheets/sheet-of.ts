import { SHEETS } from "#/dev/sheets/registry"

export const sheetOf = (id: string) => SHEETS.find((s) => s.id === id)
