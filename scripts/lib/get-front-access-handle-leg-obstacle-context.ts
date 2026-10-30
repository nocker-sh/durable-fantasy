import { getFrontAccessHandleExternalObstacleContext } from "#/scripts/lib/get-front-access-handle-external-obstacle-context"
type Props = Parameters<typeof getFrontAccessHandleExternalObstacleContext>[0]

/** Union fixed obstacles over the actor's entire straight walk; the selected leaf and all its hardware stay fixed in the actor's local frame. */
export function getFrontAccessHandleLegObstacleContext(props: Props) {
  const context = getFrontAccessHandleExternalObstacleContext(props)
  if (context instanceof Error) return context

  return { ...context, boxes: [...context.fixedBoxes, ...context.movingBoxes, context.contactBox] }
}
