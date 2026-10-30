import { useEffect, useRef, useState } from "react"
import { Button } from "#/components/ui/button"
import { Field } from "#/components/ui/field"
import { FieldDescription } from "#/components/ui/field-description"
import { FieldGroup } from "#/components/ui/field-group"
import { FieldLabel } from "#/components/ui/field-label"
import { NativeSelect } from "#/components/ui/native-select"
import { NativeSelectOption } from "#/components/ui/native-select-option"
import { Sidebar } from "#/components/ui/sidebar"
import { SidebarContent } from "#/components/ui/sidebar-content"
import { SidebarGroup } from "#/components/ui/sidebar-group"
import { SidebarGroupContent } from "#/components/ui/sidebar-group-content"
import { SidebarGroupLabel } from "#/components/ui/sidebar-group-label"
import { SidebarMenu } from "#/components/ui/sidebar-menu"
import { SidebarMenuButton } from "#/components/ui/sidebar-menu-button"
import { SidebarMenuItem } from "#/components/ui/sidebar-menu-item"
import { Slider } from "#/components/ui/slider"
import { CATEGORIES, MOTIONS, type Motion } from "#/dev/studio/motions"
import { AGE, CLOTH, DEFAULT_LOOK, HAIR, HATS, NECKS, ITEMS, PRESETS, SEX, SKIN, STYLES } from "#/dev/studio/options"
import { Stage, type Item, type Look, type StageState } from "#/dev/studio/stage"

/** A look field, its label and its choices; "" stands for none. */
type Choice = {
  key: keyof Look
  label: string
  options: [string | null | undefined, string][]
  none?: string
}

const CHOICES: Choice[] = [
  { key: "sex", label: "性別", options: SEX },
  { key: "age", label: "年齢", options: AGE },
  { key: "skin", label: "肌", options: SKIN },
  { key: "hair", label: "髪色", options: HAIR },
  { key: "style", label: "髪型", options: STYLES },
  { key: "top", label: "上着", options: CLOTH },
  { key: "bottom", label: "下衣", options: CLOTH, none: "なし" },
  { key: "hat", label: "帽子", options: HATS },
  { key: "neck", label: "首巻き", options: NECKS },
  { key: "neckRamp", label: "首巻きの色", options: CLOTH },
  { key: "neckStripe", label: "首巻きの縞", options: CLOTH, none: "なし" },
]

/** Facing by the stage's dir: 0 = toward the viewer, then clockwise on screen. */
const DIRECTIONS = ["正面", "左下", "左", "左上", "背面", "右上", "右", "右下"]

/** Labels for clips that are not in the motion list. */
const CLIPS: Record<string, string> = { Walk: "歩く" }

const clipLabel = (clip: string) => CLIPS[clip] ?? MOTIONS.find((motion) => motion.clip === clip)?.label ?? clip

/**
 * The studio (dev): equipment and looks on the left, the villager on a tiled floor in
 * the middle (click a tile to walk there), motions and the stage's settings on the right.
 */
