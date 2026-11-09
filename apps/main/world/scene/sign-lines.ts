/** A short sign split onto two lines at its space when that lets it be written larger. */
export function signLines(word: string): string[] {
  return word.includes(" ") && word.length > 6 ? [word.slice(0, word.indexOf(" ")), word.slice(word.indexOf(" ") + 1)] : [word]
}
