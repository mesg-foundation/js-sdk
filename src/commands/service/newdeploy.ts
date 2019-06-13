import Command from '../../service-command'

export default class ServiceDeployNew extends Command {
  static description = 'Deploy a service'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Service\'s definition. Use service:compile first to build service definition'
  }]

  static hidden = true

  async run(): Promise<string> {
    const {args} = this.parse(ServiceDeployNew)
    this.spinner.start('Deploy service')
    return new Promise<string>((resolve, reject) => {
      this.serviceAPI.Create({definition: JSON.parse(args.SERVICE)}, (err: any, resp: any) => {
        if (err) {
          reject(err)
          this.spinner.stop(err)
          return
        }
        this.spinner.stop(`${resp.sid} (${resp.hash})`)
        resolve(resp.hash)
      })
    })
  }
}
