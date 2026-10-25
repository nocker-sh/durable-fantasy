import type { ReactNode } from "react";

export const hrefOf = (sheetId: string, id: string) => `/dev/${sheetId}/${encodeURIComponent(id)}`;

/** A named row link; resolving the row is the caller's responsibility. */
export function RowLink({ sheet, id, children }: { sheet: string; id: string; children: ReactNode }) {
  return (
    <a href={hrefOf(sheet, id)} className="underline-offset-4 hover:underline">
      {children}
    </a>
  );
}
