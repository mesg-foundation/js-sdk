import Runner, { RunnerInfo } from "@mesg/runner";
import DockerContainer from "@mesg/runner/lib/providers/container";

export const create = async (endpoint: string, mnemonic: string, engineAddress: string, serviceHash: string, env: string[]): Promise<RunnerInfo> => {
  const provider = new DockerContainer()
  const runner = new Runner(provider, endpoint, mnemonic, engineAddress)
  return runner.start(serviceHash, env)
}

export const stop = async (endpoint: string, mnemonic: string, engineAddress: string, runnerHash: string): Promise<void> => {
  const provider = new DockerContainer()
  const runner = new Runner(provider, endpoint, mnemonic, engineAddress)
  return runner.stop(runnerHash)
}