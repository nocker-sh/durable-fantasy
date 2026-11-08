import { useState } from "react"
import { Tabs } from "#/components/ui/tabs"
import { TabsList } from "#/components/ui/tabs-list"
import { TabsTrigger } from "#/components/ui/tabs-trigger"
import type { Sheet } from "#/dev/sheets/schema"
import { Turntable } from "#/dev/turntable"

export function Preview(inputProps: { build: NonNullable<ReturnType<NonNullable<Sheet["build"]>>> }) {
  const build = inputProps.build

  const nightState = useState(false),
    night = nightState[0],
    setNight = nightState[1]
  return (
    <section className="flex min-w-0 flex-col gap-1">
      <Tabs value={night ? "night" : "day"} onValueChange={(v) => setNight(v === "night")}>
        <TabsList>
          <TabsTrigger value="day">昼</TabsTrigger>
          <TabsTrigger value="night">夜</TabsTrigger>
        </TabsList>
      </Tabs>
      <Turntable build={build} night={night} />
    </section>
  )
}
