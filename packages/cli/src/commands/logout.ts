import { Command } from '@oclif/command'
import { logout } from '../utils/login'

export default class Logout extends Command {
  static description = 'Logout from a registry'

  async run() {
    logout(this.config.configDir)
    this.log('Successfully logged out')
  }
}
