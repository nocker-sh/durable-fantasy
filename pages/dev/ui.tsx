import { Button } from "#/components/ui/button"
import { DevPage } from "#/dev/catalog"
import { SHOPS } from "#/world/core/shops"

const WINDOWS = ["status", "hotbar", "chat", "inventory", "equipment", "stats", "worldmap", "shop", "dialogue", "system", "character", "loading", "fallen", "offline", "failed"] as const

/** The game's windows one at a time, with a fixed state: /dev/ui?window=shop&shop=smithy. */
export default function UiPage() {
  return (
    <DevPage>
      {() => {
        const q = new URLSearchParams(location.search)
        const shown = (WINDOWS as readonly string[]).includes(q.get("window") ?? "") ? q.get("window")! : "inventory"
        const shop = q.get("shop") ?? "smithy"
        return (
          <>
            <div className="flex flex-wrap gap-2">
              {WINDOWS.map((w) => (
                <Button nativeButton={false} key={w} size="sm" variant={w === shown ? "default" : "outline"} render={<a href={`/dev/ui?window=${w}${w === "shop" ? `&shop=${shop}` : ""}`} />}>
                  {w}
                </Button>
              ))}
            </div>
            {shown === "shop" && (
              <div className="flex flex-wrap gap-2">
                {Object.keys(SHOPS).map((s) => (
                  <Button nativeButton={false} key={s} size="sm" variant={s === shop ? "secondary" : "ghost"} render={<a href={`/dev/ui?window=shop&shop=${s}`} />}>
                    {s}
                  </Button>
                ))}
              </div>
            )}
            <iframe title={shown} src={`/dev/ui/frame?window=${shown}&shop=${shop}`} className="h-[760px] w-full rounded-lg border" />
          </>
        )
      }}
    </DevPage>
  )
}
