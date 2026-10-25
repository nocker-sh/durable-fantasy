// Players are known by a random id their browser keeps. There are no accounts yet, so whoever
// holds the id owns the belongings.
import { z } from "zod"

export const playerId = z.guid()
