/** Format the supplied minute count without changing its existing rounding rules. */
export const formatTime = (min: number) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(Math.floor(min % 60)).padStart(2, "0")}`
