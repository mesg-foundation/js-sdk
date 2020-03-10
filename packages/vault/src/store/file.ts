import { readFileSync, writeFileSync, existsSync } from 'fs'
import { Store } from '../type'

export default class File implements Store {
  private _path: string

  constructor(path: string) {
    this._path = path
  }

  setItem(key: string, value: string): void {
    const data = this.loadStore()
    data[key] = value
    writeFileSync(this._path, JSON.stringify(data))
  }

  getItem(key: string): string {
    return this.loadStore()[key]
  }

  private loadStore(): any {
    return existsSync(this._path)
      ? JSON.parse(readFileSync(this._path).toString())
      : {}
  }
}