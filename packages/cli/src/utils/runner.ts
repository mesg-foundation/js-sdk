import Runner, { RunnerInfo } from "@mesg/runner";
import DockerContainer from "@mesg/runner/lib/providers/container";
import { engineName } from "./docker";

export const create = async (lcdEndpoint: string, orchestratorEndpoint: string, mnemonic: string, engineAddress: string, serviceHash: string, env: string[]): Promise<RunnerInfo> => {
  const provider = new DockerContainer(null, engineName)
  const runner = new Runner(provider, lcdEndpoint, orchestratorEndpoint, mnemonic, engineAddress)
  return runner.start(serviceHash, env)
}

export const stop = async (lcdEndpoint: string, orchestratorEndpoint: string, mnemonic: string, engineAddress: string, runnerHash: string): Promise<void> => {
  const provider = new DockerContainer(null, engineName)
  const runner = new Runner(provider, lcdEndpoint, orchestratorEndpoint, mnemonic, engineAddress)
  return runner.stop(runnerHash)
}