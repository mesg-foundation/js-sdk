import Command from './root-command'

export interface ServiceID {
  sid: string
  hash: string
}

export interface Service {
  definition: {
    sid: string
    hash: string
    name: string
    tasks: any[]
  }
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
