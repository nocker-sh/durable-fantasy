// Loaded only in dev builds: the debug panel with its own (scoped) styles.
import "./debug.css"
import { diorama } from "#/world/scene/index.ts"

// the blur settings too, for poking from the console and for screenshot comparisons
Object.assign(window, { diorama })

export { default } from "./debug-panel.tsx"
