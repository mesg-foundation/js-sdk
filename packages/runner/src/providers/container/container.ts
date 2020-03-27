import { Docker } from "node-docker-api";
import { Network } from "node-docker-api/lib/network";
import { Container as DockerContainer } from "node-docker-api/lib/container";

export type IContainer = {
  Image?: string;
  ExposedPorts?: { [key: string]: Object };
  Labels?: { [key: string]: string };
  Env?: string[];
  Command?: string;
  Args?: string[];
  HostConfig?: {
    PortBindings?: { [key: string]: { HostPort: string }[] };
    RestartPolicy?: {
      Name: 'on-failure' | 'always' | 'unless-stopped';
      MaximumRetryCount?: number;
    };
    Mounts?: {
      Source: string;
      Target: string;
      Type: 'bind' | 'volume';
    }[],
  },
  NetworkingConfig?: {
    EndpointsConfig?: {
      [key: string]: {
        Aliases: string[]
      }
    }
  }
}

export default class Container {
  private client = new Docker(null)
  private _containerInfo: IContainer = {}
  private _networks: Network[] = []
  private _name: string

  static async findAll(client: any, labels: { [key: string]: string }): Promise<DockerContainer[]> {
    const allLabels = (data: { [key: string]: string }) => Object.keys(labels)
      .reduce((prev, x) => prev && data[x] === labels[x], true)
    const list = await client.container.list({ all: true })
    return (list as any[]).filter(x => allLabels((x.data as any)['Labels'] || {}))
  }

  static async hasImage(client: any, image: string) {
    try {
      await client.image.get(image).status()
      return true
    } catch (e) {
      if (e.statusCode !== 404) throw e
      return false
    }
  }

  static async fetchImage(client: any, image: string) {
    const streamToPromise = (stream: any) => new Promise((resolve, reject) => stream
      .on('data', (x: any) => x.toString()) // For some reason we need to listen to the data to have the end event
      .on('error', reject)
      .on('end', resolve))

    const [fromImage, tag] = image.split(':')
    const stream = await client.image.create({}, {
      fromImage,
      tag: tag || 'latest'
    })
    await streamToPromise(stream)
  }

  constructor(options: IContainer, name: string) {
    this._containerInfo = options
    this._name = name
  }

  // https://stackoverflow.com/questions/20428302/binding-a-port-to-a-host-interface-using-the-rest-api/20429133
  addPorts(ports: string[]): Container {
    if (!this._containerInfo.ExposedPorts) this._containerInfo.ExposedPorts = {}
    if (!this._containerInfo.HostConfig) this._containerInfo.HostConfig = {}
    if (!this._containerInfo.HostConfig.PortBindings) this._containerInfo.HostConfig.PortBindings = {}
    for (const port of ports || []) {
      this._containerInfo.ExposedPorts[`${port}/tcp`] = {}
      this._containerInfo.HostConfig.PortBindings[`${port}/tcp`] = [{ HostPort: port }]
    }
    return this
  }

  // https://stackoverflow.com/questions/60301221/docker-container-cannot-be-connected-to-network-endpoints
  connectTo(network: Network, aliases: string[]): Container {
    if (!this._containerInfo.NetworkingConfig) this._containerInfo.NetworkingConfig = {}
    if (!this._containerInfo.NetworkingConfig.EndpointsConfig) this._containerInfo.NetworkingConfig.EndpointsConfig = {}
    if (Object.keys(this._containerInfo.NetworkingConfig.EndpointsConfig).length === 0) {
      this._containerInfo.NetworkingConfig.EndpointsConfig[network.id] = {
        Aliases: aliases
      }
    } else {
      this._networks.push(network)
    }
    return this
  }

  async start() {
    if (!await Container.hasImage(this.client, this._containerInfo.Image)) {
      await Container.fetchImage(this.client, this._containerInfo.Image)
    }
    const containers = await Container.findAll(this.client, this._containerInfo.Labels)
    const container = containers.length === 1
      ? containers[0]
      : await this.client.container.create({
        ...this._containerInfo,
        name: this._name
      })
    for (const network of this._networks) {
      if ((await network.status() as any).data.Containers[container.id]) continue
      await network.connect({ container: container.id })
    }
    return container.start()
  }
}