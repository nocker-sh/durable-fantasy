import type { WorkingToolGeometry, ToolGripProfile } from "#/world/town/working-tool"

/** Derive the palm opening from the actual stored handle, without another dimension source. */
export function workingToolGripProfile(tool: WorkingToolGeometry): ToolGripProfile {
  const handle = tool.parts.find((p) => p.part === "handle")?.bounds
  if (!handle || handle.bottom >= 0 || handle.top <= 0 || Math.abs(handle.x0 + handle.x1) > 1e-9 || Math.abs(handle.z0 + handle.z1) > 1e-9)
    throw new Error("Working grip requires a centred handle containing the grip")
  return { across: tool.axes[0], halfWidth: (handle.x1 - handle.x0) / 2, halfDepth: (handle.z1 - handle.z0) / 2 }
}
