import { useGame } from "#/components/game/context.tsx"
import { Button } from "#/components/game/button.tsx"
import { Kbd } from "#/components/game/kbd.tsx"
import { Modal } from "#/components/game/modal.tsx"

/** Shown after the server confirms a new character; existing characters resume directly. */
export function Welcome() {
  const game = useGame()
  return (
    <Modal title="町での暮らしを始める" onClose={() => game.openModal(null)} className="w-[380px] max-w-[calc(100vw-24px)]">
      <div className="space-y-3 font-body text-sm leading-relaxed">
        <p>地面をクリックすると歩きます。住民をクリックすると、そばまで歩いて話しかけます。まずは町の人の話を聞いてみましょう。</p>
        <p>
          <Kbd>I</Kbd> で持ち物、<Kbd>M</Kbd> で地図を開けます。
        </p>
        <p>町の外では、生き物をクリックすると近づいて攻撃します。危なくなったら地面をクリックして離れましょう。</p>
        <p>
          持ち物の食べ物はダブルクリックで使えます。<Kbd>Z</Kbd> で座って休むと、HP・SP が早く回復します。
        </p>
        <p>
          <Kbd>Enter</Kbd> でチャットを開いて、近くのプレイヤーに話せます。
        </p>
        <p>
          進み具合は自動で保存されます。同じブラウザで開くと続きから遊べます。<Kbd>Esc</Kbd> のメニューから操作一覧や終了を選べます。
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
