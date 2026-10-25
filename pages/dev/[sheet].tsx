import { useParams } from "@void/react"
import { DevPage } from "#/dev/catalog.tsx"
import { sheetOf } from "#/dev/db.tsx"
import { SheetList } from "#/dev/db-view.tsx"

export default function SheetPage() {
  const { sheet } = useParams<{ sheet: string }>()
  const s = sheetOf(sheet)
  return <DevPage>{() => (s ? <SheetList sheet={s} /> : <p className="text-sm">{sheet}</p>)}</DevPage>
}
