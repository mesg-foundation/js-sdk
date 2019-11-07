import Command from '../../docker-command'

import Status, {ServiceStatus} from './status'

export default class Stop extends Command {
  static description = 'Stop the Engine'

  static flags = {
    ...Command.flags
  }

  async run() {
    const {flags} = this.parse(Stop)

    const status = await Status.run(['--name', flags.name, '--silent', ...this.flagsAsArgs(flags)])
    if (status === ServiceStatus.STOPPED) {
      this.log('Engine is already stopped')
      return false
    }
    this.spinner.start('Stopping Engine')
    const services = await this.listServices({name: flags.name})
    if (services.length === 0) return false
    const service = services[0]
    const eventPromise = this.waitForEvent(({Action, from, Type}) =>
      Type === 'container' &&
      Action === 'destroy' &&
      from === (service.data as any).Spec.TaskTemplate.ContainerSpec.Image
    )
    await service.remove()
    await eventPromise
    this.spinner.stop()
    return true
  }
}
