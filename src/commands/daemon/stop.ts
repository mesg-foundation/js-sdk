import Command from '../../docker-command'

import Status, {ServiceStatus} from './status'

export default class Stop extends Command {
  static description = 'Stop the MESG Core\'s daemon'

  static flags = {
    ...Command.flags
  }

  async run() {
    const {flags} = this.parse(Stop)

    const status = await Status.run(['--name', flags.name])
    if (status === ServiceStatus.STOPPED) {
      return false
    }
    this.spinner.start('MESG Core')
    this.spinner.status = 'Fetching services'
    const services = await this.listServices({name: flags.name})
    if (services.length === 0) return
    const service = services[0]
    const eventPromise = this.waitForEvent(({Action, from, Type}) =>
      Type === 'container' &&
      Action === 'destroy' &&
      from === (service.data as any).Spec.TaskTemplate.ContainerSpec.Image
    )
    this.spinner.status = 'Removing service'
    await service.remove()
    await eventPromise
    this.spinner.stop('stopped')

    return true
  }
}
