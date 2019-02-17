import {flags} from '@oclif/command'
import {lstatSync, readdirSync} from 'fs'
import {tmpdir} from 'os'
import {join} from 'path'

import Command from '../../service-command'

const gitclone = require('git-clone')
const gitInfo = require('hosted-git-info')
const isGitUrl = require('is-git-url')
const {isURL} = require('validator')
const rimraf = require('rimraf').sync
const downloadTarball = require('download-tarball')
const uuid = require('uuid/v4')

export default class ServiceDeploy extends Command {
  static description = 'Deploy a service'

  static flags = {
    ...Command.flags,
    env: flags.string({
      description: 'set env defined in mesg.yml (configuration.env)',
      multiple: true,
      helpValue: 'FOO=BAR'
    })
  }

  static args = [{
    name: 'SERVICE_PATH_OR_URL',
    description: 'Path of the service or url to access it',
    default: './'
  }]

  async run() {
    const {args} = this.parse(ServiceDeploy)

    const path = this.preprocessPath(await this.preprocessURL(args.SERVICE_PATH_OR_URL))

    this.log('path', path)
  }

  async preprocessURL(pathOrUrl: string): Promise<string> {
    if (isGitUrl(pathOrUrl) || isURL(pathOrUrl)) {
      return this.downloadSrc(pathOrUrl)
    }
    return pathOrUrl
  }

  preprocessPath(path: string): string {
    const directories = readdirSync(path)
      .map(name => join(path, name))
      .filter(x => lstatSync(x).isDirectory())
    if (readdirSync(path).length && directories.length === 1) {
      return directories[0]
    }
    return path
  }

  async downloadSrc(url: string): Promise<string> {
    const dir = join(tmpdir(), uuid())
    if (gitInfo.fromUrl(url)) {
      return this.gitclone(url, dir)
    }
    await downloadTarball({url, dir})
    return dir
  }

  async gitclone(git: string, dir: string) {
    const url = git.split('#')[0]
    const checkout = git.split('#')[1] || 'master'
    return new Promise((resolve: (dir: string) => any, reject: (err: string) => any) => {
      const opts = {
        checkout,
        shallow: checkout === 'master'
      }
      gitclone(url, dir, opts, (err: any) => {
        if (err) return reject(err)
        rimraf(join(dir, '.git'))
        return resolve(dir)
      })
    })
  }
}
