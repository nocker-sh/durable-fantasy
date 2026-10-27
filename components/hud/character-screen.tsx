import { useEffect, useState } from "react"
import { LOOKS } from "#/world/game.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Input } from "#/components/game/input.tsx"
import { Modal } from "#/components/game/modal.tsx"
import { NAME_MAX, NECK_KINDS, NECK_RAMPS, profileNameSchema, type NeckKind } from "#/world/core/player.ts"
import { RAMPS } from "#/world/scene/pix.ts"
import { readProfileDraft, writeProfileDraft } from "#/world/client/profile-draft.ts"

const NECK_LABEL: Record<NeckKind, string> = { muffler: "マフラー", stole: "ストール", scarf: "スカーフ" }
const rampColor = (ramp: string) => `rgb(${RAMPS[ramp][3].join(",")})`

export function CharacterScreen() {
  const game = useGame()
  const player = useGameState((s) => s.player)
  const portraits = useGameState((s) => s.portraits)
  const busy = useGameState((s) => s.busy)
  const online = useGameState((s) => s.online)
  const creating = player?.profileComplete === false
  const [draft] = useState(() => (creating ? readProfileDraft(localStorage) : null))
  const [name, setName] = useState(draft?.name ?? (creating ? "" : (player?.name ?? "")))
  const [look, setLook] = useState(draft?.look ?? player?.look ?? 0)
  const [neck, setNeck] = useState<NeckKind>(draft?.neck ?? player?.neck ?? "muffler")
  const [ramp, setRamp] = useState<(typeof NECK_RAMPS)[number]>(draft?.ramp ?? (player?.neckRamp as (typeof NECK_RAMPS)[number]) ?? "cRed")
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    if (creating) writeProfileDraft(localStorage, { name, look, neck, ramp })
  }, [creating, name, look, neck, ramp])
  useEffect(() => {
    let live = true
    game.previewPortrait(look, neck, ramp, (url) => live && setPreview(url))
    return () => {
      live = false
    }
  }, [game, look, neck, ramp])
  if (!player) return null
  const parsedName = profileNameSchema.safeParse(name)
  const changed = creating || (parsedName.success && parsedName.data !== player.name) || look !== player.look || neck !== player.neck || ramp !== player.neckRamp
  const close = creating || saving ? undefined : () => game.openModal("system")
  return (
    <Modal title={creating ? "キャラクターを作る" : "キャラクター"} onClose={close} className="w-[400px] max-w-[calc(100vw-24px)]">
      <fieldset disabled={saving} className="flex min-w-0 gap-4">
        <div className="flex flex-col items-center gap-2">
          <div className="ui-well flex h-[150px] w-[110px] items-end justify-center bg-[radial-gradient(circle_at_50%_40%,#2a3050,#0b0c15)]">
            {(preview ?? portraits[look]) && <img src={preview ?? portraits[look]} alt="" className="mb-2 h-[132px] max-w-none" />}
          </div>
          <div className="flex items-center gap-1">
            <Button size="icon-sm" aria-label="前の姿" onClick={() => setLook((look + LOOKS.length - 1) % LOOKS.length)}>
              ◀
            </Button>
            <span className="w-16 text-center font-head text-xs">{LOOKS[look].label}</span>
            <Button size="icon-sm" aria-label="次の姿" onClick={() => setLook((look + 1) % LOOKS.length)}>
              ▶
            </Button>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <label className="flex flex-col gap-1 font-head text-xs text-text-dim">
            名前
            <Input value={name} maxLength={NAME_MAX} disabled={saving} onChange={(e) => setName(e.target.value)} aria-invalid={!!name && !parsedName.success} />
          </label>
          <div className="flex flex-col gap-1 font-head text-xs text-text-dim">
            首巻き
            <div className="flex gap-1">
              {NECK_KINDS.map((k) => (
                <Button key={k} size="sm" variant={neck === k ? "primary" : "default"} onClick={() => setNeck(k)}>
                  {NECK_LABEL[k]}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-6 gap-1 pt-1">
              {NECK_RAMPS.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-label={r}
                  aria-pressed={ramp === r}
                  onClick={() => setRamp(r)}
                  style={{ background: rampColor(r) }}
                  className="size-6 cursor-pointer shadow-[inset_0_0_0_1px_rgb(0_0_0/0.5)] aria-pressed:shadow-[0_0_0_2px_var(--color-brass-hi)]"
                />
              ))}
            </div>
          </div>
          <p className="font-body text-xs leading-relaxed text-text-dim">名前と見た目は、ほかのプレイヤーにも見える。あとから変更できる。</p>
          {name && !parsedName.success && (
            <p role="alert" className="text-xs">
              名前には空白だけの文字列や制御文字は使えません。
            </p>
          )}
          {error && (
            <p role="alert" className="text-xs">
              {error}
            </p>
          )}
          {online !== "online" && (
            <p role="status" className="text-xs">
              接続が戻るまで、このままお待ちください。
            </p>
          )}
          <div className="mt-auto flex justify-end gap-2">
            {!creating && (
              <Button disabled={saving} onClick={close}>
                戻る
              </Button>
            )}
            <Button
              variant="primary"
              disabled={!changed || !parsedName.success || busy || saving || online !== "online"}
              onClick={async () => {
                setSaving(true)
                setError(null)
                try {
                  if (await game.setProfile(name, look, neck, ramp)) {
                    writeProfileDraft(localStorage, null)
                    game.openModal(creating ? "welcome" : null)
                  } else setError("保存できませんでした。内容を確認して、もう一度お試しください。")
                } catch {
                  setError("保存できませんでした。もう一度お試しください。")
                } finally {
                  setSaving(false)
                }
              }}
            >
              {saving ? "保存中…" : creating ? "この姿で始める" : "決める"}
            </Button>
          </div>
        </div>
      </fieldset>
    </Modal>
  )
}
