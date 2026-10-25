import type { Ref } from "./schema.ts";
import { sheetOf, rowOf } from "./registry.ts";

import { RowLink } from "./links.tsx";
export { hrefOf } from "./links.tsx";

/** A link to a row, by its name; plain text where the row is not in any sheet. */
export function Link({ r }: { r: Ref }) {
  const s = sheetOf(r.sheet);
  const row = rowOf(r.sheet, r.id);
  if (!s || row === undefined) return <>{r.id}</>;
  return (
    <RowLink sheet={r.sheet} id={r.id}>
      {s.name(row)}
    </RowLink>
  );
}
