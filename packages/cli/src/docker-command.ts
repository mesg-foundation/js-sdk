import {flags} from '@oclif/command'
import {existsSync, mkdirSync} from 'fs'
import {Docker} from 'node-docker-api'
import {Network} from 'node-docker-api/lib/network'
import {Readable, Stream} from 'stream'
const debug = require('debug')('docker')

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

interface LogsOption {
  name: string,
  follow: boolean,
  tail: number
}

interface ServiceOption {
  name: string
  version: string
  port: number
  path: string
  p2pPort: number
  lcdPort: number
}

export default abstract class extends Command {
  static flags = {
    ...Command.flags,
    name: flags.string({
      description: 'Name of the docker service running the engine',
      required: true,
      default: 'engine'
    }),
  }

  private readonly docker: Docker = new Docker(null)

  async listServices(options: ListOption) {
    // docker service ls --filter doesn't do an exact match https://github.com/moby/moby/issues/32985
    const res = await this.docker.service.list({
      filters: {name: [options.name]}
    })
    return res
      .filter(x => (x.data as any)['Spec']['Name'] === options.name)
  }

  async logs(options: LogsOption): Promise<any> {
    const engines = await this.listServices({ name: options.name });
    if (engines.length === 0) {
      throw new Error("No engine is running.")
    }
    return (engines[0]).logs({
      stderr: true,
      stdout: true,
      follow: options.follow,
      tail: options.tail && options.tail >= 0 ? options.tail : 'all'
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

  async createEngineService(network: Network, options: ServiceOption) {
    const image = `mesg/engine:${options.version}`
    if (!existsSync(options.path)) {
      mkdirSync(options.path)
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
            `MESG_NAME=${options.name}`,
          ],
          Mounts: [{
            Source: '/var/run/docker.sock',
            Target: '/var/run/docker.sock',
            Type: 'bind',
          }, {
            Source: options.path,
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
          PublishedPort: options.port,
        }, {
          Protocol: 'tcp',
          PublishMode: 'ingress',
          TargetPort: 26656,
          PublishedPort: options.p2pPort,
        }, {
          Protocol: 'tcp',
          PublishMode: 'ingress',
          TargetPort: 1317,
          PublishedPort: options.lcdPort
        }],
      }
    })
  }

  async pull(tag: string): Promise<object> {
    const stream = (await this.docker.image.create({}, {
      fromImage: 'mesg/engine',
      tag
    })) as Stream
    return new Promise((resolve, reject) => stream
      .on('data', (x: any) => debug(x.toString())) // For some reason we need to listen to the data to have the end event
      .on('error', reject)
      .on('end', resolve))
  }
}
