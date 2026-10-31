type Props = Readonly<{ path: string; resources: readonly string[] }>

/** Resolve a source probe to one module URL already requested by the current page. */
export function getRuntimeModuleUrl(props: Props): string {
  const matches = new Set<string>()
  for (const resource of props.resources) {
    const url = new URL(resource)
    if (url.pathname.replace(/\.(?:[cm]?[jt]sx?)$/, "") === props.path) matches.add(resource)
  }
  if (matches.size !== 1) throw new Error(`Expected one loaded module for ${props.path}; found ${matches.size}`)
  const match = matches.values().next().value
  if (!match) throw new Error(`No loaded module for ${props.path}`)
  return match
}
