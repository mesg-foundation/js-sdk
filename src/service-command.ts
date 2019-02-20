import Command from './root-command'

export interface Service {
  sid: string
  hash: string
  name: string
  status: number
}

export type SERVICE_PARAMETER_TYPE = 'String' | 'Number' | 'Boolean' | 'Object' | 'Any'

export default abstract class extends Command {
  static flags = {
    ...Command.flags
  }

  status(s: number) {
    return ['unknown', 'stopped', 'starting', 'partial', 'running'][s]
  }
}
