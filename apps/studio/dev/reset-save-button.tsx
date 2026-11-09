// Dev only: wipe this browser's save with one confirm step (the debug panel).
import { useState } from "react"
import { Button } from "#/components/ui/button"
import { resetSave } from "#/world/client/reset-save"

export function ResetSaveButton(inputProps: { onDone: () => void }) {
  const onDone = inputProps.onDone

  const stepState = useState<"idle" | "confirm" | "busy" | "failed">("idle"),
    step = stepState[0],
    setStep = stepState[1]

  if (step === "idle" || step === "failed")
    return (
      <div className="grid gap-1">
        <Button variant="destructive" size="sm" onClick={() => setStep("confirm")}>
          セーブデータを初期化
        </Button>
        {step === "failed" && <p className="text-xs text-destructive">初期化できなかった。取引の途中かもしれない。</p>}
      </div>
    )
  return (
    <div className="grid gap-2">
      <p className="text-xs text-muted-foreground">キャラクター・持ち物・お金・取引所の注文と受け取り箱・会話の記録が消えて、キャラクター作成からやり直しになる。元に戻せない。</p>
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          disabled={step === "busy"}
          onClick={async () => {
            setStep("busy")
            try {
              await resetSave()
            } catch {
              setStep("failed")
              return
            }
            setStep("idle")
            onDone()
          }}
        >
          本当に初期化する
        </Button>
        <Button variant="outline" size="sm" disabled={step === "busy"} onClick={() => setStep("idle")}>
          やめる
        </Button>
      </div>
    </div>
  )
}
