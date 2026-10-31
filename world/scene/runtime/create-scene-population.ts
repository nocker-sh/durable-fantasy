import { lap } from "#/world/lap"
import { spriteManifest } from "#/world/scene/runtime/assets"
import { createMapResidents } from "#/world/scene/runtime/create-map-residents"
import { ScenePopulation } from "#/world/scene/runtime/scene-population"

type Props = Omit<Parameters<typeof createMapResidents>[0], "manifest" | "own"> &
  Readonly<{ progress(text: string): void; tick(): Promise<unknown>; own?: Parameters<typeof createMapResidents>[0]["own"] }>

/** 建物の完成後に処理を譲り、事前生成の照合を終えてから住民を取得する。 */
export async function createScenePopulation(props: Props): Promise<ScenePopulation> {
  lap("scene: buildings and props")
  props.progress("住民を描いています…")
  await props.tick()
  const manifest = await spriteManifest()
  const residents = createMapResidents({ ...props, manifest, own: props.own ?? (() => {}) })
  lap("scene: residents")
  return new ScenePopulation({ residents, map: props.map, centre: props.world.centre })
}
