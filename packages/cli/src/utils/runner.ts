import GRPCAPI from "@mesg/api";
import * as base58 from "@mesg/api/lib/util/base58";
import { IRunner } from "@mesg/api/lib/runner-lcd";
import API from "@mesg/api/lib/lcd";
import { IsAlreadyExistsError } from "./error";

export const create = async (grpc: GRPCAPI, lcd: API, serviceHash: string, env: string[]): Promise<IRunner> => {
  let runnerHash
  try {
    const response = await grpc.runner.create({
      serviceHash: base58.decode(serviceHash),
      env: env
    })
    runnerHash = base58.encode(response.hash)
  } catch (e) {
    if (!IsAlreadyExistsError.match(e)) throw e
    runnerHash = base58.encode(new IsAlreadyExistsError(e).hash)
  }
  return lcd.runner.get(runnerHash)
}