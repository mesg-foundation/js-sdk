import ServiceLCD from './service-lcd'

class API {
  service: ServiceLCD
  constructor(endpoint: string = "http://localhost:1317") {
    this.service = new ServiceLCD(endpoint)
  }
}

export default API;
(module).exports = API;