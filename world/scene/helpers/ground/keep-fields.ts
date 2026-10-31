import type { Fields } from "#/world/maps/ground/types"
import { GROUND_VERSION as VERSION } from "#/world/scene/ground-version"
import { STORE } from "#/world/scene/ground"
import { db } from "#/world/scene/helpers/ground/db"

export async function keepFields(map: string, f: Fields) {
  const d = await db()
  d?.transaction(STORE, "readwrite").objectStore(STORE).put(f, `${map}:${VERSION}:fields`)
}
