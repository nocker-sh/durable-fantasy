// The system menu and the screens it opens (ui.md §3.14): character, controls, back to the game.
import { useEffect, useState } from "react"
import { LOOKS } from "#/world/game.ts"
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Input } from "#/components/game/input.tsx"
import { Kbd } from "#/components/game/kbd.tsx"
import { Modal } from "#/components/game/modal.tsx"
import { NAME_MAX, NECK_KINDS, NECK_RAMPS, profileNameSchema, type NeckKind } from "#/world/core/player.ts"
import { RAMPS } from "#/world/scene/pix.ts"
import { CHANNEL_CAP } from "#/world/channels.ts"
import { readProfileDraft, writeProfileDraft } from "#/world/client/profile-draft.ts"

const NECK_LABEL: Record<NeckKind, string> = { muffler: "マフラー", stole: "ストール", scarf: "スカーフ" }
const rampColor = (ramp: string) => `rgb(${RAMPS[ramp][3].join(",")})`

export function SystemModals() {
  const modal = useGameState((s) => s.modal)
  const creating = useGameState((s) => s.player?.profileComplete === false)
  if (creating) return <CharacterScreen />
  if (modal === "system") return <SystemMenu />
  if (modal === "character") return <CharacterScreen />
  if (modal === "help") return <Controls />
  if (modal === "channel") return <Channels />
  return null
}

function SystemMenu() {
  const game = useGame()
  return (
    <Modal title="メニュー" onClose={() => game.openModal(null)} className="w-60">
      <div className="flex flex-col gap-2">
        <Button onClick={() => game.openModal("character")}>キャラクター</Button>
        <Button onClick={() => game.openModal("help")}>操作一覧</Button>
        <Button onClick={() => game.openModal("channel")}>チャンネル</Button>
        <Button onClick={() => game.leave()}>ゲームを閉じる</Button>
        <Button
          onClick={() => {
            game.resetLayout()
            game.openModal(null)
          }}
        >
          ウィンドウの配置を戻す
        </Button>
        <div className="ui-rule my-1" />
        <Button variant="primary" onClick={() => game.openModal(null)}>
          ゲームに戻る
        </Button>
      </div>
    </Modal>
  )
}

/** Channels of this map in this town and how full they are; pick one to move there (channels.ts). */
function Channels() {
  const game = useGame()
  const room = useGameState((s) => s.room)
  const map = useGameState((s) => s.map)
  useEffect(() => {
    void game.refreshChannels()
  }, [game])
  if (!room) return null
  const listed = [...new Set([...Object.keys(room.channels).map(Number), room.channel])].sort((a, b) => a - b)
  const next = listed.length ? Math.max(...listed) + 1 : 2
  return (
    <Modal title="チャンネル" onClose={() => game.openModal("system")} className="w-72">
      <p className="mb-2 font-body text-xs text-text-dim">
        町 {room.world} の「{map.name}」。一つのチャンネルには {CHANNEL_CAP} 人まで。
      </p>
      <ul className="flex flex-col gap-1">
        {[...listed, next].map((ch) => {
          const n = room.channels[ch] ?? 0
          const here = ch === room.channel
          return (
            <li key={ch} className="ui-well flex items-center gap-2 px-2 py-1 font-head text-xs">
              <span className="w-16">ch.{ch}</span>
              <span className="flex-1 text-text-dim">{ch === next && !n ? "新しく開く" : `${n} / ${CHANNEL_CAP} 人`}</span>
              {here ? (
                <span className="text-me">ここ</span>
              ) : (
                <Button
                  size="sm"
                  disabled={n >= CHANNEL_CAP}
                  onClick={() => {
                    game.changeChannel(ch)
                    game.openModal(null)
                  }}
                >
                  移る
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

function CharacterScreen() {
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
                    game.openModal(null)
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

const CONTROLS: [string[], string][] = [
  [["クリック"], "そのマスへ歩く / NPC に話しかける"],
  [["ドラッグ"], "カメラを 45° ずつ回す"],
  [["Shift+Q", "Shift+E"], "カメラを左 / 右に回す"],
  [["ホイール"], "ズーム"],
  [["Enter"], "チャット"],
  [["Space"], "会話を進める"],
  [["1", "…", "0"], "ショートカット（会話では選択肢）"],
  [["I", "Alt+E"], "持ち物"],
  [["E", "Alt+Q"], "装備"],
  [["C", "Alt+A"], "能力"],
  [["M"], "地図"],
  [["Tab"], "ミニマップ"],
  [["Alt+C"], "チャットのウィンドウ"],
  [["Esc"], "閉じる / メニュー"],
]

function Controls() {
  const game = useGame()
  return (
    <Modal title="操作一覧" onClose={() => game.openModal("system")} className="w-[380px]">
      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 font-body text-[13px]">
        {CONTROLS.map(([keys, what]) => (
          <div key={what} className="contents">
            <dt className="flex gap-1">
              {keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => game.openModal("system")}>戻る</Button>
      </div>
    </Modal>
  )
}
