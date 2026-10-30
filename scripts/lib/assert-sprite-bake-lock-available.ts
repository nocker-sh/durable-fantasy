import { readdirSync, rmSync } from "node:fs"
import { join } from "node:path"
import { isSpriteBakeClaimBlocking } from "./is-sprite-bake-claim-blocking"
type Props = Readonly<{ directory: string; claim: string }>

/** 参加を記録してから他の参加者を見る。停止した一意な記録だけを取り除く。 */
export function assertSpriteBakeLockAvailable(props: Props): void {
  for (const entry of readdirSync(props.directory, { withFileTypes: true })) {
    if (entry.name === props.claim) continue
    if (!entry.isFile() || isSpriteBakeClaimBlocking(entry.name)) throw new Error("Sprite output is locked by an active or unverifiable owner")
    rmSync(join(props.directory, entry.name), { force: true })
  }
}
