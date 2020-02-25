import Event from './event'
import Execution from './execution'
import Instance from './instance'
import Ownership from './ownership'
import Process from './process'
import Service from './service'
import Runner from './runner'
import Account from './account'

class API {

  account: Account
  event: Event
  execution: Execution
  instance: Instance
  ownership: Ownership
  process: Process
  service: Service
  runner: Runner

  constructor(endpoint: string, lcdEndpoint: string = "http://localhost:1317") {
    this.account = new Account(lcdEndpoint)
    this.event = new Event(endpoint)
    this.execution = new Execution(endpoint, lcdEndpoint)
    this.instance = new Instance(lcdEndpoint)
    this.ownership = new Ownership(lcdEndpoint)
    this.process = new Process(lcdEndpoint)
    this.service = new Service(lcdEndpoint)
    this.runner = new Runner(lcdEndpoint)
  }
}

export default API;
(module).exports = API;