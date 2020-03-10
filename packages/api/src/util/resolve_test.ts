import { Test } from 'tape'
import test from 'tape'
import * as sinon from 'sinon'
import { resolveSID } from './resolve'
import Api from '../lcd'
import { IService } from '../service-lcd'
import { IInstance } from '../instance-lcd'

const instances: IInstance[] = [{ hash: 'instancehash', serviceHash: 'servicehash', envHash: '' }]
const services: IService[] = [{ hash: 'servicehash', sid: 'servicesid', configuration: {} }]

test('resolve service invalid', async function (t: Test) {
  t.plan(1);
  const api = new Api()
  const sid = "invalid"
  sinon.stub(api.instance, 'get').callsFake(() => { throw new Error("not found") })
  sinon.stub(api.service, 'list').callsFake(() => Promise.resolve(services))
  try {
    await resolveSID(api, sid)
  } catch (e) {
    t.ok(e)
  }
});

test('resolve service by sid', async function (t: Test) {
  t.plan(1);
  const api = new Api()
  const sid = "servicesid"
  sinon.stub(api.instance, 'get').callsFake(() => { throw new Error("not found") })
  sinon.stub(api.service, 'list').callsFake(() => Promise.resolve(services))
  sinon.stub(api.instance, 'list').callsFake(() => Promise.resolve(instances))
  const instanceHash = await resolveSID(api, sid)
  t.equal(instanceHash, instances[0].hash)
});

test('resolve service by sid (multiple)', async function (t: Test) {
  t.plan(1);
  const api = new Api()
  const sid = "multiplesid"
  sinon.stub(api.instance, 'get').callsFake(() => { throw new Error("not found") })
  sinon.stub(api.service, 'list').callsFake(() => Promise.resolve([{ sid, configuration: {} }, { sid, configuration: {} }]))
  try {
    await resolveSID(api, sid)
  } catch (e) {
    t.equal(e.message, "multiple services resolve multiplesid")
  }
});
