// Between maps (ui.md §3.16): an ink-dark screen, the place's name in a quiet serif, a hairline of
// progress, and a few lines of the world to read. When the map is ready it fades out over a
// breath, so a passage is not snatched away half read.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import "@fontsource/shippori-mincho/400.css";
import { flavorFor } from "#/world/town/flavor.ts";
import { useGameState } from "#/components/game/context.tsx";

/** How far each step of building a map has got (scene/index.ts). */
const STEPS: Record<string, number> = { "読み込んでいます…": 0.1, "地面を描いています…": 0.3, "街を建てています…": 0.55, "住民を描いています…": 0.8 };
const FADE_MS = 600;

export function Loading() {
  const loading = useGameState((s) => s.loading);
  const failed = useGameState((s) => s.failed);
  const map = useGameState((s) => s.map.id);
  // the last thing shown stays up while it fades
  const [shown, setShown] = useState(loading);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    if (loading) {
      setShown(loading);
      setFading(false);
      return;
    }
    setFading(true);
    const t = setTimeout(() => setShown(null), FADE_MS);
    return () => clearTimeout(t);
  }, [loading]);
  const passage = useMemo(() => flavorFor(map).text, [map]);
  if (failed)
    return (
      <Between title="町を描けなかった">
        <button type="button" onClick={() => location.reload()} className="text-[12px] tracking-[0.2em] text-[#9a968e] underline-offset-4 hover:underline">
          読み込み直す
        </button>
      </Between>
    );
  if (!shown) return null;
  return <Between title={shown.map} progress={loading ? (STEPS[shown.text] ?? 0.92) : 1} passage={passage} fading={fading} />;
}

/** The quiet screen: a title, a hairline of progress, a passage, and whatever goes under them. */
export function Between({ title, progress, passage, fading, children }: { title: string; progress?: number; passage?: string; fading?: boolean; children?: ReactNode }) {
  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[90] flex flex-col items-center bg-[#0c0c0d] transition-opacity ease-out"
      style={{ fontFamily: "'Shippori Mincho', 'Noto Serif JP', serif", opacity: fading ? 0 : 1, transitionDuration: `${FADE_MS}ms`, pointerEvents: fading ? "none" : "auto" }}
    >
      <Ash />
      <div className="mt-[56vh] flex w-[min(80vw,420px)] flex-col items-center gap-5">
        <div className="text-[17px] tracking-[0.35em] text-[#d8d4cc]">{title}</div>
        {progress !== undefined && (
          <div className="h-px w-[220px] bg-[#26262a]">
            <div className="h-px bg-[#bdb8ae] transition-[width] duration-500" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
        {passage && <p className="text-center text-[13px] leading-[2.1] tracking-[0.08em] whitespace-pre-line text-[#77736c]">{passage}</p>}
        {children}
      </div>
    </div>
  );
}

/** A few fine grains of ash drifting down, barely there. */
function Ash() {
  const grains = useMemo(() => Array.from({ length: 28 }, (_, k) => ({ left: (k * 37) % 100, delay: -((k * 53) % 40), dur: 26 + ((k * 17) % 18), size: k % 3 === 0 ? 2 : 1 })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {grains.map((g, k) => (
        <span
          key={k}
          className="absolute top-[-2%] rounded-full bg-[#8a8680] opacity-40"
          style={{ left: `${g.left}%`, width: g.size, height: g.size, animation: `ash-fall ${g.dur}s linear ${g.delay}s infinite` }}
        />
      ))}
      <style>{"@keyframes ash-fall { from { transform: translate(0, 0); } to { transform: translate(24px, 104vh); } }"}</style>
    </div>
  );
}
