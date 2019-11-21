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
    const [{services}, {instances}, {ownerships}, {runners}] = await Promise.all([
      this.api.service.list({}),
      this.api.instance.list({}),
      this.api.ownership.list({}),
      this.api.runner.list({}),
    ])
    cli.table(services || [], {
      hash: {header: 'HASH', get: srv => srv.hash ? base58.encode(srv.hash) : ''},
      sid: {header: 'SID', get: srv => srv.sid},
      ownerships: {
        header: 'OWNER',
        get: srv => (ownerships || [])
          .filter(own => own.serviceHash && srv.hash && own.serviceHash.toString() === srv.hash.toString())
          .map(own => own.owner)
          .join('\n')
      },
      instances: {
        header: 'INSTANCES',
        get: srv => (instances || [])
          .filter(inst => inst.serviceHash && srv.hash && inst.serviceHash.toString() === srv.hash.toString())
          .map(inst => base58.encode(inst.hash) + '. Runners: ' + (runners || [])
            .filter(run => run.instanceHash && inst.hash && run.instanceHash.toString() === inst.hash.toString())
            .map(run => run.hash && base58.encode(run.hash))
            .join(" - "))
          .join('\n')
      },
    }, {printLine: this.log, ...flags})
    return instances || []
  }
}
