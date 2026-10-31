import type { Avatar } from "#/world/scene/runtime/types"
import type { Figure } from "#/world/scene/figure/figure"

type AppearanceFigure = Pick<Figure, "item" | "hold" | "prefetch" | "dispose">
type AppearanceWalker<F> = { name: string; fig: F; label: { textContent: string | null } }
type Props<F> = Readonly<{ makeFigure(avatar: Avatar): F }>

/** 外見の作り直しと装備だけの更新を区別し、名前と先読みを同じ人物へ反映する。 */
export class WalkerAppearance<F extends AppearanceFigure> {
  private readonly looks = new WeakMap<AppearanceWalker<F>, string>()

  constructor(private readonly props: Props<F>) {
    Object.freeze(this)
  }

  readonly remember = (walker: AppearanceWalker<F>, avatar: Avatar): void => {
    this.looks.set(walker, JSON.stringify(avatar.look))
    this.prefetch(walker.fig, avatar)
  }

  readonly update = (walker: AppearanceWalker<F>, avatar: Avatar, scope: "local" | "remote" = "local"): void => {
    walker.name = avatar.name
    walker.label.textContent = avatar.name
    const look = JSON.stringify(avatar.look)
    if (this.looks.get(walker) !== look) {
      walker.fig.dispose()
      walker.fig = this.props.makeFigure(avatar)
      this.looks.set(walker, look)
    } else if (scope === "remote" || walker.fig.item !== avatar.held) walker.fig.hold(avatar.held)
    else return
    this.prefetch(walker.fig, avatar)
  }

  private prefetch(figure: F, avatar: Avatar): void {
    figure.prefetch("idle", avatar.held)
    figure.prefetch("walk", avatar.held)
  }
}
