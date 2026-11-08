import { MAPS, OPEN_FIELDS } from "#/world/maps"

/** Only defined maps may be entered; unbuilt cities remain unavailable. */
export const isOpen = (id: string) => Object.hasOwn(MAPS, id) && (MAPS[id].kind !== "field" || OPEN_FIELDS.includes(id))
