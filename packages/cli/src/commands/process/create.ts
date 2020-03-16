import {flags} from '@oclif/command'

import Command from '../../root-command'
import {findHash} from '../../utils/txevent'
import {IProcess} from '@mesg/api/lib/process-lcd'
import {ICoin} from '@mesg/api/lib/transaction'

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
    const {args, flags} = this.parse(ProcessCreate)
    const definition = JSON.parse(args.DEFINITION) as IProcess
    
    const { account, mnemonic } = await this.getAccount(flags.account)
    this.spinner.start('Create process')

    const tx = await this.lcd.createTransaction(
      [this.lcd.process.createMsg(account.address, definition)],
      account
    )
    const txResult = await this.lcd.broadcast(tx.signWithMnemonic(mnemonic))
    const hashes = findHash(txResult, "process", "CreateProcess")
    if (hashes.length != 1) throw new Error('error while getting the hash of the process created')
    const hash = hashes[0]
    this.spinner.stop(hash)
    const process = await this.lcd.process.get(hash)
    this.createTransfer(process, mnemonic)
    return process
  }

  async createTransfer(process: IProcess, mnemonic: string) {
    const acc = await this.lcd.account.import(mnemonic)
    this.spinner.start('Transfer credits to the process')
    const coins: ICoin[] = [{
      amount: "100000000",
      denom: 'atto'
    }]
    const transferTx = await this.lcd.createTransaction(
      [this.lcd.account.transferMsg(acc.address, process.address, coins)],
      acc
    )
    await this.lcd.broadcast(transferTx.signWithMnemonic(mnemonic))
    this.spinner.stop()
  }
}
