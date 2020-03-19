import {existsSync, lstatSync, readdirSync, readFileSync, Stats, statSync} from 'fs'
import {fromUrl} from 'hosted-git-info'
import ignore from 'ignore'
import isGitUrl from 'is-git-url'
import {tmpdir} from 'os'
import {join} from 'path'
import {sync as rimraf} from 'rimraf'
import {Readable} from 'stream'
import tar from 'tar'
import {v4 as uuid} from 'uuid'
import {isURL} from 'validator'

const MB = 1024 * 1024
const MAX_UPLOAD_SIZE = MB * 10

const downloadTarball = require('download-tarball')
const gitclone = require('git-clone')

const downloadSrc = async (url: string): Promise<string> => {
  const dir = join(tmpdir(), uuid())
  if (fromUrl(url)) {
    return clone(url, dir)
  }
  await downloadTarball({url, dir})
  return dir
}

const clone = async (git: string, dir: string) => {
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

const preprocessPath = (path: string): string => {
  const directories = readdirSync(path)
    .map(name => join(path, name))
    .filter(x => lstatSync(x).isDirectory())
  if (readdirSync(path).length === 1 && directories.length === 1) {
    return directories[0]
  }
  return path
}

const directorySize = (path: string, accept: (path: string) => boolean): number => {
  const fileAndStat = (x: string) => ({file: x, stat: statSync(join(path, x))})
  const sizeOf = ({file, stat}: { file: string, stat: Stats }) => stat.isDirectory()
    ? directorySize(join(path, file), accept)
    : stat.size

  return readdirSync(path, 'utf8')
    .filter(accept)
    .map(fileAndStat)
    .map(sizeOf)
    .reduce((prev, next) => prev + next, 0)
}

export const createTar = (path: string): Readable => {
  const mesgignore = join(path, '.mesgignore')
  const ig = ignore().add([
    '.git',
    '.mesg',
    ...(existsSync(mesgignore) ? readFileSync(mesgignore).toString().split('\n') : [])
  ])
  const filter = ig.createFilter()
  const dirSize = directorySize(path, filter)
  if (dirSize > MAX_UPLOAD_SIZE) throw new Error(`Max size upload ${MAX_UPLOAD_SIZE / MB}MB`)

  return tar.create({
    cwd: path,
    filter,
    strict: true,
    gzip: true,
    portable: true,
    noMtime: true,
  } as any, readdirSync(path))
    .on('error', (error: Error) => {
      throw error
    })
}

export default async (pathOrUrl: string): Promise<string> => {
  if (isGitUrl(pathOrUrl) || isURL(pathOrUrl)) {
    return preprocessPath(await downloadSrc(pathOrUrl))
  }
  return preprocessPath(pathOrUrl)
}
