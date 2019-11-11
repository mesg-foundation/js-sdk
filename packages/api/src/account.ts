import { createClient, promisify } from './util/grpc'
import * as AccountType from './typedef/account'

export type IAccount = AccountType.mesg.types.IAccount

export type AccountGetInputs = AccountType.mesg.api.IGetAccountRequest
export type AccountGetOutputs = Promise<IAccount>

export type AccountListInputs = AccountType.mesg.api.IListAccountRequest
export type AccountListOutputs = Promise<AccountType.mesg.api.IListAccountResponse>

export type AccountCreateInputs = AccountType.mesg.api.ICreateAccountRequest
export type AccountCreateOutputs = Promise<AccountType.mesg.api.ICreateAccountResponse>

export type AccountDeleteInputs = AccountType.mesg.api.IDeleteAccountRequest
export type AccountDeleteOutputs = Promise<AccountType.mesg.api.IDeleteAccountResponse>

export default class Account {

  private _client: any

  constructor(endpoint: string) {
    this._client = createClient('Account', './protobuf/api/account.proto', endpoint)
  }

  async create(request: AccountCreateInputs): AccountCreateOutputs {
    return promisify(this._client, 'Create')(request)
  }

  async get(request: AccountGetInputs): AccountGetOutputs { 
    return promisify(this._client, 'Get')(request)
  }
  
  async list(request: AccountListInputs): AccountListOutputs { 
    return promisify(this._client, 'List')(request)
  }

  async delete(request: AccountDeleteInputs): AccountDeleteOutputs { 
    return promisify(this._client, 'Delete')(request)
  }
}