/** 拒否した試行も待ち時間へ含め、判定に必要な直近の試行だけを保持する。 */
export function getSpeechAttempt(said: readonly number[], now: number): { said: number[]; canSpeak: boolean } {
  const recent = said.slice(-2).filter((at) => now - at < 1000)
  return { said: [...recent, now].slice(-2), canSpeak: recent.length < 2 }
}
