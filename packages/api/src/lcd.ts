import Service from './service-lcd'
import Instance from './instance-lcd'

class API {
  service: Service
  instance: Instance
  
  constructor(endpoint: string = "http://localhost:1317") {
    this.service = new Service(endpoint)
    this.instance = new Instance(endpoint)
  }
}

export default API;
(module).exports = API;