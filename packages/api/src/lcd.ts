import Service from './service-lcd'
import Instance from './instance-lcd'
import Runner from './runner-lcd'
import Process from './process-lcd'
import Execution from './execution-lcd'
import Ownership from './ownership'

class API {
  service: Service
  instance: Instance
  runner: Runner
  process: Process
  execution: Execution
  ownership: Ownership

  constructor(endpoint: string = "http://localhost:1317") {
    this.service = new Service(endpoint)
    this.instance = new Instance(endpoint)
    this.runner = new Runner(endpoint)
    this.process = new Process(endpoint)
    this.execution = new Execution(endpoint)
    this.ownership = new Ownership(endpoint)
  }
}

export default API;
(module).exports = API;