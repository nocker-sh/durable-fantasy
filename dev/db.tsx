// Public entry points; implementation lives in focused modules.
export { type Ref, type Col, type Part, type Sheet } from "./sheets/schema.ts";
export { Pixel, effects } from "./sheets/shared.tsx";
export { SHEETS, sheetOf, rowOf, refsTo } from "./sheets/registry.ts";
export { hrefOf, Link } from "./sheets/navigation.tsx";
