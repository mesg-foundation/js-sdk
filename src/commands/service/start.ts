import Command from '../../service-command'

export default class ServiceStart extends Command {
  static description = 'Start a service'

  static flags = {
    ...Command.flags,
  }

  static strict = false

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }]

  async run(): Promise<string[]> {
    const {argv} = this.parse(ServiceStart)
    this.spinner.start('Start service')
    for (const arg of argv) {
      this.spinner.status = arg
      await this.unaryCall('StartService', {serviceID: arg})
    }
    this.spinner.stop(argv.join(', '))
    return argv
  }
}
