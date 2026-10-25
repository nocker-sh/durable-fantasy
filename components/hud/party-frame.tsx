// The party (game-system.md §10, core/party.ts): each member's HP and where they are, under our own
// frame. The leader chooses whether experience is each one's own or shared evenly.
import { useGame, useGameState } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Meter } from "#/components/game/meter.tsx"
import { Panel } from "#/components/game/panel.tsx"

export function PartyFrame() {
  const game = useGame()
  const party = useGameState((s) => s.party)
  if (!party) return null
  return (
    <Panel className="pointer-events-auto absolute top-[132px] left-3 flex w-[276px] flex-col gap-1.5 p-2">
      <div className="flex items-center justify-between font-head text-xs">
        <span className="text-brass-hi">パーティ（{party.members.length}人）</span>
        <span className="flex gap-1">
          <Button size="sm" disabled={!party.leading} onClick={() => game.setPartyMode(party.mode === "own" ? "even" : "own")} title={party.leading ? "経験値の分け方を変える" : "リーダーが決める"}>
            {party.mode === "own" ? "経験値: 各自" : "経験値: 均等"}
          </Button>
          <Button size="sm" onClick={() => game.leaveParty()}>
            抜ける
          </Button>
        </span>
      </div>
      <ul className="flex flex-col gap-1">
        {party.members.map((m, i) => (
          <li key={i} className={`flex flex-col gap-0.5 ${m.away ? "opacity-50" : ""}`}>
            <div className="flex items-baseline justify-between gap-2 font-body text-[12px]">
              <span className="truncate">
                {m.leader ? "★ " : ""}
                {m.name}
                {m.me ? "（自分）" : ""}
              </span>
              <span className="shrink-0 font-head text-[11px] text-text-dim">
                Lv {m.level} ・ {m.map}
              </span>
            </div>
            <Meter tone="hp" value={m.hp} max={m.maxHp} className="h-[8px]" aria-label={`${m.name}の HP`} showValue={false} />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/** Someone asks us into their party. */
export function PartyAsk() {
  const game = useGame()
  const ask = useGameState((s) => s.partyAsk)
  if (!ask) return null
  return (
    <Panel className="pointer-events-auto absolute top-36 left-1/2 flex -translate-x-1/2 items-center gap-2 p-2">
      <span className="font-body text-[13px]">{ask.name}からパーティの誘い</span>
      <Button size="sm" variant="primary" onClick={() => game.answerParty(true)}>
        入る
      </Button>
      <Button size="sm" onClick={() => game.answerParty(false)}>
        断る
      </Button>
    </Panel>
  )
}
