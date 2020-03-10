import { Store } from '../type'

export default class Memory implements Store {
  private _store = new Map()

  set(key: string, value: string): void {
    this._store.set(key, value)
  }

  get(key: string): string {
    return this._store.get(key)
  }

  keys(): string[] {
    return [...this._store.keys()]
  }
}