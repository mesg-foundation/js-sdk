import cli from 'cli-ux'

import Command from '../../docker-command'

import Status, {ServiceStatus} from './status'

export default class Stop extends Command {
  static description = 'Stop the Core'

  static flags = {
    ...Command.flags
  }

  async run() {
    const {flags} = this.parse(Stop)

    const status = await Status.run(['--name', flags.name])
    if (status === ServiceStatus.STOPPED) {
      return false
    }
    cli.action.start('MESG Core')
    cli.action.status = 'Fetching services'
    const services = await this.listServices({name: flags.name})
    if (services.length === 0) return
    const service = services[0]
    const eventPromise = this.waitForEvent(({Action, from, Type}) =>
      Type === 'container' &&
      Action === 'destroy' &&
      from === (service.data as any).Spec.TaskTemplate.ContainerSpec.Image
    )
    cli.action.status = 'Removing service'
    await service.remove()
    await eventPromise
    cli.action.stop('stopped')

    return true
  }
}
