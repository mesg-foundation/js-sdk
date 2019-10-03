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

interface ServiceOption {
  name: string
  format: string
  level: string
  colors: boolean
  version: string
  port: number
  path: string
  genesisValidatorTx: string
  genesisTime: string
  chainId: string
  persistentPeers: string
  p2pPort: number
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

  async createEngineService(network: Network, tendermintNetwork: Network, options: ServiceOption) {
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
            `MESG_LOG_FORMAT=${options.format}`,
            `MESG_LOG_LEVEL=${options.level}`,
            `MESG_LOG_FORCECOLORS=${options.colors}`,
            `MESG_NAME=${options.name}`,
            `MESG_TENDERMINT_P2P_PERSISTENTPEERS=${options.persistentPeers}`,
            `MESG_COSMOS_CHAINID=${options.chainId}`,
            `MESG_COSMOS_GENESISVALIDATORTX=${options.genesisValidatorTx}`,
            `MESG_COSMOS_GENESISTIME=${options.genesisTime}`,
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
          {
            Target: tendermintNetwork.id,
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
