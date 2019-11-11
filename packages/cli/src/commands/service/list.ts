import cli from 'cli-ux'
import {IInstance} from '@mesg/api/lib/instance'
import * as base58 from '@mesg/api/lib/util/base58'

import Command from '../../root-command'

export default class ServiceList extends Command {
  static description = 'List running services'

  static flags = {
    ...Command.flags,
    ...cli.table.flags()
  }

  async run(): Promise<IInstance[]> {
    const {flags} = this.parse(ServiceList)
    const [{services}, {instances}, {ownerships}] = await Promise.all([
      this.api.service.list({}),
      this.api.instance.list({}),
      this.api.ownership.list({})
    ])
    cli.table(services || [], {
      hash: {header: 'HASH', get: x => x.hash ? base58.encode(x.hash) : ''},
      sid: {header: 'SID', get: x => x.sid},
      ownerships: {
        header: 'OWNER',
        get: x => (ownerships || [])
          .filter(y => y.serviceHash && x.hash && y.serviceHash.toString() === x.hash.toString())
          .map(y => y.owner)
          .join('\n')
      },
      instances: {
        header: 'INSTANCES',
        get: x => (instances || [])
          .filter(y => y.serviceHash && x.hash && y.serviceHash.toString() === x.hash.toString())
          .map(y => y.hash && base58.encode(y.hash))
          .join('\n')
      },
    }, {printLine: this.log, ...flags})
    return instances || []
  }
}
