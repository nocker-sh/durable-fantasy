type Props = Readonly<{ shadowMap: { needsUpdate: boolean } }>

/** 時刻の変更は次の描画へ反映し、通常の影の再計算は描画の周期と分ける。 */
export class SceneShadowUpdates {
  private readonly state = { dirty: true, at: 0 }

  constructor(private readonly props: Props) {
    Object.freeze(this)
  }

  readonly invalidate = (): void => {
    this.state.dirty = true
  }

  readonly update = (at: number): void => {
    const isDue = this.state.dirty || at - this.state.at > 250
    if (!isDue) return
    this.props.shadowMap.needsUpdate = true
    this.state.dirty = false
    this.state.at = at
  }
}
