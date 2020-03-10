import { Store } from '../type'

export default class Memory implements Store {
  private _store = new Map()

  setItem(key: string, value: string): void {
    this._store.set(key, value)
  }

  getItem(key: string): string {
    return this._store.get(key)
  }
}