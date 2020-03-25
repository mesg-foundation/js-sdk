import { Docker } from "node-docker-api"
import Container from '@mesg/runner/lib/providers/container/container'

const defaultClient = new Docker(null)

export const parseLog = (buffer: Buffer): string[] => {
  return buffer.toString()
    .split('\n')
    .map(x => x.substring(8)) // Skip the 8 characters that docker put in front of its logs
    .filter(x => x)
}

export const hasImage = async (image: string, client = defaultClient) => {
  return Container.hasImage(client, image)
}

export const fetchImageTag = async (image: string, tag: string = 'latest', client = defaultClient) => {
  return Container.fetchImage(client, `${image}:${tag}`)
}

export const createNetwork = async (name: string, client = defaultClient) => {
  const networks = await client.network.list({
    filters: { name: [name] }
  })
  if (networks.length > 0) return networks[0]
  return client.network.create({
    CheckDuplicate: true,
    Name: name,
    labels: { 'mesg.engine': 'true' }
  })
}

export const createContainer = async (image: string, name: string, directory: string, client = defaultClient) => {
  const resourceName = `mesg_${name}`
  const network = await createNetwork(resourceName, client)
  const container = new Container({
    Labels: {
      'mesg.engine': 'true'
    },
    Image: image,
    HostConfig: {
      RestartPolicy: {
        Name: 'on-failure'
      },
      Mounts: [{
        Source: '/var/run/docker.sock',
        Target: '/var/run/docker.sock',
        Type: 'bind',
      }, {
        Source: directory,
        Target: '/root/.mesg',
        Type: 'bind',
      }]
    }
  }, resourceName)
  container.addPorts(['1317', '50052'])
  container.connectTo(network, [name])
  return container.start()
}

export const listContainers = async (filters: { name?: string[], label?: string[] }, client = defaultClient) => {
  // docker service ls --filter doesn't do an exact match https://github.com/moby/moby/issues/32985
  const res = await client.container.list({ filters })
  return filters.name
    ? res.filter(x => (x.data as any)['Name'] === filters.name[0])
    : res
}

export const logs = async (name: string, follow: any, tail: any): Promise<any> => {
  const containers = await listContainers({ name: [name] });
  if (containers.length === 0) {
    throw new Error(`No containers ${name} found.`)
  }
  return (containers[0]).logs({
    stderr: true,
    stdout: true,
    follow,
    tail
  })
}