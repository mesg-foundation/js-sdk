import { Command, flags } from '@oclif/command'
import { prompt } from 'inquirer'
import { loggedIn, login } from '../utils/login'

export default class Login extends Command {
  static description = 'Login to a registry'

  static flags = {
    email: flags.string({ name: 'Email' }),
    password: flags.string({ name: 'Password' })
  }

  async run() {
    const { flags } = this.parse(Login)
    if (loggedIn(this.config.configDir)) this.error('Already logged in')

    const email = flags.email
      ? flags.email
      : ((await prompt([{ name: 'email', message: 'Your email' }])) as any).email
    const password = flags.password
      ? flags.password
      : ((await prompt([{ name: 'password', type: 'password', message: 'Your password' }])) as any).password

    try {
      const { user } = await login(this.config.configDir, email, password)
      this.log(`Successfully logged in with the email: ${user.email}`)
    } catch (e) {
      this.error(e.message)
    }
  }
}
