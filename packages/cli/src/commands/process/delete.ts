import {flags} from '@oclif/command'
import cli from 'cli-ux'

import Command from '../../root-command'
import { findHash } from '../../utils/txevent'

export default class ProcessDelete extends Command {
  static description = 'Delete one or many processes'

  static flags = {
    ...Command.flags,
    confirm: flags.boolean({description: 'Confirm deletion', default: false}),
    account: flags.string({
      description: 'Account to use to delete the process'
    })
  }

  static strict = false

  static args = [{
    name: 'PROCESS_HASH...',
    required: true,
  }]

  async run(): Promise<string[]> {
    const {argv, flags} = this.parse(ProcessDelete)
    const { account, mnemonic } = await this.getAccount(flags.account)
    if (!flags.confirm && !await cli.confirm('Are you sure?')) return []
    this.spinner.start('Deleting process(s)')
    const tx = await this.lcd.createTransaction(
      argv.map(hash => this.lcd.process.deleteMsg(account.address, hash)),
      account
    )
    const txResult = await this.lcd.broadcast(tx.signWithMnemonic(mnemonic))
    this.spinner.stop()
    return findHash(txResult, 'process', 'DeleteProcess')
  }
}
