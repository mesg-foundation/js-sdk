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
    this.spinner.start(`Stop service ${args.SERVICE}`)
    await this.unaryCall('StopService', {serviceID: args.SERVICE})
    this.spinner.stop(args.SERVICE)
    return args.SERVICE
  }
}
