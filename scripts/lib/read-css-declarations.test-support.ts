/**
 * Every declaration of a built stylesheet by where it sits: the at-rules and the selector round it,
 * then the property. @font-face rules are left out, since each one only adds a face.
 */
export function readCssDeclarations(css: string): Map<string, string> {
  const declarations = new Map<string, string>()
  const path: string[] = []
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "")
  let text = ""
  let quote = ""
  let depth = 0
  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    if (char === "\\") {
      text += char + source[++index]
      continue
    }
    if (quote) {
      if (char === quote) quote = ""
    } else if (char === '"' || char === "'") quote = char
    else if (char === "(") depth++
    else if (char === ")") depth--
    else if (depth === 0 && char === "{") {
      path.push(text.trim().replace(/\s+/g, " "))
      text = ""
      continue
    } else if (depth === 0 && (char === ";" || char === "}")) {
      const colon = text.indexOf(":")
      if (colon > 0 && !path.some((rule) => rule.startsWith("@font-face")))
        declarations.set(
          [...path, text.slice(0, colon).trim()].join(" > "),
          text
            .slice(colon + 1)
            .trim()
            .replace(/\s+/g, " "),
        )
      if (char === "}") path.pop()
      text = ""
      continue
    }
    text += char
  }
  return declarations
}
