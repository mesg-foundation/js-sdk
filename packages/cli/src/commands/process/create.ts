import { flags } from '@oclif/command'

import Command from '../../root-command'
import { findHash } from '../../utils/txevent'
import { IProcess } from '@mesg/api/lib/process-lcd'
import { ICoin } from '@mesg/api/lib/transaction'
import { cli } from 'cli-ux'

export default class ProcessCreate extends Command {
  static description = 'Create a process'

  static flags = {
    ...Command.flags,
    account: flags.string({
      description: 'Account to use to create the process'
    }),
  }

  static args = [{
    name: 'DEFINITION',
    required: true,
    description: 'Process\'s definition. Use process:compile first to build process definition'
  }]

  async run(): Promise<IProcess> {
    const { args, flags } = this.parse(ProcessCreate)
    const definition = JSON.parse(args.DEFINITION) as IProcess

    const { account, mnemonic } = await this.getAccount(flags.account)
    cli.action.start('Create process')

    const tx = await this.lcd.createTransaction(
      [this.lcd.process.createMsg(account.address, definition)],
      account
    )
    const txResult = await this.lcd.broadcast(tx.signWithMnemonic(mnemonic))
    const hashes = findHash(txResult, "process", "CreateProcess")
    if (hashes.length != 1) throw new Error('error while getting the hash of the process created')
    const hash = hashes[0]
    cli.action.stop(hash)
    const process = await this.lcd.process.get(hash)
    return process
  }
}
