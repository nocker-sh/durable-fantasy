import { useGame } from "#/hooks/use-game"
import { Button } from "#/components/game/button"
import { Kbd } from "#/components/game/kbd"
import { Modal } from "#/components/game/modal"

/** Shown after the server confirms a new character; existing characters resume directly. */
export function Welcome() {
  const game = useGame()
  return (
    <Modal title="操作" onClose={() => game.openModal(null)} className="w-[380px] max-w-[calc(100vw-24px)]">
      <div className="space-y-3 font-body text-sm leading-relaxed">
        <p>地面をクリックして移動・離脱。住民で会話、町の外の生き物で攻撃。</p>
        <p>
          <Kbd>I</Kbd> 持ち物　<Kbd>M</Kbd> 地図　<Kbd>Enter</Kbd> チャット
        </p>
        <p>
          持ち物の食べ物はダブルクリック。<Kbd>Z</Kbd> で座ると回復が早まります。
        </p>
        <p>
          自動保存。同じブラウザで続きから。<Kbd>Esc</Kbd> 操作・終了
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={() => game.openModal(null)}>
          町を歩く
        </Button>
      </div>
    </Modal>
  )
}
