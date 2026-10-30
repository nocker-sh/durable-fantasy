import { useEffect, useState } from "react"
import { LOOKS } from "#/world/town/travellers"
import "#resources/components/hud/character-creation"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Input } from "#/components/game/input"
import { Modal } from "#/components/game/modal"
import { NAME_MAX } from "#/world/core/player-rules"
import { NECK_KINDS } from "#/world/core/player-rules"
import { NECK_RAMPS } from "#/world/core/player-rules"
import { profileNameSchema } from "#/world/core/player-schema"
import type { NeckKind } from "#/world/core/player-types"
import { RAMPS } from "#/world/scene/pix"
import { readProfileDraft } from "#/world/client/read-profile-draft"
import { writeProfileDraft } from "#/world/client/write-profile-draft"
import { NECK_COLOR_LABELS } from "#/components/hud/neck-color-labels"
import { keepDialogTabFocus } from "#/components/game/keep-dialog-tab-focus"

const NECK_LABEL: Record<NeckKind, string> = { muffler: "マフラー", stole: "ストール", scarf: "スカーフ" }
const rampColor = (ramp: string) => `rgb(${RAMPS[ramp][3].join(",")})`

export function CharacterScreen() {
  const game = useGame()
  const player = useGameState((s) => s.player)
  const portraits = useGameState((s) => s.portraits)
  const busy = useGameState((s) => s.busy)
  const online = useGameState((s) => s.online)
  const creating = player?.profileComplete === false
  const draftState = useState(() => (creating ? readProfileDraft(localStorage) : null)),
    draft = draftState[0]
  const nameState = useState(draft?.name ?? (creating ? "" : (player?.name ?? ""))),
    name = nameState[0],
    setName = nameState[1]
  const lookState = useState(draft?.look ?? player?.look ?? 0),
    look = lookState[0],
    setLook = lookState[1]
  const neckState = useState<NeckKind>(draft?.neck ?? player?.neck ?? "muffler"),
    neck = neckState[0],
    setNeck = neckState[1]
  const rampState = useState<(typeof NECK_RAMPS)[number]>(draft?.ramp ?? (player?.neckRamp as (typeof NECK_RAMPS)[number]) ?? "cRed"),
    ramp = rampState[0],
    setRamp = rampState[1]
  const previewState = useState<string | null>(null),
    preview = previewState[0],
    setPreview = previewState[1]
  const savingState = useState(false),
    saving = savingState[0],
    setSaving = savingState[1]
  const errorState = useState<string | null>(null),
    error = errorState[0],
    setError = errorState[1]
  useEffect(() => {
    if (creating) writeProfileDraft(localStorage, { name, look, neck, ramp })
  }, [creating, name, look, neck, ramp])
  useEffect(() => {
    let live = true
    game.previewPortrait({ look: look, neck: neck, neckRamp: ramp, ready: (url) => live && setPreview(url) })
    return () => {
      live = false
    }
  }, [game, look, neck, ramp])
  if (!player) return null
  const parsedName = profileNameSchema.safeParse(name)
  const changed = creating || (parsedName.success && parsedName.data !== player.name) || look !== player.look || neck !== player.neck || ramp !== player.neckRamp
  const close = creating || saving ? undefined : () => game.openModal("system")
  const editor = (
    <fieldset disabled={saving} className={creating ? "creation-layout" : "flex min-w-0 gap-4"}>
      <div className={creating ? "creation-appearance" : "flex flex-col items-center gap-2"}>
        <div className={creating ? "creation-stage" : "ui-well flex h-[150px] w-[110px] items-end justify-center bg-[radial-gradient(circle_at_50%_40%,#2a3050,#0b0c15)]"}>
          {(preview ?? portraits[look]) && <img src={preview ?? portraits[look]} alt="" className={creating ? "creation-portrait" : "mb-2 h-[132px] max-w-none"} />}
        </div>
        <div className={creating ? "creation-look-navigation" : "flex items-center gap-1"}>
          <Button size="icon-sm" aria-label="前の姿" onClick={() => setLook((look + LOOKS.length - 1) % LOOKS.length)}>
            ◀
          </Button>
          <span className="w-16 text-center font-head text-xs">{LOOKS[look].label}</span>
          <Button size="icon-sm" aria-label="次の姿" onClick={() => setLook((look + 1) % LOOKS.length)}>
            ▶
          </Button>
        </div>
        {creating && (
          <div className="creation-looks" aria-label="姿を選ぶ">
            {LOOKS.map((preset, index) => (
              <button key={preset.label} type="button" aria-label={`姿：${preset.label}`} aria-pressed={look === index} onClick={() => setLook(index)}>
                {portraits[index] && <img src={portraits[index]} alt="" />}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className={creating ? "creation-details" : "flex flex-1 flex-col gap-3"}>
        <label className="flex flex-col gap-1 font-head text-xs text-text-dim">
          名前
          <Input value={name} maxLength={NAME_MAX} disabled={saving} onChange={(e) => setName(e.target.value)} aria-invalid={!!name && !parsedName.success} />
        </label>
        <div className="flex flex-col gap-1 font-head text-xs text-text-dim">
          首巻き
          <div className="flex gap-1">
            {NECK_KINDS.map((k) => (
              <Button key={k} size="sm" variant={neck === k ? "primary" : "default"} aria-pressed={neck === k} onClick={() => setNeck(k)}>
                {NECK_LABEL[k]}
              </Button>
            ))}
          </div>
          <div className={creating ? "creation-colors" : "grid grid-cols-6 gap-1 pt-1"}>
            {NECK_RAMPS.map((r) => (
              <button
                key={r}
                type="button"
                aria-label={NECK_COLOR_LABELS[r]}
                aria-pressed={ramp === r}
                onClick={() => setRamp(r)}
                style={{ background: rampColor(r) }}
                className="size-6 cursor-pointer shadow-[inset_0_0_0_1px_rgb(0_0_0/0.5)] aria-pressed:shadow-[0_0_0_2px_var(--color-brass-hi)]"
              />
            ))}
          </div>
        </div>
        {!creating && <p className="font-body text-xs leading-relaxed text-text-dim">名前と見た目は、ほかのプレイヤーにも見える。あとから変更できる。</p>}
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
        <div className={creating ? "creation-submit" : "mt-auto flex justify-end gap-2"}>
          {!creating && (
            <Button disabled={saving} onClick={close}>
              戻る
            </Button>
          )}
          <Button
            variant="primary"
            className={creating ? "creation-start" : undefined}
            disabled={!changed || !parsedName.success || busy || saving || online !== "online"}
            onClick={async () => {
              setSaving(true)
              setError(null)
              try {
                if (await game.setProfile({ name: name, look: look, neck: neck, neckRamp: ramp })) {
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
            {saving ? "保存中…" : creating ? "はじめる" : "決める"}
          </Button>
        </div>
      </div>
    </fieldset>
  )
  if (creating)
    return (
      <dialog
        className="character-creation"
        role="dialog"
        aria-modal="true"
        aria-label="キャラクターを作る"
        ref={(dialog) => {
          if (!dialog) return
          if (!dialog.open) dialog.showModal()
          if (saving) dialog.focus()
        }}
        onCancel={(event) => event.preventDefault()}
        onKeyDown={keepDialogTabFocus}
      >
        <div className="creation-shell">
          <h1 className="creation-title">キャラクター作成</h1>
          {editor}
        </div>
      </dialog>
    )
  return (
    <Modal title="キャラクター" onClose={close} className="w-[400px] max-w-[calc(100vw-24px)]">
      {editor}
    </Modal>
  )
}
