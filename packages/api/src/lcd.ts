import Service from './service-lcd'
import Instance from './instance-lcd'
import Runner from './runner-lcd'
import Process from './process-lcd'
import Execution from './execution-lcd'
import Ownership from './ownership'
import Account from './account-lcd'
import Transaction, { IStdTx } from './transaction'
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

  createTransaction(stdTx: IStdTx) {
    return new Transaction(stdTx)
  }

  async broadcast(tx: Transaction, mode: 'block' | 'sync' | 'async' = 'block'): Promise<TxResult> {
    const res = await this.postRequest('/txs', { tx: tx.raw, mode }) as TxResult
    if (res.code > 0) throw new Error(res.raw_log)
    return res
  }
}

export default API;
(module).exports = API;
