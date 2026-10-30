import { useParams } from "@void/react"
import { DevPage } from "#/dev/catalog"
import { sheetOf } from "#/dev/sheets/sheet-of"
import { SheetList } from "#/dev/sheet-list"

export default function SheetPage() {
  const sheetSource = useParams<{ sheet: string }>(),
    sheet = sheetSource.sheet
  const s = sheetOf(sheet)
  return <DevPage>{() => (s ? <SheetList sheet={s} /> : <p className="text-sm">{sheet}</p>)}</DevPage>
}
