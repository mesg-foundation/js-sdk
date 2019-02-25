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
    this.spinner.start(`Start service ${args.SERVICE}`)
    await this.unaryCall('StartService', {serviceID: args.SERVICE})
    this.spinner.stop(args.SERVICE)
    return args.SERVICE
  }
}
