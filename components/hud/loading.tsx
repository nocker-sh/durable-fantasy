import "#resources/packages/fontsource/shippori-mincho/400"
import { useEffect, useMemo, useState } from "react"
import { flavorFor } from "#/world/town/flavor"
import { useGameState } from "#/hooks/use-game-state"
import { Between } from "#/components/hud/between"

const STEPS: Record<string, number> = { "読み込んでいます…": 0.1, "地面を描いています…": 0.3, "街を建てています…": 0.55, "住民を描いています…": 0.8 }

import { FADE_MS } from "#/components/hud/loading-rules"

export function Loading() {
  const loading = useGameState((s) => s.loading)
  const failed = useGameState((s) => s.failed)
  const failureMessage = useGameState((s) => s.failureMessage)
  const departed = useGameState((s) => s.departed)
  const map = useGameState((s) => s.map.id)
  // the last thing shown stays up while it fades
  const shownState = useState(loading),
    shown = shownState[0],
    setShown = shownState[1]
  const fadingState = useState(false),
    fading = fadingState[0],
    setFading = fadingState[1]
  useEffect(() => {
    if (loading) {
      setShown(loading)
      setFading(false)
      return
    }
    setFading(true)
    const t = setTimeout(() => setShown(null), FADE_MS)
    return () => clearTimeout(t)
  }, [loading])
  const passage = useMemo(() => flavorFor(map).text, [map])
  if (departed)
    return (
      <Between title="Durable Fantasy">
        <button type="button" onClick={() => location.reload()} className="text-sm text-[#d8d4cc]">
          町に戻る
        </button>
      </Between>
    )
  if (failed)
    return (
      <Between title={failureMessage ? "キャラクターを読み込めなかった" : "町を描けなかった"} passage={failureMessage}>
        <button type="button" onClick={() => location.reload()} className="text-[12px] tracking-[0.2em] text-[#9a968e] underline-offset-4 hover:underline">
          読み込み直す
        </button>
      </Between>
    )
  if (!shown) return null
  return <Between title={shown.map} progress={loading ? (STEPS[shown.text] ?? 0.92) : 1} passage={passage} fading={fading} />
}
