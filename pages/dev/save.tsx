import { useState } from "react"
import { Card } from "#/components/ui/card"
import { CardContent } from "#/components/ui/card-content"
import { CardHeader } from "#/components/ui/card-header"
import { CardTitle } from "#/components/ui/card-title"
import { DevPage } from "#/dev/catalog"
import { ResetSaveButton } from "#/dev/reset-save-button"

/** This browser's save: start over from character creation. */
export default function DevSave() {
  const doneState = useState(false),
    done = doneState[0],
    setDone = doneState[1]

  return (
    <DevPage>
      <Card size="sm" className="max-w-md">
        <CardHeader>
          <CardTitle>セーブデータ</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          {done ? (
            <p>
              初期化した。
              <a className="underline" href="/">
                ゲームを開く
              </a>
            </p>
          ) : (
            <ResetSaveButton onDone={() => setDone(true)} />
          )}
        </CardContent>
      </Card>
    </DevPage>
  )
}
