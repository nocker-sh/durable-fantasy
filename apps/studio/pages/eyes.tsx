import { DevPage } from "#/dev/catalog"
import { EyePortrait } from "#/dev/eye-portrait"
import { RESIDENTS, RESIDENT_LOOKS } from "#/world/town/residents"

/** The eyes (ui.md §6.4.2): each resident from all eight sides, the old upright stroke above the T. ?scale=6 */
const VIEWS = [0, 1, 2, 3, 4, 5, 6, 7]

export default function EyesPage() {
  return (
    <DevPage>
      {() => {
        const scale = Number(new URLSearchParams(location.search).get("scale") ?? 5)
        const trial = RESIDENTS.map((r, i) => ({ r, look: RESIDENT_LOOKS[i] }))
        return (
          <div className="grid gap-6 text-sm">
            {trial.map((inputProps) => {
              const r = inputProps.r
              const look = inputProps.look
              return (
                <section key={r.name} className="grid gap-1">
                  <h3 className="font-semibold">
                    {r.name}（{r.job}・瞳 {look.eye}）
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {VIEWS.map((v) => (
                      <EyePortrait key={v} look={{ ...look, eyeStyle: "stroke" }} item={r.item} view={v} scale={scale} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {VIEWS.map((v) => (
                      <EyePortrait key={v} look={look} item={r.item} view={v} scale={scale} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )
      }}
    </DevPage>
  )
}
