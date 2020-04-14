import Runner, { RunnerInfo } from "@mesg/runner";
import DockerContainer from "@mesg/runner/lib/providers/container";
import API from "@mesg/api";
import { IInstance } from "@mesg/api/lib/instance";

export const create = async (lcd: API, lcdEndpoint: string, orchestratorEndpoint: string, mnemonic: string, engineAddress: string, serviceHash: string, env: string[]): Promise<RunnerInfo> => {
  const provider = new DockerContainer()
  const runner = new Runner(provider, lcdEndpoint, orchestratorEndpoint, mnemonic, engineAddress)
  const info = await runner.start(serviceHash, env)
  await waitForInstance(lcd, info.instanceHash)
  return info
}

export const stop = async (lcdEndpoint: string, orchestratorEndpoint: string, mnemonic: string, engineAddress: string, runnerHash: string): Promise<void> => {
  const provider = new DockerContainer()
  const runner = new Runner(provider, lcdEndpoint, orchestratorEndpoint, mnemonic, engineAddress)
  return runner.stop(runnerHash)
}

const waitForInstance = async (lcd: API, hash: string, maxRetries: number = 10, delay: number = 1, count: number = 0): Promise<IInstance> => {
  while (count < maxRetries) {
    try {
      const instance = await lcd.instance.get(hash)
      return instance
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error('instance not started')
}