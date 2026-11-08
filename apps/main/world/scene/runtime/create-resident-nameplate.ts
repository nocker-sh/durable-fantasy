export function createResidentNameplate(name: string): HTMLDivElement {
  const element = document.createElement("div")
  element.className = "gx-nameplate gx-nameplate--npc"
  element.textContent = name
  return element
}
