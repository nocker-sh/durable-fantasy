import type { ReactNode } from "react"
import type { Build } from "#/dev/three-view"

/** A pointer from one row to another: the sheet, the row's ID, and what it is to this row. */
export type Ref = {
  sheet: string
  id: string
  as: string
}

export type Col<T> = {
  label: string
  get: (r: T) => ReactNode
  /** a fixed width (Tailwind), for short columns */ w?: string
}

export type Part = {
  title: string
  head: string[]
  rows: ReactNode[][]
  /** across the whole page */ wide?: boolean
}

export type Sheet<T = any> = {
  id: string
  label: string
  rows: () => readonly T[]
  key: (r: T) => string
  name: (r: T) => string
  kind: (r: T) => string
  icon?: (r: T) => ReactNode
  cols: Col<T>[]
  refs?: (r: T) => Ref[]
  /** more on the detail page: tables of its own */
  more?: (r: T) => Part[]
  /** a 3D thing to turn round on the detail page */
  build?: (r: T) => Build | null
  /** shown above the list */
  top?: () => ReactNode
}

const sheet = <T>(s: Sheet<T>): Sheet<T> => s

export { sheet }
