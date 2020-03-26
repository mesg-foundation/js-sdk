import { IRunner } from "@mesg/api/lib/runner-lcd";
import Runner from "@mesg/runner";
import DockerContainer from "@mesg/runner/lib/providers/container";

export const create = async (endpoint: string, mnemonic: string, serviceHash: string, env: string[]): Promise<IRunner> => {
  const provider = new DockerContainer(endpoint, mnemonic)
  const runner = new Runner(provider)
  return runner.start(serviceHash, env)
}

export const stop = async (endpoint: string, mnemonic: string, runnerHash: string): Promise<void> => {
  const provider = new DockerContainer(endpoint, mnemonic)
  const runner = new Runner(provider)
  return runner.stop(runnerHash)
}