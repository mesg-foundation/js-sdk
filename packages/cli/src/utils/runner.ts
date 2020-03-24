import { IRunner } from "@mesg/api/lib/runner-lcd";
import Runner from "@mesg/runner";
import DockerContainer from "@mesg/runner/lib/providers/container";

export const create = async (endpoint: string, mnemonic: string, serviceHash: string, env: string[]): Promise<IRunner> => {
  const provider = new DockerContainer(endpoint, mnemonic)
  const runner = new Runner(serviceHash, provider)
  return runner.start(env)
}