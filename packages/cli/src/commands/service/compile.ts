import {readFileSync} from 'fs'
import {IService} from '@mesg/api/lib/service'
import {service as serviceCompiler} from '@mesg/compiler'
import {join} from 'path'
import {hashService} from '@mesg/api/lib/util/hash'
import * as bs58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'
import deployer, {createTar} from '../../utils/deployer'

const ipfsClient = require('ipfs-http-client')

export default class ServiceCompile extends Command {
  static description = 'Compile a service and upload its source to IPFS server'

  static flags = {
    ...Command.flags
  }

  static args = [{
    name: 'SERVICE',
    description: 'Path or url of a service',
    default: './'
  }]

  private readonly IPFS = ipfsClient('ipfs.app.mesg.com', '5001', {protocol: 'http'})

  async run(): Promise<IService> {
    const {args} = this.parse(ServiceCompile)
    this.spinner.status = 'Download sources'
    const path = await deployer(args.SERVICE)
    const definition = await serviceCompiler(readFileSync(join(path, 'mesg.yml')))
    definition.source = await this.deploySources(path)
    this.styledJSON(definition)

    console.log('service hash', bs58.encode(hashService(definition)))

    this.spinner.stop()
    return definition
  }

  private async deploySources(path: string): Promise<string> {
    const buffer: any[] = []
    return new Promise<string>((resolve, reject) => {
      createTar(join(path))
        .on('data', (data: any) => buffer.push(...data))
        .once('error', reject)
        .on('end', async () => resolve(await this.upload(Buffer.from(buffer)))
        )
    })
  }

  private async upload(buffer: Buffer): Promise<string> {
    const res = await this.IPFS.add(Buffer.from(buffer), {pin: true})
    if (!res.length) {
      throw new Error('pushing service manifest failed: run service:compile again')
    }
    return res[0].hash
  }
}
