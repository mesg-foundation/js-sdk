import Service from './service-lcd'
import Instance from './instance-lcd'
import Runner from './runner-lcd'
import Process from './process-lcd'
import Execution from './execution-lcd'
import Ownership from './ownership'
import Account, { IAccount } from './account-lcd'
import Transaction, { IMsg, IFee } from './transaction'
import LCDClient from './util/lcd'

type Event = {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
}

type Log = {
  msg_index: number;
  log: string;
  events: Event[]
}

export type TxResult = {
  height: string;
  txhash: string;
  raw_log: string;
  gas_wanted: string;
  gas_used: string;
  data?: string;
  logs?: Log[];
  code?: number;
  codespace?: string;
}

class API extends LCDClient {
  service: Service
  instance: Instance
  runner: Runner
  process: Process
  execution: Execution
  ownership: Ownership
  account: Account

  constructor(endpoint?: string) {
    super(endpoint)
    this.service = new Service(endpoint)
    this.instance = new Instance(endpoint)
    this.runner = new Runner(endpoint)
    this.process = new Process(endpoint)
    this.execution = new Execution(endpoint)
    this.ownership = new Ownership(endpoint)
    this.account = new Account(endpoint)
  }

  async createTransaction(
    msgs: IMsg<any>[],
    account: IAccount,
    opts: { fee?: IFee, chain_id?: string, account_number?: number, sequence?: number, memo?: string } = {}) {
    return new Transaction({
      account_number: opts.account_number
        ? opts.account_number.toString()
        : account.account_number.toString(),
      chain_id: opts.chain_id || (await this.getRequest(`/node_info`)).node_info.network,
      fee: opts.fee || {
        amount: [{ denom: 'atto', amount: '200000' }],
        gas: '200000'
      },
      memo: opts.memo || '',
      msgs: msgs,
      sequence: opts.sequence
        ? opts.sequence.toString()
        : account.sequence.toString()
    })
  }

  async broadcast(tx: Transaction, mode: 'block' | 'sync' | 'async' = 'block'): Promise<TxResult> {
    const res = await this.postRequest('/txs', { tx: tx.raw, mode }) as TxResult
    if (res.code > 0) throw new Error(res.raw_log)
    return res
  }
}

export default API;
(module).exports = API;
