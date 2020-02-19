import LCDClient from './util/lcdClient'
import { ICoin } from './transaction'

export type IAccount = {
  address: string
  coins: ICoin[]
  public_key: string
  account_number: number
  sequence: number
}

export default class Account extends LCDClient {

  async get(address: string): Promise<IAccount> {
    return (await this.query(`/auth/accounts/${address}`)).result.value
  }
}