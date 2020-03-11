import LCDClient from './util/lcd'
import { validateMnemonic, mnemonicToSeedSync } from 'bip39'
import { fromSeed, BIP32Interface } from 'bip32'
import { toWords, encode } from 'bech32'

export const bech32Prefix = 'mesgtest'
export const defaultHDPath = "m/44'/470'/0'/0/0"

export type IAccount = {
  address: string
  coins: any[]
  public_key: string
  account_number: number
  sequence: number
}

const deriveMnemonic = (mnemonic: string, path: string = defaultHDPath): BIP32Interface => {
  if (!validateMnemonic(mnemonic)) throw new Error('invalid mnemonic')
  const seed = mnemonicToSeedSync(mnemonic)
  const masterKey = fromSeed(seed)
  return masterKey.derivePath(path)
}

export default class Account extends LCDClient {

  static getPrivateKey(mnemonic: string, path?: string): Buffer {
    return deriveMnemonic(mnemonic, path).privateKey
  }

  async import(mnemonic: string, path?: string, prefix: string = bech32Prefix): Promise<IAccount> {
    const child = await deriveMnemonic(mnemonic, path)
    const address = encode(prefix, toWords(child.identifier))
    return this.get(address)
  }

  async get(address: string): Promise<IAccount> {
    const account = (await this.query(`/auth/accounts/${address}`)).result.value
    if (!account.address) account.address = address
    return account
  }
}