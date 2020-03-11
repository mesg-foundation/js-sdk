import { Store } from '../type'

export default class LocalStorage implements Store {
  set(key: string, value: string): void {
    localStorage.setItem(key, value)
  }

  get(key: string): string {
    return localStorage.getItem(key)
  }
  
  keys(): string[] {
    return Object.keys(localStorage)
  }
}