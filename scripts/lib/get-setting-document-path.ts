import path from "node:path"

/** 索引の資料を基点の配下だけで解決する。実ファイルのリンクは資料一覧の走査で別に拒否する。 */
export function getSettingDocumentPath(base: string, file: string, paths = path): string {
  const target = paths.resolve(base, file)
  const relative = paths.relative(base, target)
  if (!relative || relative === ".." || relative.startsWith(`..${paths.sep}`) || paths.isAbsolute(relative)) throw Error("Document path outside settings")

  return target
}
