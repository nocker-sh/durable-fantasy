import { useParams } from "@void/react"
import { DevPage } from "#/dev/catalog"
import { sheetOf } from "#/dev/sheets/sheet-of"
import { SheetRow } from "#/dev/sheet-row"
import { DETAIL } from "#/dev/details"

export default function RowPage() {
  const sheetSource = useParams<{ sheet: string; id: string }>(),
    sheet = sheetSource.sheet,
    id = sheetSource.id
  const s = sheetOf(sheet)
  const key = decodeURIComponent(id)
  const Extra = DETAIL[sheet]
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
  )
}
