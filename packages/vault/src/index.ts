import CryptoJS from 'crypto-js'
import { Store } from './type';

const keySize = 256
const iterations = 100

export default class Vault {

  private _store: Store;

  constructor(store: Store) {
    this._store = store
  }

  keys(): string[] {
    return this._store.keys()
  }

  contains(key: string): boolean {
    return this.keys().indexOf(key) >= 0
  }

  set(key: string, value: any, password: string): void {
    if (this.contains(key)) throw new Error(`${key} already present`)
    const ciphertext = this.encrypt(JSON.stringify(value), password)
    this._store.set(key, ciphertext)
  }

  get(key: string, password: string): any {
    if (!this.contains(key)) throw new Error(`${key} is not present`)
    const transitMessage = this._store.get(key)
    try {
      const data = this.decrypt(transitMessage, password)
      return JSON.parse(data)
    } catch(e) {
      throw new Error('Incorrect password')
    }
  }

  // https://github.com/luniehq/cosmos-keys/blob/7d848f325a2f5c32c720f07722b239c6ebded542/src/cosmos-keystore.ts#L144
  private encrypt(message: string, password: string): string {
    const salt = CryptoJS.lib.WordArray.random(128 / 8)

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize / 32,
      iterations: iterations
    })

    const iv = CryptoJS.lib.WordArray.random(128 / 8)

    const encrypted = CryptoJS.AES.encrypt(message, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    })

    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    const transitmessage = salt.toString() + iv.toString() + encrypted.toString()
    return transitmessage
  }

  // https://github.com/luniehq/cosmos-keys/blob/7d848f325a2f5c32c720f07722b239c6ebded542/src/cosmos-keystore.ts#L166
  private decrypt(transitMessage: string, password: string): string {
    const salt = CryptoJS.enc.Hex.parse(transitMessage.substr(0, 32))
    const iv = CryptoJS.enc.Hex.parse(transitMessage.substr(32, 32))
    const encrypted = transitMessage.substring(64)

    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: keySize / 32,
      iterations: iterations
    })

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    }).toString(CryptoJS.enc.Utf8)
    return decrypted
  }
}