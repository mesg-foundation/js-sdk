import {flags} from '@oclif/command'
import chalk from 'chalk'
import { IService } from '@mesg/api/lib/service-lcd'
import { ExecutionStatus } from '@mesg/api/lib/types'
import { IExecution } from '@mesg/api/lib/execution'
import * as b58 from '@mesg/api/lib/util/base58'
import {decode} from '@mesg/api/lib/util/encoder'
import {inspect} from 'util'
import Command from '../../root-command'
import * as Docker from '../../utils/docker'

export default class ProcessLogs extends Command {
  static description = 'Log the executions related to a process'

  static flags = {
    ...Command.flags,
    tail: flags.integer({
      description: 'Display the last N lines',
      default: 10000
    }),
    follow: flags.boolean({
      description: 'Follow logs',
      allowNo: true,
      default: true
    })
  }

  static args = [{
    name: 'PROCESS_HASH',
    required: true,
  }]

  services: {[key: string]: IService} = {}

  async run() {
    const {args, flags} = this.parse(ProcessLogs)

    const process = await this.lcd.process.get(args.PROCESS_HASH)
    if (!process.hash) {
      throw new Error('invalid process hash')
    }
    if (process.nodes) {
      const instanceHashes = process.nodes
        .map(node => {
          switch(node.Type.type) {
            case "mesg.types.Process_Node_Event_": return node.Type.value.event.instanceHash
            case "mesg.types.Process_Node_Result_": return node.Type.value.result.instanceHash
            case "mesg.types.Process_Node_Task_": return node.Type.value.task.instanceHash
          }
        })
        .filter(x => x && x.length > 0)
      for (const hash of instanceHashes) {
        if (!hash) continue
        const instance = await this.lcd.instance.get(hash)
        const service = await this.lcd.service.get(instance.serviceHash)
        this.services[hash] = service
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
    const logs: any = await Docker.logs('engine', flags.follow, flags.tail && flags.tail >= 0 ? flags.tail : 'all');
    streams.push(() => logs.destroy())
    logs
      .on('data', (buffer: Buffer) => Docker.parseLog(buffer).forEach(x => {
          if (x.includes("module=orchestrator")) {
            this.log(x)
          }
        })
      )
      .on('error', (error: Error) => { this.warn('Result stream error: ' + error.message) })
    return {
      destroy: () => {
        streams.forEach(s => s())
      }
    }
  }

  handlerResult(processHash: string) {
    return (execution: IExecution) => {
      if (!execution.processHash) return
      if (b58.encode(execution.processHash) !== processHash) return
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
