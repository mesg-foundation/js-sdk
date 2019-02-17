import {flags} from '@oclif/command'
import cli from 'cli-ux'
import {lstatSync, readdirSync} from 'fs'
import {fromUrl} from 'hosted-git-info'
import isGitUrl from 'is-git-url'
import {tmpdir} from 'os'
import {join} from 'path'
import {sync as rimraf} from 'rimraf'
import tar from 'tar'
import {v4 as uuid} from 'uuid'
import {isURL} from 'validator'

import Command from '../../service-command'

const gitclone = require('git-clone')
const downloadTarball = require('download-tarball')

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
    const {args, flags} = this.parse(ServiceDeploy)

    cli.action.start('Deploy service')
    const path = this.preprocessPath(await this.preprocessURL(args.SERVICE_PATH_OR_URL))

    const stream = this.mesg.api.DeployService()
    stream.on('error', this.error)
    stream.on('data', this.handleDeploymentResponse.bind(this))
    if (flags.env && flags.env.length > 0) {
      const env = flags.env.reduce((prev, item) => {
        const [key, value] = item.split('=')
        return {
          ...prev,
          [key]: value
        }
      }, {})
      stream.write({env})
    }

    const ignore = ['.git']
    const reader = tar.create({
      cwd: path,
      filter: (path: string) => !ignore.includes(path),
      strict: true,
      gzip: true,
    }, readdirSync(path))
    reader.on('error', this.error)
    reader.on('data', (chunk: Buffer) => {
      if (chunk.length > 0) stream.write({chunk})
    })
    reader.on('end', () => stream.end(''))
  }

  async preprocessURL(pathOrUrl: string): Promise<string> {
    if (isGitUrl(pathOrUrl) || isURL(pathOrUrl)) {
      return this.downloadSrc(pathOrUrl)
    }
    return pathOrUrl
  }

  async downloadSrc(url: string): Promise<string> {
    const dir = join(tmpdir(), uuid())
    if (fromUrl(url)) {
      cli.action.status = 'Clone repository'
      return this.gitclone(url, dir)
    }
    cli.action.status = 'Download tarball'
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

  preprocessPath(path: string): string {
    const directories = readdirSync(path)
      .map(name => join(path, name))
      .filter(x => lstatSync(x).isDirectory())
    if (readdirSync(path).length === 1 && directories.length === 1) {
      return directories[0]
    }
    return path
  }

  handleDeploymentResponse(x: any) {
    if (x.status) {
      cli.action.status = x.status.message
    } else if (x.serviceID) {
      cli.action.stop(x.serviceID)
    } else {
      this.warn(x.validationError)
      cli.action.stop('failed')
    }
  }
}
