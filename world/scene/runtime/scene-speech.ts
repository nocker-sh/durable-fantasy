type Props<T, E> = Readonly<{
  me: T
  remotes: ReadonlyMap<string, T>
  create(text: string): E
  place(walker: T, element: E): void
}>

/** 吹き出しの置換・期限・退出を、一つの描画の人物に結び付ける。 */
export class SceneSpeech<T extends { id: string }, E extends { remove(): void }> {
  private readonly entries = new Map<T, { element: E; until: number }>()

  constructor(private readonly props: Props<T, E>) {
    Object.freeze(this)
  }

  get elements(): E[] {
    return [...this.entries.values()].map((entry) => entry.element)
  }

  readonly bubble = (who: string, text: string): void => {
    const walker = who === "me" ? this.props.me : this.props.remotes.get(who)
    if (!walker) return
    this.entries.get(walker)?.element.remove()
    this.entries.set(walker, { element: this.props.create(text), until: performance.now() + Math.min(8000, 4000 + text.length * 80) })
  }

  readonly update = (now: number): void => {
    for (const entry of this.entries) {
      const walker = entry[0]
      const bubble = entry[1]
      if (now > bubble.until || (walker !== this.props.me && !this.props.remotes.has(walker.id))) {
        bubble.element.remove()
        this.entries.delete(walker)
        continue
      }
      this.props.place(walker, bubble.element)
    }
  }
}
