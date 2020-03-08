import { ICoin } from './transaction'
import LCDClient from './util/lcd'

export type IAccount = {
  address: string
  coins: ICoin[]
  public_key: string
  account_number: number
  sequence: number
}

export default class Account extends LCDClient {

  async get(address: string): Promise<IAccount> {
    const account = (await this.query(`/auth/accounts/${address}`)).result.value
    if (!account.address) account.address = address
    return account
  }
}