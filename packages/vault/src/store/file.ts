import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { Store } from '../type'

export default class File implements Store {
  private _path: string

  constructor(path: string) {
    this._path = path
    mkdirSync(dirname(resolve(this._path)), { recursive: true })
  }

  set(key: string, value: string): void {
    const data = this.loadStore()
    data[key] = value
    writeFileSync(this._path, JSON.stringify(data))
  }

  get(key: string): string {
    return this.loadStore()[key]
  }

  keys(): string[] {
    return Object.keys(this.loadStore())
  }

  private loadStore(): any {
    return existsSync(this._path)
      ? JSON.parse(readFileSync(this._path).toString())
      : {}
  }
}