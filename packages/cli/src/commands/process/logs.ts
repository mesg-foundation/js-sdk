import chalk from 'chalk'
import { IService } from '@mesg/api/lib/service'
import { ExecutionStatus } from '@mesg/api/lib/types'
import { IExecution } from '@mesg/api/lib/execution'
import * as b58 from '@mesg/api/lib/util/base58'
import {decode} from '@mesg/api/lib/util/encoder'
import {inspect} from 'util'

import Command from '../../root-command'

export default class ProcessLogs extends Command {
  static description = 'Log the executions related to a process'

  static flags = {
    ...Command.flags,
  }

  static args = [{
    name: 'PROCESS_HASH',
    required: true,
  }]

  services: {[key: string]: IService} = {}

  async run() {
    const {args} = this.parse(ProcessLogs)

    const process = await this.api.process.get({
      hash: b58.decode(args.PROCESS_HASH)
    })
    if (!process.hash) {
      throw new Error('invalid process hash')
    }
    if (process.nodes) {
      const instanceHashes = process.nodes
        .map(({event, result, task}) => {
          if (event) return event.instanceHash
          if (result) return result.instanceHash
          if (task) return task.instanceHash
        })
        .filter(x => x && x.length > 0)
      for (const hash of instanceHashes) {
        if (!hash) continue
        const instance = await this.api.instance.get({hash})
        const service = await this.api.service.get({hash: instance.serviceHash})
        this.services[b58.encode(hash)] = service
      }
    }

    const streams: (() => any)[] = []
    const results = this.api.execution.stream({
      filter: {
        statuses: [
          ExecutionStatus.COMPLETED,
          ExecutionStatus.FAILED,
        ],
      }
    })
    streams.push(() => results.cancel())
    results
      .on('data', this.handlerResult(process.hash))
      .on('error', (error: Error) => { this.warn('Result stream error: ' + error.message) })

    return {
      destroy: () => {
        streams.forEach(s => s())
      }
    }
  }

  handlerResult(processHash: Uint8Array) {
    return (execution: IExecution) => {
      if (!execution.processHash) return
      if (b58.encode(execution.processHash) !== b58.encode(processHash)) return
      this.log(this.formatResult(execution))
    }
  }

  formatResult(execution: IExecution) {
    if (!execution.instanceHash) return
    const prefix = [
      `[${execution.nodeKey}]`,
      b58.encode(execution.instanceHash),
      this.services[b58.encode(execution.instanceHash)].sid,
      execution.taskKey,
    ].join(' - ')
    if (execution.error) {
      return `${prefix}: ` + chalk.red('ERROR:', execution.error)
    }
    if (!execution.outputs) return
    return prefix +
      '\n\tinputs:  ' + chalk.gray(inspect(decode(execution.inputs || {}))) +
      '\n\toutputs: ' + chalk.gray(inspect(decode(execution.outputs || {}))) +
      '\n'
  }
}
