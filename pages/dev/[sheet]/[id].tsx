import { useParams } from "@void/react";
import { DevPage } from "#/dev/catalog.tsx";
import { sheetOf } from "#/dev/db.tsx";
import { SheetRow } from "#/dev/db-view.tsx";
import { DETAIL } from "#/dev/details.tsx";

export default function RowPage() {
  const { sheet, id } = useParams<{ sheet: string; id: string }>();
  const s = sheetOf(sheet);
  const key = decodeURIComponent(id);
  const Extra = DETAIL[sheet];
  return (
    <DevPage>
      {() =>
        s ? (
          <SheetRow sheet={s} id={key}>
            {Extra && <Extra id={key} />}
          </SheetRow>
        ) : (
          <p className="text-sm">{sheet}</p>
        )
      }
    </DevPage>
  );
}
