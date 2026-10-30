// The system menu and the screens it opens (ui.md §3.14): character, controls, back to the game.
import { useEffect } from "react"
import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Kbd } from "#/components/game/kbd"
import { Modal } from "#/components/game/modal"
import { CHANNEL_CAP } from "#/world/channels"

import { CharacterScreen } from "./character-screen"
import { Welcome } from "./welcome"

export function SystemModals() {
  const modal = useGameState((s) => s.modal)
  const creating = useGameState((s) => s.player?.profileComplete === false)
  if (creating) return <CharacterScreen />
  if (modal === "system") return <SystemMenu />
  if (modal === "character") return <CharacterScreen />
  if (modal === "welcome") return <Welcome />
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

const CONTROLS: [string[], string][] = [
  [["クリック"], "そのマスへ歩く / NPC に話しかける"],
  [["W A S D", "矢印"], "歩く"],
  [["生き物をクリック"], "近づいて攻撃"],
  [["Z"], "座って休む / 立つ"],
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
        {CONTROLS.map((entry) => {
          const keys = entry[0]
          const what = entry[1]
          return (
            <div key={what} className="contents">
              <dt className="flex gap-1">
                {keys.map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </dt>
              <dd>{what}</dd>
            </div>
          )
        })}
      </dl>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => game.openModal("system")}>戻る</Button>
      </div>
    </Modal>
  )
}
