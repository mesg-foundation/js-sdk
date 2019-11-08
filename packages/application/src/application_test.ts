import { Test } from 'tape'
import test from 'tape'
import * as sinon from 'sinon'
import * as isUUID from 'is-uuid'
import Application from './application';
import Api, { ExecutionStatus, streams } from '@mesg/api/lib/mock'

test('listenEvent() should listen for events and return a stream', (t: Test) => {
  t.plan(2);
  const api = Api('')
  const application = new Application(api);
  const spy = sinon.spy(api.event, 'stream')
  application.listenEvent({ filter: { instanceHash: Buffer.from('1'), key: '2' } })
  const req = spy.getCall(0).args[0]
  t.ok(Buffer.from('1').equals(req.filter.instanceHash))
  t.equal(req.filter.key, '2')
  spy.restore()
});

test('listenResult() should listen for results and return a stream', (t: Test) => {
  t.plan(2);
  const api = Api('');
  const application = new Application(api);
  const spy = sinon.spy(api.execution, 'stream')
  application.listenResult({
    filter: {
      instanceHash: Buffer.from('1'),
      statuses: [ExecutionStatus.COMPLETED]
    }
  })
  const req = spy.getCall(0).args[0]
  t.ok(Buffer.from('1').equals(req.filter.instanceHash))
  t.equal(req.filter.statuses[0], ExecutionStatus.COMPLETED)
  spy.restore()
});

test('executeTask() should execute a task', (t: Test) => {
  t.plan(4);
  const api = Api('');
  const application = new Application(api);
  const spy = sinon.spy(api.execution, 'create')
  application.executeTask({
    instanceHash: Buffer.from('1'),
    taskKey: '2',
    inputs: application.encodeData({ foo: 'bar' }),
    tags: ['4', '5']
  })
  const req = spy.getCall(0).args[0]
  t.ok(Buffer.from('1').equals(req.instanceHash))
  t.equal(req.taskKey, '2')
  t.equal(application.decodeData(req.inputs).foo, 'bar')
  t.same(req.tags, ['4', '5'])
  spy.restore()
});

test('executeTask() should resolve promise with reply', (t: Test) => {
  t.plan(1);
  const api = Api('');
  const application = new Application(api);
  const reply = { hash: Buffer.from('1') }
  const stub = sinon.stub(api.execution, 'create').callsFake(res => Promise.resolve(reply))
  application.executeTask({
    instanceHash: Buffer.from('2'),
    taskKey: '3',
    inputs: {}
  }).then(reply => t.ok(Buffer.from('1').equals(reply.hash)))
  stub.restore()
});

test('executeTask() should reject promise with err', (t: Test) => {
  t.plan(1);
  const api = Api('');
  const application = new Application(api);
  const stub = sinon.stub(api.execution, 'create').callsFake(() => Promise.reject(new Error('1')))
  application.executeTask({
    instanceHash: Buffer.from('2'),
    taskKey: '3',
    inputs: {}
  }).catch((err) => t.equal(err.message, '1'))
  stub.restore()
});

test('executeTaskAndWaitResult() should listen for results', (t: Test) => {
  t.plan(1);
  const api = Api('');
  const application = new Application(api);
  const spy = sinon.spy(api.execution, 'stream')
  application.executeTaskAndWaitResult({ instanceHash: Buffer.from('1'), taskKey: '2', inputs: {} })
  const req = spy.getCall(0).args[0]
  t.ok(Buffer.from('1').equals(req.filter.instanceHash))
  spy.restore()
});

test('executeTaskAndWaitResult() should reject and cancel result stream on `error` event', (t: Test) => {
  t.plan(2);
  const api = Api('');
  const application = new Application(api);
  const spy = sinon.spy(streams.execution, 'cancel')
  application.executeTaskAndWaitResult({ instanceHash: Buffer.from('2'), taskKey: '3', inputs: {} })
    .catch((err) => t.equal(err, '1'))
  streams.execution.emit('error', '1')
  t.ok(spy.called)
  spy.restore()
});

test('executeTaskAndWaitResult() should resolve and cancel result stream on first `data` event', (t: Test) => {
  t.plan(2);
  const api = Api('');
  const application = new Application(api);
  const spy = sinon.spy(streams.execution, 'cancel')
  application.executeTaskAndWaitResult({ instanceHash: Buffer.from('2'), taskKey: '3', inputs: {} })
    .then((result) => t.equal(result.hash, '2'))
  streams.execution.emit('data', { hash: '2' })
  t.ok(spy.called)
  spy.restore()
});

test('executeTaskAndWaitResult() should execute task', (t: Test) => {
  t.plan(4);
  const api = Api('');
  const application = new Application(api);
  const spy = sinon.spy(api.execution, 'create')
  application.executeTaskAndWaitResult({ instanceHash: Buffer.from('2'), taskKey: '3', inputs: application.encodeData({ foo: 'bar' }) })
  streams.execution.emit('metadata', { get() { return ['ready'] } })
  const req = spy.getCall(0).args[0]
  t.ok(Buffer.from('2').equals(req.instanceHash))
  t.equal(req.taskKey, '3')
  t.equal(application.decodeData(req.inputs).foo, 'bar')
  t.ok(isUUID.v4(req.tags[0]))
  spy.restore()
});