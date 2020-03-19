import fetch from "node-fetch"

export const isRunning = async (endpoint: string = `http://localhost:1317`): Promise<boolean> => {
  try {
    await fetch(`${endpoint}/node_info`)
    const { block } = await (await fetch(`${endpoint}/blocks/latest`)).json()
    return parseInt(block.header.height, 10) > 0
  } catch (e) {
    return false
  }
}

export const waitToBeReady = async (endpoint?: string): Promise<void> => {
  if (await isRunning(endpoint)) return
  return new Promise(resolve => {
    setTimeout(() => waitToBeReady().then(resolve), 1000)
  })
}