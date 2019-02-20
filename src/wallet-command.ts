import Command from './root-command'

export default abstract class extends Command {
  static flags = {
    ...Command.flags
  }

  protected walletServiceID = 'ethwallet'
  protected tasks = {
    create: 'create',
    delete: 'delete',
    export: 'export',
    import: 'import',
    importPK: 'importFromPrivateKey',
    list: 'list',
    sign: 'sign',
  }
}
