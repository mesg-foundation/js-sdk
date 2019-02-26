import Command from '../../service-command'

export default class ServiceStop extends Command {
  static description = 'Stop a service'

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
    const {argv} = this.parse(ServiceStop)
    this.spinner.start('Stop service')
    for (const arg of argv) {
      this.spinner.status = arg
      await this.unaryCall('StopService', {serviceID: arg})
    }
    this.spinner.stop(argv.join(', '))
    return argv
  }
}
