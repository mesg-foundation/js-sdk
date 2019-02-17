import cli from 'cli-ux'

import Command from '../../service-command'

export default class ServiceStart extends Command {
  static description = 'Start a service'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run() {
    const {args} = this.parse(ServiceStart)
    cli.action.start(`Start service ${args.SERVICE}`)
    this.mesg.api.StartService({serviceID: args.SERVICE}, (error: Error) => {
      cli.action.stop()
      if (error) return this.error(error)
    })
  }
}
