/** CPU slowdown only: this does not emulate GPU speed or available memory. */
export async function configureCpu(page) {
  const rate = Number(process.env.CPU_SLOWDOWN ?? 1)
  if (!Number.isFinite(rate) || rate < 1) throw Error("CPU_SLOWDOWN must be a finite number of at least 1")
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Emulation.setCPUThrottlingRate", { rate })
  return rate
}
