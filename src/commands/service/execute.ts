import {Command, flags} from '@oclif/command'

export default class ServiceExecute extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    json: flags.string({char: 'j', description: 'Path to a JSON file containing the data required to run the task'}),
    data: flags.string({
      char: 'd',
      description: 'data required to run the task',
      multiple: true,
      helpValue: 'FOO=BAR'
    }),
  }

  static args = [{
    name: 'SERVICE',
    required: true,
    description: 'Hash or Sid'
  }, {
    name: 'TASK',
    required: true,
    description: 'Task key'
  }]

  async run() {
    const {args, flags} = this.parse(ServiceExecute)

    this.log('execute', args, flags)
  }
}
