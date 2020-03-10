import fetch from 'node-fetch'
import { resolve } from 'url'

export default class LCDClient {
  private _endpoint: string

  constructor(endpoint: string = "http://localhost:1317") {
    this._endpoint = endpoint
  }

  protected async query(path: string, data?: any, method: string = 'GET'): Promise<{ height: string, result: any }> {
    const result = method === 'GET'
      ? await this.getRequest(path, data)
      : await this.postRequest(path, data)
    if (result.error) throw new Error(result.error)
    return result
  }

  protected async getRequest(path: string, params?: any): Promise<any> {
    const response = await fetch(this.fullEndpoint(path, params), {
      headers: {
        "Content-Type": "application/json"
      }
    })
    return response.json()
  }

  protected async postRequest(path: string, data?: Object): Promise<any> {
    const response = await fetch(this.fullEndpoint(path), {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json"
      }
    })
    return response.json()
  }

  private fullEndpoint(path: string, params?: any): string {
    const encodedParams = Object.keys(params || {})
      .map((key) => `${key}=${params[key]}`)
      .join('&')
    return [
      resolve(this._endpoint, path),
      encodedParams
    ]
      .filter(x => x)
      .join('?')
  }
}