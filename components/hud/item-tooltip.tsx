// What an item is (ui.md §6.5), shown on hover wherever an item appears.
import type { ReactElement, ReactNode } from "react"
import { usePlayerIfAny } from "#/components/game/context.tsx"
import { fullDurability } from "#/world/core/bag.ts"
import { artsOf, skillOf } from "#/world/core/skills.ts"
import { equipmentDefense, standing } from "#/world/core/stats.ts"
import { GATHER_SKILL_NAME, ITEMS, KIND_NAME, QUALITIES, QUALITY_PRICE, RARITY_NAME, sellPrice, sellable, type ItemId, type Quality } from "#/world/core/items.ts"
import { displayName, effectOf, traitOf } from "#/world/core/makers.ts"
import { STAT_NAME, type Stat } from "#/world/core/growth.ts"
import type { Skill } from "#/world/core/items.ts"
import { Gold } from "#/components/game/gold.tsx"
import { RARITY } from "#/components/game/slot.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "#/components/game/tooltip.tsx"

const PART = { head: "頭", neck: "首巻き", body: "体", weapon: "武器", shield: "盾", feet: "足", accessory: "装飾品" } as const

export function ItemTooltip({
  item,
  mark,
  children,
  hint,
  side = "top",
  open,
}: {
  item: ItemId | null | undefined
  /** a made thing's quality and maker */ mark?: { q?: Quality; by?: string; dur?: number } | null
  children: ReactElement
  hint?: ReactNode
  side?: "top" | "right" | "left" | "bottom"
  /** hold it open (dev previews) */ open?: boolean
}) {
  const me = usePlayerIfAny()
  if (!item) return children
  const d = ITEMS[item]
  const e = d.equip
  const q = mark?.q ?? 1,
    by = mark?.by
  const fx = d.use ? effectOf(item, q, by) : null
  const note = traitOf(item, by)?.note
  return (
    <Tooltip open={open}>
      <TooltipTrigger render={children} />
      <TooltipContent side={side} className="w-60">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-head text-[13px]" style={{ color: RARITY[d.rarity] === "var(--color-rarity-common)" ? "var(--color-text)" : RARITY[d.rarity] }}>
            {displayName(item, by)}
            {d.made && <span className="ml-1 text-[11px] text-brass-hi">（{QUALITIES[q]}）</span>}
          </span>
          <span className="font-head text-[11px] text-text-dim">
            {KIND_NAME[d.kind]}
            {e && ` · ${PART[e.part]}`}
          </span>
        </div>
        <div className="ui-rule my-1.5" />
        <p>{d.description}</p>
        {note && <p className="mt-1 text-text-dim">{note}</p>}
        <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 font-head text-[11px]">
          {fx?.hp ? (
            <>
              <dt className="text-text-dim">回復</dt>
              <dd className="text-right text-good">HP +{fx.hp}</dd>
            </>
          ) : null}
          {fx?.sp ? (
            <>
              <dt className="text-text-dim">回復</dt>
              <dd className="text-right text-good">SP +{fx.sp}</dd>
            </>
          ) : null}
          {fx?.stamina ? (
            <>
              <dt className="text-text-dim">スタミナ</dt>
              <dd className="text-right text-good">+{fx.stamina}</dd>
            </>
          ) : null}
          {fx?.warm ? (
            <>
              <dt className="text-text-dim">温まり</dt>
              <dd className="text-right text-[#f0b060]">{fx.warm}分</dd>
            </>
          ) : null}
          {fx?.focus ? (
            <>
              <dt className="text-text-dim">集中（SP自然回復 +1）</dt>
              <dd className="text-right text-good">{fx.focus}分</dd>
            </>
          ) : null}
          {fx?.full ? (
            <>
              <dt className="text-text-dim">満腹</dt>
              <dd className="text-right">+{fx.full}</dd>
            </>
          ) : null}
          {d.tool && (
            <>
              <dt className="text-text-dim">{mark?.dur === undefined ? "耐久（新品）" : "残り耐久"}</dt>
              <dd className="text-right">{mark?.dur === undefined ? fullDurability(item, q) : `${mark.dur} / ${fullDurability(item, q)}`}</dd>
            </>
          )}
          {e?.atk ? (
            <>
              <dt className="text-text-dim">攻撃力</dt>
              <dd className="text-right">+{e.atk}</dd>
            </>
          ) : null}
          {e?.def ? (
            <>
              <dt className="text-text-dim">防御</dt>
              <dd className="text-right">+{equipmentDefense(item, q)}</dd>
            </>
          ) : null}
          {Object.entries(e?.bonus ?? {}).map(([key, n]) => (
            <div key={key} className="contents">
              <dt className="text-text-dim">{key === "maxHp" ? "最大 HP" : key === "maxSp" ? "最大 SP" : STAT_NAME[key as keyof typeof STAT_NAME]}</dt>
              <dd className="text-right text-good">+{n}</dd>
            </div>
          ))}
          {e?.twoHanded ? (
            <>
              <dt className="text-text-dim">持ち方</dt>
              <dd className="text-right">両手</dd>
            </>
          ) : null}
          {e?.delay ? (
            <>
              <dt className="text-text-dim">攻撃間隔</dt>
              <dd className="text-right">{(e.delay / 1000).toFixed(1)} 秒</dd>
            </>
          ) : null}
          {e?.scale ? (
            <>
              <dt className="text-text-dim">能力補正</dt>
              <dd className="text-right">
                {Object.entries(e.scale)
                  .map(([k, g]) => `${STAT_NAME[k as Stat]} ${g}`)
                  .join("・")}
              </dd>
            </>
          ) : null}
          {e?.needs ? (
            <>
              <dt className="text-text-dim">必要</dt>
              <dd className="text-right">
                {Object.entries(e.needs).map(([k, n], i) => (
                  <span key={k} className={me && standing(me, k as Stat | Skill) < (n ?? 0) ? "text-bad" : ""}>
                    {i ? "・" : ""}
                    {k in STAT_NAME ? STAT_NAME[k as Stat] : `${GATHER_SKILL_NAME[k as Skill]} Lv`} {n}
                  </span>
                ))}
              </dd>
            </>
          ) : null}
          {e?.part === "weapon" && artsOf(item).length ? (
            <>
              <dt className="text-text-dim">技</dt>
              <dd className="text-right">
                {artsOf(item)
                  .map((a) => skillOf(a).name)
                  .join("・")}
              </dd>
            </>
          ) : null}
          <dt className="text-text-dim">レア度</dt>
          <dd className="text-right">{RARITY_NAME[d.rarity]}</dd>
          <dt className="text-text-dim">重さ</dt>
          <dd className="text-right">{d.weight}</dd>
          <dt className="text-text-dim">売値</dt>
          <dd className="text-right">{sellable(item) ? <Gold amount={d.made ? Math.max(1, Math.floor(sellPrice(item) * QUALITY_PRICE[q])) : sellPrice(item)} /> : "売れない"}</dd>
        </dl>
        {hint && <p className="mt-1.5 text-[11px] text-text-faint">{hint}</p>}
      </TooltipContent>
    </Tooltip>
  )
}
