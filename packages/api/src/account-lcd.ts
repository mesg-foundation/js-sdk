import { ICoin, IMsg } from './transaction'
import LCDClient from './util/lcd'
import { validateMnemonic, mnemonicToSeedSync, entropyToMnemonic } from 'bip39'
import { fromSeed, BIP32Interface } from 'bip32'
import { toWords, encode } from 'bech32'
import { randomBytes } from 'crypto'

export const bech32Prefix = 'mesgtest'
export const defaultHDPath = "m/44'/470'/0'/0/0"

export type IAccount = {
  address: string
  coins: ICoin[]
  public_key: string
  account_number: number
  sequence: number
}

export type IMsgTransfer = {
  from_address: string;
  to_address: string;
  amount: ICoin[];
}

export default class Account extends LCDClient {
  
  static deriveMnemonic(mnemonic: string, path: string = defaultHDPath): BIP32Interface {
    if (!validateMnemonic(mnemonic)) throw new Error('invalid mnemonic')
    const seed = mnemonicToSeedSync(mnemonic)
    const masterKey = fromSeed(seed)
    return masterKey.derivePath(path)
  }

  static getPrivateKey(mnemonic: string, path?: string): Buffer {
    return Account.deriveMnemonic(mnemonic, path).privateKey
  }

  static generateMnemonic(): string {
    const entropy = randomBytes(32)
    if (entropy.length !== 32) throw Error(`Entropy has incorrect length`)
    return entropyToMnemonic(entropy.toString('hex'))
  }

  transferMsg(from: string, to: string, amount: ICoin[]): IMsg<IMsgTransfer> {
    return {
      type: 'cosmos-sdk/MsgSend',
      value: {
        from_address: from,
        to_address: to,
        amount
      }
    }
  }

  async import(mnemonic: string, path?: string, prefix: string = bech32Prefix): Promise<IAccount> {
    const child = await Account.deriveMnemonic(mnemonic, path)
    const address = encode(prefix, toWords(child.identifier))
    return this.get(address)
  }

  async get(address: string): Promise<IAccount> {
    const account = (await this.query(`/auth/accounts/${address}`)).result.value
    if (!account.address) account.address = address
    return account
  }
}