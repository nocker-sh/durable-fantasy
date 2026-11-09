// A player's opaque identifier. Ownership is verified separately by world/server/session.ts;
// knowing an identifier is not sufficient once the browser credential has been registered.
import { z } from "zod"

export const playerId = z.guid()
