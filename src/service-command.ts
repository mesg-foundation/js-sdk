import {Command, flags} from '@oclif/command'
import {IConfig} from '@oclif/config'
import {application} from 'mesg-js'
import {Application} from 'mesg-js/lib/application'

export interface Service {
  sid: string
  hash: string
  name: string
  status: number
}

export default abstract class extends Command {
  static flags = {
    help: flags.help({char: 'h'}),
  }

  protected mesg: Application

  constructor(argv: string[], config: IConfig) {
    super(argv, config)
    this.mesg = application({
      endpoint: 'localhost:50052'
    })
  }

  status(s: number) {
    return ['unknown', 'stopped', 'starting', 'partial', 'running'][s]
  }
}
