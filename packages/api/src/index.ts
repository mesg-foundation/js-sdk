import { IApi } from './types'
import Account from './account'
import Event from './event'
import Execution from './execution'
import Instance from './instance'
import Ownership from './ownership'
import Process from './process'
import Service from './service'
import Runner from './runner'

export default class API implements IApi {

  account: Account
  event: Event
  execution: Execution
  instance: Instance
  ownership: Ownership
  process: Process
  service: Service
  runner: Runner

  constructor(endpoint: string) {
    this.account = new Account(endpoint)
    this.event = new Event(endpoint)
    this.execution = new Execution(endpoint)
    this.instance = new Instance(endpoint)
    this.ownership = new Ownership(endpoint)
    this.process = new Process(endpoint)
    this.service = new Service(endpoint)
    this.runner = new Runner(endpoint)
  }
} 
