import Command from './root-command'

export default abstract class extends Command {
  static flags = {
    ...Command.flags
  }
}
