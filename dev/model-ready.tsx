import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { MonsterModel } from "#/world/core/monster-model-types"
import { loadMonsterModel } from "#/world/scene/fields/load-monster-model"

type Props = { id: MonsterModel["id"] | null; children: ReactNode }

/** Hold back a picture of a model-drawn creature until its model has arrived, so the thumbnail is not empty. */
export function ModelReady(props: Props) {
  const readyState = useState(props.id === null),
    ready = readyState[0],
    setReady = readyState[1]
  useEffect(() => {
    if (props.id === null) return
    let live = true
    void loadMonsterModel(props.id).then(() => {
      if (live) setReady(true)
    })
    return () => {
      live = false
    }
  }, [props.id])
  return ready ? props.children : null
}
