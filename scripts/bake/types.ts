import type { Browser, Page } from "playwright-core"
import type { SpriteBakePlan, SpriteBakeJob } from "#/scripts/lib/sprite-bake-types"
export type SpriteBakeRenderContext = Readonly<{ outputDirectory: string; serverUrl: string; token: string; resume: boolean; plan: SpriteBakePlan }>
export type SpriteBakePageContext = SpriteBakeRenderContext &
  Readonly<{ browser: Browser; jobs: readonly SpriteBakeJob[]; pageCount: number; pageIndex: number; temporaryDirectory: string; onDone: () => void }>
export type SpriteBakeJobContext = SpriteBakeRenderContext & Readonly<{ page: Page; job: SpriteBakeJob; pngPath: string }>
export type SpriteBakeRunInput = Readonly<{ outputDirectory: string; serverUrl: string; token: string; resume: boolean; only: readonly string[] | null; pageCount: number }>
