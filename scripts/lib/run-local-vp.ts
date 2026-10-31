import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

type Props = Readonly<{ args: readonly string[]; input?: string }>

/** PATH 上のグローバル CLI に依存せず、このプロジェクトの Vite+ を同じランタイムで実行する。 */
export function runLocalVp(props: Props) {
  const entry = fileURLToPath(import.meta.resolve("vite-plus/bin"))

  return spawnSync(process.execPath, [entry, ...props.args], { input: props.input, encoding: "utf8" })
}
