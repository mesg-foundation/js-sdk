import { IApi } from './types'
import Event from './event'
import Execution from './execution'
import Instance from './instance'
import Ownership from './ownership'
import Process from './process'
import Service from './service'
import Runner from './runner'

class API implements IApi {

  event: Event
  execution: Execution
  instance: Instance
  ownership: Ownership
  process: Process
  service: Service
  runner: Runner

  constructor(endpoint: string) {
    this.event = new Event(endpoint)
    this.execution = new Execution(endpoint)
    this.instance = new Instance(endpoint)
    this.ownership = new Ownership(endpoint)
    this.process = new Process(endpoint)
    this.service = new Service(endpoint)
    this.runner = new Runner(endpoint)
  }
} 

export default API;
(module).exports = API;