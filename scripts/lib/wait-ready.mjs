export const waitReady = (page) => page.waitForFunction(() => window.game?.scene?.ready && game.state.get().loading === null && game.state.get().online === "online", null, { timeout: 180000 })
