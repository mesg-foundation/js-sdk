import {flags} from '@oclif/command'
import {mkdirSync, existsSync, writeFileSync} from 'fs'
import fetch from 'node-fetch'
import {homedir} from 'os'
import {join} from 'path'

import Command from '../../docker-command'
import version from '../../version'

import Status, {ServiceStatus} from './status'

export default class Start extends Command {
  static description = 'Start the Engine'

  static flags = {
    ...Command.flags,
    version: flags.string({
      description: 'Version of the Engine to run',
      required: true,
      default: version.engine
    }),
    path: flags.string({
      description: 'Path to the mesg folder',
      default: join(homedir(), '.mesg'),
      required: true,
    }),
    pull: flags.boolean({
      description: 'Pull the latest image of the given version',
      default: true,
      allowNo: true
    }),
    'p2p-port': flags.integer({
      description: 'Port to use for p2p interaction',
      default: 26656,
      required: true,
    }),
    network: flags.string({
      description: 'Name of the network to connect to'
    })
  }

  async run() {
    const {flags} = this.parse(Start)

    const status = await Status.run(['--name', flags.name, '--silent', ...this.flagsAsArgs(flags)])
    if (status === ServiceStatus.STARTED) {
      this.log('Engine is already started')
      return false
    }

    if (flags.pull) {
      this.spinner.start(`Pulling version ${flags.version}`)
      await this.pull(flags.version)
      this.spinner.stop()
    }

    this.spinner.start('Starting Engine')
    const eventPromise = this.waitForEvent(({Action, Type, from}) =>
      Type === 'container' &&
      Action === 'start' &&
      from === `mesg/engine:${flags.version}`
    )
    await this.prepareNetwork(flags.network, flags.path)
    const dockerNetwork = await this.getOrCreateNetwork({ name: flags.name })
    await this.createEngineService(dockerNetwork, {
      name: flags.name,
      version: flags.version,
      path: flags.path,
      port: flags.port,
      p2pPort: flags['p2p-port'],
    })
    await eventPromise
    await this.waitForAPI()
    this.spinner.stop()
    return true
  }

  async waitForAPI() {
    try {
      await this.api.service.list({})
    } catch (e) {
      // code 2: Error: 2 UNKNOWN: Stream removed
      // code 14: Error: 14 UNAVAILABLE: failed to connect to all addresses
      if (e.code === 2 || e.code === 14) {
        return new Promise(resolve => {
          setTimeout(() => this.waitForAPI().then(resolve), 1000)
        })
      }
      throw e
    }
  }

  async prepareNetwork(network: string, path: string) {
    mkdirSync(path, {recursive: true})
    if (!network) return // This is the default network, the engine will setup everything

    const updateConfig = async (path: string, file: string, remote: string) => {
      if (!existsSync(path)) mkdirSync(path, {recursive: true})
      if (existsSync(join(path, file))) return
      const response = await fetch(remote)
      if (response.status !== 200) throw new Error(`network "${network}" doesn't exist`)
      const data = await response.text()
      writeFileSync(join(path, file), data)
    }

    const networkEndpoint = "https://raw.githubusercontent.com/mesg-foundation/networks/master/networks"
    await updateConfig(
      path, 'config.yml',
      `${networkEndpoint}/${network}/config.yml`
    )

    await updateConfig(
      join(path, 'tendermint', 'config'), 'genesis.json',
      `${networkEndpoint}/${network}/genesis.json`
    )
  }
}
