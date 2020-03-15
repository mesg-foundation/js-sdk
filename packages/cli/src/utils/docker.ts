import { Docker } from "node-docker-api"
import { Stream, Readable } from "stream"

const defaultClient = new Docker(null)

export const parseLog = (buffer: Buffer): string[] => {
  return buffer.toString()
    .split('\n')
    .map(x => x.substring(8)) // Skip the 8 characters that docker put in front of its logs
    .filter(x => x)
}

export const hasImage = async (image: string, client = defaultClient) => {
  try {
    await client.image.get(image).status()
    return true
  } catch (e) {
    if (e.statusCode !== 404) throw e
    return false
  }
}

export const waitForEvent = async (matchFilter: (event: { Type: string, Action: string, from: string }) => boolean, client = defaultClient) => new Promise(async resolve => {
  const events = (await client.events()) as Readable
  const handler = (buffer: Buffer) => {
    try {
      const event = JSON.parse(buffer.toString())
      if (matchFilter(event)) {
        events.destroy()
        return resolve()
      }
    } catch { }
  }
  events.addListener('data', handler)
})

export const fetchImageTag = async (image: string, tag: string = 'latest', client = defaultClient) => {
  const stream = (await client.image.create({}, {
    fromImage: image,
    tag
  })) as Stream
  return new Promise((resolve, reject) => stream
    .on('data', (x: any) => x.toString()) // For some reason we need to listen to the data to have the end event
    .on('error', reject)
    .on('end', resolve))
}

export const createNetwork = async (name: string, client = defaultClient) => {
  const networks = await client.network.list({
    filters: { name: [name] }
  })
  if (networks.length > 0) return networks[0]
  return client.network.create({
    CheckDuplicate: true,
    Driver: 'overlay',
    Name: name,
    labels: {
      'com.docker.stack.namespace': name,
    }
  })
}

export const createService = async (image: string, name: string, directory: string, client = defaultClient) => {
  const network = await createNetwork(name, client)
  return client.service.create({
    Name: name,
    Labels: {
      'com.docker.stack.namespace': name,
      'com.docker.stack.image': image,
    },
    TaskTemplate: {
      ContainerSpec: {
        Image: image,
        Labels: {
          'com.docker.stack.namespace': name
        },
        Env: [
          `MESG_NAME=${name}`,
        ],
        Mounts: [{
          Source: '/var/run/docker.sock',
          Target: '/var/run/docker.sock',
          Type: 'bind',
        }, {
          Source: directory,
          Target: '/root/.mesg',
          Type: 'bind',
        }],
      },
      Networks: [
        {
          Target: network.id,
          Alias: name,
        },
      ]
    },
    EndpointSpec: {
      Ports: [{
        Protocol: 'tcp',
        PublishMode: 'ingress',
        TargetPort: 50052,
        PublishedPort: 50052,
      }, {
        Protocol: 'tcp',
        PublishMode: 'ingress',
        TargetPort: 26656,
        PublishedPort: 26656,
      }, {
        Protocol: 'tcp',
        PublishMode: 'ingress',
        TargetPort: 1317,
        PublishedPort: 1317
      }],
    }
  })
}

export const listServices = async (filters: { name?: string[], label?: string[] }, client = defaultClient) => {
  // docker service ls --filter doesn't do an exact match https://github.com/moby/moby/issues/32985
  const res = await client.service.list({ filters })
  return filters.name
    ? res.filter(x => (x.data as any)['Spec']['Name'] === filters.name[0])
    : res
}

export const logs = async (name: string, follow: any, tail: any): Promise<any> => {
  const services = await listServices({ name: [name] });
  if (services.length === 0) {
    throw new Error(`No services ${name} found.`)
  }
  return (services[0]).logs({
    stderr: true,
    stdout: true,
    follow,
    tail
  })
}