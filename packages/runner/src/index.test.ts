import test, { Test } from 'tape'
import Runner from './index'
import GRPC from './providers/grpc'

const serviceHash = "Bizw1aCYPa5QvC7nJxGTQFaTvfZdAS2hh1BuEZXSdcQe"
const runnerHash = "2R3PDPKuRiqdKbRxKkDJyQtkoAn9AwrPWFx9EJRJ78Ax"

test('grpc', async (t: Test) => {
  const provider = new GRPC("localhost:50052")
  const runner = new Runner(serviceHash, provider)

  t.test('start', async (tt: Test) => {
    tt.plan(2)
    const res = await runner.start({})
    tt.pass()
    tt.equal(res.hash, runnerHash)
  })

  t.test('stop', async (tt: Test) => {
    tt.plan(1)
    await runner.stop(runnerHash)
    tt.pass()
  })
})
