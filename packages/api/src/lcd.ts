import Service from './service-lcd'
import Instance from './instance-lcd'
import Runner from './runner-lcd'
import Process from './process-lcd'
import Execution from './execution-lcd'
import Ownership from './ownership-lcd'
import Account from './account-lcd'

class API {
  service: Service
  instance: Instance
  runner: Runner
  process: Process
  execution: Execution
  ownership: Ownership
  account: Account

  constructor(endpoint?: string) {
    this.service = new Service(endpoint)
    this.instance = new Instance(endpoint)
    this.runner = new Runner(endpoint)
    this.process = new Process(endpoint)
    this.execution = new Execution(endpoint)
    this.ownership = new Ownership(endpoint)
    this.account = new Account(endpoint)
  }
}

export default API;
(module).exports = API;
