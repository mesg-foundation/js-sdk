import Service from './service-lcd'
import Instance from './instance-lcd'
import Runner from './runner-lcd'
import Process from './process-lcd'

class API {
  service: Service
  instance: Instance
  runner: Runner
  process: Process

  constructor(endpoint: string = "http://localhost:1317") {
    this.service = new Service(endpoint)
    this.instance = new Instance(endpoint)
    this.runner = new Runner(endpoint)
    this.process = new Process(endpoint)
  }
}

export default API;
(module).exports = API;