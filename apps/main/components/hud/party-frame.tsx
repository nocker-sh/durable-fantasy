import { useGame } from "#/hooks/use-game"
import { useGameState } from "#/hooks/use-game-state"
import { Button } from "#/components/game/button"
import { Meter } from "#/components/game/meter"
import { Panel } from "#/components/game/panel"

export function PartyFrame() {
  const game = useGame()
  const party = useGameState((s) => s.party)
  if (!party) return null
  // fixed under the status (ui.md §3.12); it ends above where the system log first opens (system-log.tsx), and a long party scrolls
  return (
    <Panel className="pointer-events-auto absolute top-[132px] left-3 flex max-h-[max(96px,calc(50%-180px))] w-[276px] flex-col gap-1.5 p-2">
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
      <ul className="ui-scroll flex min-h-0 flex-col gap-1 overflow-y-auto pr-1">
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
            {party.leading && !m.me && (
              <div className="flex justify-end gap-1">
                <Button size="sm" aria-label={`${m.name}にリーダーを任せる`} onClick={() => game.passPartyLead(i, m.name, m.key)}>
                  任せる
                </Button>
                <Button size="sm" aria-label={`${m.name}をパーティから外す`} onClick={() => game.kickPartyMember(i, m.name, m.key)}>
                  外す
                </Button>
              </div>
            )}
            <Meter tone="hp" value={m.hp} max={m.maxHp} className="h-[8px]" aria-label={`${m.name}の HP`} showValue={false} />
          </li>
        ))}
      </ul>
    </Panel>
  )
}
