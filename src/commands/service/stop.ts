import cli from 'cli-ux'

import Command from '../../service-command'

export default class ServiceStop extends Command {
  static description = 'Stop a service'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args} = this.parse(ServiceStop)
    cli.action.start(`Stop service ${args.SERVICE}`)
    this.mesg.api.StopService({serviceID: args.SERVICE}, (error: Error) => {
      cli.action.stop()
      if (error) throw error
    })
  }
}
