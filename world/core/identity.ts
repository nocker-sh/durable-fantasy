// Players are known by a random id their browser keeps. There are no accounts yet, so whoever
// holds the id owns the belongings.
import * as v from "valibot";

export const playerId = v.pipe(v.string(), v.uuid());
