import {flags} from '@oclif/command'
import {existsSync, mkdirSync} from 'fs'
import {Docker} from 'node-docker-api'
import {Network} from 'node-docker-api/lib/network'
import {homedir} from 'os'
import {join} from 'path'
import {Readable} from 'stream'

import Command from './root-command'

interface Event {
  Type: string
  Action: string
  from: string
}

interface NetworkOption {
  name: string
}

interface ListOption {
  name: string
}

interface ServiceOption {
  name: string
  format: string
  level: string
  colors: boolean
  version: string
}

export default abstract class extends Command {
  static flags = {
    ...Command.flags,
    name: flags.string({
      description: 'name of the service running the engine',
      required: true,
      default: 'engine'
    }),
  }

  private readonly docker: Docker = new Docker(null)

  async listServices(options: ListOption) {
    return this.docker.service.list({
      filters: {name: [options.name]}
    })
  }

  async waitForEvent(matchFilter: (event: Event) => boolean) {
    return new Promise(async resolve => {
      const events = (await this.docker.events()) as Readable
      const handler = (buffer: Buffer) => {
        try {
          const event = JSON.parse(buffer.toString())
          if (matchFilter(event)) {
            events.destroy()
            return resolve()
          }
        } catch {}
      }
      events.addListener('data', handler)
    })
  }

  async getOrCreateNetwork(options: NetworkOption) {
    const networks = await this.docker.network.list({
      filters: {name: [options.name]}
    })
    if (networks.length > 0) {
      return networks[0]
    }
    return this.docker.network.create({
      CheckDuplicate: true,
      Driver: 'overlay',
      Name: options.name,
      labels: {
        'com.docker.stack.namespace': options.name,
      }
    })
  }

  async createService(network: Network, options: ServiceOption) {
    const image = `mesg/engine:${options.version}`
    const sourcePath = join(homedir(), '.mesg')
    if (!existsSync(sourcePath)) {
      mkdirSync(sourcePath)
    }
    return this.docker.service.create({
      Name: options.name,
      Labels: {
        'com.docker.stack.namespace': options.name,
        'com.docker.stack.image': image,
      },
      TaskTemplate: {
        ContainerSpec: {
          Image: image,
          Labels: {
            'com.docker.stack.namespace': options.name
          },
          Env: [
            `MESG_LOG_FORMAT=${options.format}`,
            `MESG_LOG_LEVEL=${options.level}`,
            `MESG_LOG_FORCECOLORS=${options.colors}`,
            `MESG_NAME=${options.name}`,
          ],
          Mounts: [{
            Source: '/var/run/docker.sock',
            Target: '/var/run/docker.sock',
            Type: 'bind',
          }, {
            Source: sourcePath,
            Target: '/root/.mesg',
            Type: 'bind',
          }],
        },
        Networks: [
          {
            Target: network.id,
            Alias: options.name,
          },
        ]
      },
      EndpointSpec: {
        Ports: [{
          Protocol: 'tcp',
          PublishMode: 'ingress',
          TargetPort: 50052,
          PublishedPort: 50052,
        }]
      }
    })
  }

  parseLog(buffer: Buffer): string[] {
    return buffer.toString()
      .split('\n')
      .map(x => x.substring(8)) // Skip the 8 caracters that docker put in front of its logs
      .filter(x => x)
  }
}