export default function StudioPage() {
  const canvas = useRef<HTMLCanvasElement>(null)

  const stage = useRef<Stage | null>(null)

  const presetState = useState(PRESETS[0][0]),
    preset = presetState[0],
    setPreset = presetState[1]

  const lookState = useState<Look>(DEFAULT_LOOK),
    look = lookState[0],
    setLook = lookState[1]

  const itemState = useState<Item>(null),
    item = itemState[0],
    setItem = itemState[1]

  const motionState = useState<Motion | null>(null),
    motion = motionState[0],
    setMotion = motionState[1]

  const zoomState = useState(3),
    zoom = zoomState[0],
    setZoom = zoomState[1]

  const stateState = useState<StageState | null>(null),
    state = stateState[0],
    setState = stateState[1]

  useEffect(() => {
    if (!canvas.current) return

    document.body.dataset.ready = "0"
    const created = new Stage(canvas.current, DEFAULT_LOOK, null)
    created.onReady = () => {
      document.body.dataset.ready = "1"
    }

    created.onChange = (next) =>
      setState((shown) => (shown && shown.tx === next.tx && shown.ty === next.ty && shown.dir === next.dir && shown.clip === next.clip && shown.walking === next.walking ? shown : next))

    stage.current = created

    return () => {
      created.destroy()
      stage.current = null
      delete document.body.dataset.ready
    }
  }, [])

  useEffect(() => stage.current?.setZoom(zoom), [zoom])

  // walking cancels the motion on the stage, so drop the selection too
  useEffect(() => {
    if (state?.walking) setMotion(null)
  }, [state?.walking])

  const wear = (nextLook: Look, nextItem: Item) => {
    setLook(nextLook)
    setItem(nextItem)
    stage.current?.setLook(nextLook, nextItem)
  }

  const choosePreset = (name: string) => {
    const found = PRESETS.find((entry) => {
      const label = entry[0]
      return label === name
    })
    if (!found) return
    setPreset(name)
    wear(found[1], found[2])
  }

  const change = (key: keyof Look, value: string) => wear({ ...look, [key]: value === "" ? undefined : value }, item)

  const play = (chosen: Motion) => {
    wear(look, chosen.item ?? null)
    setMotion(chosen)
    stage.current?.play(chosen)
  }

  const stop = () => {
    setMotion(null)
    stage.current?.play(null)
  }

  return (
    <div className="-m-3 flex h-svh min-w-0">
      <div className="min-w-0 flex-1 overflow-hidden">
        <canvas ref={canvas} />
      </div>
      <Sidebar side="right" collapsible="none" className="h-svh border-l">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>見た目</SidebarGroupLabel>
            <SidebarGroupContent>
              <FieldGroup className="gap-2">
                <Field>
                  <FieldLabel>装備セット</FieldLabel>
                  <NativeSelect size="sm" value={preset} onChange={(event) => choosePreset(event.target.value)}>
                    {PRESETS.map((entry2) => {
                      const name = entry2[0]
                      return (
                        <NativeSelectOption key={name} value={name}>
                          {name}
                        </NativeSelectOption>
                      )
                    })}
                  </NativeSelect>
                </Field>
                {CHOICES.map((choice) => (
                  <Field key={choice.key}>
                    <FieldLabel>{choice.label}</FieldLabel>
                    <NativeSelect size="sm" value={String(look[choice.key] ?? "")} onChange={(event) => change(choice.key, event.target.value)}>
                      {choice.none && <NativeSelectOption value="">{choice.none}</NativeSelectOption>}
                      {choice.options.map((entry3) => {
                        const value = entry3[0]
                        const label = entry3[1]
                        return (
                          <NativeSelectOption key={label} value={value ?? ""}>
                            {label}
                          </NativeSelectOption>
                        )
                      })}
                    </NativeSelect>
                  </Field>
                ))}
                <Field>
                  <FieldLabel>持ち物</FieldLabel>
                  <NativeSelect size="sm" value={item ?? ""} onChange={(event) => wear(look, (event.target.value || null) as Item)}>
                    {ITEMS.map((entry4) => {
                      const value = entry4[0]
                      const label = entry4[1]
                      return (
                        <NativeSelectOption key={label} value={value ?? ""}>
                          {label}
                        </NativeSelectOption>
                      )
                    })}
                  </NativeSelect>
                </Field>
              </FieldGroup>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>ステージ</SidebarGroupLabel>
            <SidebarGroupContent>
              <FieldGroup className="gap-2">
                <FieldDescription>
                  マス {state?.tx ?? 0}, {state?.ty ?? 0} ／ {DIRECTIONS[state?.dir ?? 0]} ／ {state ? clipLabel(state.clip) : "-"}
                </FieldDescription>
                <div className="grid grid-cols-4 gap-1">
                  {DIRECTIONS.map((label, dir) => (
                    <Button key={label} size="xs" className="min-w-0" variant={state?.dir === dir ? "default" : "outline"} onClick={() => stage.current?.setDir(dir)}>
                      {label}
                    </Button>
                  ))}
                </div>
                <Field>
                  <FieldLabel>拡大 {zoom}</FieldLabel>
                  <Slider value={zoom} min={2} max={6} onValueChange={(value) => setZoom(value as number)} />
                </Field>
                <Button size="xs" variant="outline" onClick={stop}>
                  モーションを止める
                </Button>
              </FieldGroup>
            </SidebarGroupContent>
          </SidebarGroup>
          {CATEGORIES.map((category) => (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{category}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {MOTIONS.filter((each) => each.cat === category).map((each) => (
                    <SidebarMenuItem key={each.clip}>
                      <SidebarMenuButton size="sm" isActive={motion?.clip === each.clip} onClick={() => play(each)}>
                        {each.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </div>
  )
}
