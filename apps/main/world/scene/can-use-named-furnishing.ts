import type { Furniture } from "#/world/town/interiors"

const GENERIC_KINDS: ReadonlySet<Furniture["kind"]> = new Set(["counter", "shelf", "table", "bed", "bench", "workbench", "rack", "barrel", "crate", "chest", "rug", "chair"])

/** 名前による補助描画で、採用済みの配置・実寸と専用形状を置き換えない。 */
export const canUseNamedFurnishing = (piece: Furniture, authored: boolean): boolean => !authored && GENERIC_KINDS.has(piece.kind) && !piece.workSurface && !piece.shelf && !piece.bed
